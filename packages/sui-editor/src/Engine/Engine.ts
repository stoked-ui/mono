import * as React from 'react';
import BTree from "sorted-btree";
import {namedId, getFileName, MediaFile} from "@stoked-ui/media-selector";
import { type ITimelineAction, type IController, type IEngine, type ITimelineTrack, type ITimelineActionInput } from '@stoked-ui/timeline';
import {Events, type EventTypes} from './events';
import {Emitter} from "./emitter";

const PLAYING = 'playing';
const PAUSED = 'paused';
type PlayState = 'playing' | 'paused';

export type EngineOptions = {
  viewer?: HTMLElement;
  id: string;
  controllers?: Record<string, IController>;
}

/**
 * Timeline player
 * Can be run independently of the editor
 * @export
 * @class Engine
 * @extends {Emitter<EventTypes>}
 */
export class Engine extends Emitter<EventTypes> implements IEngine {

  private _viewer: HTMLElement | null = null;

  private _renderer: HTMLCanvasElement | null = null;

  private  _renderWidth: number = 0;

  private _renderHeight: number = 0;

  private _screener: HTMLVideoElement | null = null;

  private _stage: HTMLDivElement | null = null;

  private _renderCtx: CanvasRenderingContext2D | null = null

  setTracks: React.Dispatch<React.SetStateAction<ITimelineTrack[]>> | undefined = undefined;

  constructor(params: EngineOptions ) {
    super(new Events());
    this._editorId = params.id;
    if (params?.viewer) {
      this.viewer = params.viewer;
    }
    if (params?.controllers) {
      this._controllers = params.controllers;
    }
  }

  get screener() {
    return this._screener;
  }

  set action(action: ITimelineAction) {
    this._actionMap[action.id] = action;
    const track = this._actionTrackMap[action.id];
    this.setTracks?.((prev) => {
      return prev.map((prevTrack) => {
        if (track.id === prevTrack.id) {
          const actionIndex = track.actions.indexOf(action);
          prevTrack.actions[actionIndex] = action;
        }
        return {...prevTrack, actions: [...prevTrack.actions] }
      })
    })
  }

  get action(): ITimelineAction | undefined {
    const vals = Object.values(this._actionMap)
    if (vals.length) {
      return vals[0];
    }
    return undefined;
  }

  set viewer(viewer: HTMLElement) {
    this._viewer = viewer;
    const renderer = viewer.querySelector(`#${this._editorId} div[role='renderer']`) as HTMLCanvasElement;
    this._screener = viewer.querySelector(`#${this._editorId} video[role='screener']`) as HTMLVideoElement;
    this._stage = viewer.querySelector(`#${this._editorId} div[role='stage']`) as HTMLDivElement;
    if (renderer) {
      this._renderer = renderer;
      const ctx = renderer.getContext('2d');
      if (ctx) {
        this._renderCtx = ctx;
      }
    }

    this._viewerUpdate();
    if (this.renderer && this.viewer && this.renderCtx) {
      this._loading = false;
    } else {
      throw new Error('Assigned a viewer but could not locate the renderer, renderCtx, or' +
                      ' preview elements.\n' +
                      'Please ensure that the viewer has the following children:\n' +
                      `  - renderer (canvas with working 2d context): ${this.renderer}` +
                      `  - viewer: ${this.viewer}`);
    }
  }

  get viewer(): HTMLElement | null {
    return this._viewer;
  }

  get stage(): HTMLDivElement | null {
    return this._stage;
  }

  get duration() {
    const actions = Object.values(this._actionMap);
    let end = 0;
    for(let i = 0; i < actions.length; i += 1) {
      if (actions[i].end > end) {
        end = actions[i].end;
      }
    }
    return end;
  }

  get renderer(): HTMLCanvasElement | null {
    return this._renderer;
  }

  set renderer(canvas: HTMLCanvasElement) {
    this._renderer = canvas;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // ctx.canvas.width = ctx.canvas.clientWidth;
        // ctx.canvas.height = ctx.canvas.clientHeight;
      }

      if (!ctx) {
        throw new Error('Could not get 2d context from renderer');
      }
      this._renderCtx = ctx;
    }
  }


  get renderCtx() {
    if (this._renderCtx) {
      this._renderCtx.canvas.width = this.renderWidth;
      this._renderCtx.canvas.height = this.renderHeight;
    }
    return this._renderCtx;
  }

  setRenderView(width: number, height: number) {
    this._renderWidth = width;
    this._renderHeight = height;
  }

  get renderWidth() {
    return this._renderWidth || 1920
  }

  get renderHeight() {
    return this._renderHeight || 1080
  }

  private _editorId: string;

  private _loading = true;

  /** requestAnimationFrame timerId */
  private _timerId: number = 0;

  /** Playback rate */
  private _playRate = 1;

  /** current time */
  private _currentTime: number = 0;

  /** Playback status */
  private _playState: PlayState = 'paused';

  /** Time frame pre data */
  private _prev: number = 0;

  /** Action actionType map */
  private _controllers: Record<string, IController> = {};

  /** Action map that needs to be run */
  private _actionMap: Record<string, ITimelineAction> = {};

  private _actionTrackMap: Record<string, ITimelineTrack> = {};

  /** Action ID array sorted in positive order by action start time */
  private _actionSortIds: string[] = [];

  /** The currently traversed action index */
  private _next: number = 0;

  /** The action time range contains the actionId list of the current time */
  // private _activeIds: string[] = [];

  private _activeIds: BTree = new BTree<string, number>();

  getAction(actionId: string) {
    return {
      action: this._actionMap[actionId],
      track: this._actionTrackMap[actionId]
    };
  }

  getActionTrack(actionId: string) {
    return this._actionTrackMap[actionId];
  }

  getSelectedActions() {
    const actionTracks: {action: ITimelineAction, track: ITimelineTrack}[] = [];
    for (const [key, ] of this._activeIds.entries()) {
      const action = this._actionMap[key];
      if (action.selected) {
        actionTracks.push({ action, track: this._actionTrackMap[key] });
      }
    }
    return actionTracks;
  }


  get loading() {
    return this._loading;
  }

  /** Whether it is playing */
  get isPlaying() {
    return this._playState === 'playing';
  }

  /** Whether it is paused */
  get isPaused() {
    return this._playState === 'paused';
  }

  set controllers(controllers: Record<string, IController>) {
    this._controllers = controllers;
  }

  set tracks(tracks: ITimelineTrack[]) {
    if (this.isPlaying) {
      this.pause();
    }
    this._dealData(tracks);
    this._dealClear();
    this._dealEnter(this._currentTime);
  }

  // eslint-disable-next-line class-methods-use-this
  async buildTracks(controllers: Record<string, IController>, actionData: ITimelineActionInput[]): Promise<ITimelineTrack[]> {
    try {
      if (actionData) {
        const actions = actionData.map((actionInput, index) => {
          const action = actionInput as ITimelineAction;
          // console.log('actionInput.src 1', actionInput.src)
          action.src = action.src.indexOf('http') !== -1 ? action!.src : `${window.location.href}${action!.src}`;
          // console.log('actionInput.src 2', actionInput.src)
          action.src = action.src.replace(/([^:]\/)\/+/g, "$1");
          // console.log('actionInput.src 3', actionInput.src)
          if (!action.name) {
            const fullName = getFileName(action.src, true);
            const name = getFileName(action.src);
            if (!name || !fullName) {
              throw new Error('no action name available');
            }
            action.name = name;
            action.fullName = fullName;
          } else {
            action.fullName = getFileName(action.name, true)!;
            action.name = getFileName(action.name)!;
          }

          action.controller = controllers[action.controllerName];

          if (!action.id) {
            action.id = namedId('mediaFile');
          }
          if (!action.z) {
            action.z = index;
          } else {
            action.staticZ = true;
          }
          if (!action.layer) {
            action.layer = 'foreground';
          }
          return action;
        })
        const preload = actions.map((action) => action.controller.preload ? action.controller.preload({action, engine: this }) : action)
        const loadedActions = await Promise.all(preload);

        const filePromises = loadedActions.map((action) => MediaFile.fromAction(action as any));
        const mediaFiles = await Promise.all(filePromises);
        const tracks = mediaFiles.map((file) => {
          const loadedAction = actionData.find((a) => a!.src === file.url);
          if (!loadedAction) {
            throw new Error(`Action input not found for file ${JSON.stringify(actionData, null, 2)} - ${file.url}`);
          }
          const action = {
            ...loadedAction, file, name: file.name, src: loadedAction.src, id: loadedAction.id,
          } as ITimelineAction
          const trackGenId = namedId('track')
          return {
            id: trackGenId,
            name: action.name ?? trackGenId,
            actions: [action],
            hidden: false,
            lock: false
          } as ITimelineTrack;
        })
        return tracks;
      }
      return [];
    } catch (ex) {
      console.error('buildTracks:', ex);
      return [];
    }
  }

  /**
   * Set playback rate
   * @memberof Engine
   */
  setPlayRate(rate: number): boolean {
    if (rate <= 0) {
      console.error('Error: rate cannot be less than 0!');
      return false;
    }
    const result = this.trigger('beforeSetPlayRate', { rate, engine: this });
    if (!result) {
      return false;
    }
    this._playRate = rate;
    this.trigger('afterSetPlayRate', { rate, engine: this });

    return true;
  }

  /**
   * Get playback rate
   * @memberof Engine
   */
  getPlayRate() {
    return this._playRate;
  }

  /**
   * Re-render the current time
   * @return {*}
   * @memberof Engine
   */
  reRender() {
    if (this.isPlaying) {
      return;
    }
    this._tickAction(this._currentTime);
  }

  /**
   * Set playback time
   * @param {number} time
   * @param {boolean} [isTick] Whether it is triggered by a tick
   * @memberof Engine
   */
  setTime(time: number, isTick?: boolean): boolean {
    const result = isTick || this.trigger('beforeSetTime', { time, engine: this });
    if (!result) {
      return false;
    }

    this._currentTime = time;

    this._next = 0;
    this._dealLeave(time);
    this._dealEnter(time);

    if (isTick) {
      this.trigger('setTimeByTick', { time, engine: this });
    }
    else {
      this.trigger('afterSetTime', { time, engine: this });
    }
    return true;
  }

  /**
   * Get the current time
   * @return {*} {number}
   * @memberof Engine
   */
  getTime(): number {
    return this._currentTime;
  }

  /**
   * Run: The start time is the current time
   * @param param
   * @return {boolean} {boolean}
   */
  play(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean {
    const { toTime, autoEnd } = param;

    const currentTime = this.getTime();
    /** The current state is being played or the running end time is less than the start time, return directly */
    if (this.isPlaying || (toTime && toTime <= currentTime)) {
      return false;
    }

    // Set running status
    this._playState = PLAYING;

    // activeIds run start
    this._startOrStop('start');

    // trigger event
    this.trigger('play', { engine: this });

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({ now: time, autoEnd, to: toTime });
    });

    return true;
  }

  /**
   * Pause playback
   * @memberof Engine
   */
  pause() {
    if (this.isPlaying) {
      this._playState = PAUSED;
      // activeIds run stop
      this._startOrStop('stop');

      this.trigger('paused', { engine: this });
    }
    cancelAnimationFrame(this._timerId);
  }

  /** Playback completed */
  private _end() {
    this.pause();
    this.trigger('ended', { engine: this });
  }

  private _assignElements() {
    const getEditorRole = (role: string) => {
      return document.querySelector(`#${this._editorId} [role=${role}]`)
    }
    const renderer = getEditorRole('renderer');
    if (renderer) {
      this.renderer = renderer as HTMLCanvasElement;
    }
  }

  private _viewerUpdate() {
    this._assignElements()
    const controllers: IController[] = Object.values(this._controllers);
    for (let i = 0; i < controllers.length; i += 1){
      const actionType = controllers[i];
      if (actionType?.viewerUpdate) {
        actionType.viewerUpdate(this);
      }
    }
  }

  private _verifyLoaded() {
    if (this.loading) {
      const notReadyYet = new Error('start or stop before finished loading')
      console.error(notReadyYet);
      return false
    }
    return true;
  }

  private _startOrStop(type?: 'start' | 'stop') {
    if (!this._verifyLoaded()) {
      return;
    }
    for (const key of this._activeIds.keys()) {
      console.log(`Key: ${key}`);
      const action = this._actionMap[key];

      if (type === 'start' && action?.controller?.start) {
        action.controller.start({action, time: this.getTime(), engine: this});
      } else if (type === 'stop' && action?.controller?.stop) {
        action.controller.stop({action, time: this.getTime(), engine: this});
      }
    }

    /*
    this._activeIds.forEach((v, actionId) => {
      const action = this._actionMap[actionId];
      if (action) {
        const controller = action.controller;
        if (type === 'start' && controller?.start) {
          controller.start({action, time: this.getTime(), engine: this});
        } else if (type === 'stop' && controller?.stop) {
          controller.stop({action, time: this.getTime(), engine: this});
        }
      }
    }); */
  }

  /** Execute every frame */
  private _tick(data: { now: number; autoEnd?: boolean; to?: number }) {
    if (!this._verifyLoaded()) {
      return;
    }

    if (this.isPaused) {
      return;
    }
    const { now, autoEnd, to } = data;

    // Calculate the current time
    let currentTime = this.getTime() + (Math.min(1000, now - this._prev) / 1000) * this._playRate;
    this._prev = now;

    // Set the current time
    if (to && to <= currentTime) {
      currentTime = to;
    }
    this.setTime(currentTime, true);

    // Execute action
    this._tickAction(currentTime);
    // In the case of automatic stop, determine whether all actions have been executed.
    if (!to && autoEnd && this._next >= this._actionSortIds.length && this._activeIds.length === 0) {
      this._end();
      return;
    }

    // Determine whether to terminate
    if (to && to <= currentTime) {
      this._end();
    }

    if (this.isPaused) {
      return;
    }
    this._timerId = requestAnimationFrame((time) => {
      this._tick({ now: time, autoEnd, to });
    });
  }

  /** tick runs actions */
  private _tickAction(time: number) {
    if (!this._verifyLoaded() || !this._renderCtx) {
      return;
    }
    this._dealEnter(time);
    this._dealLeave(time);

    this._renderCtx!.clearRect(0, 0, this.renderWidth, this.renderHeight)
    // render
    const iterator = this._activeIds.entries();
    let current: { id: string, val: number } | undefined = undefined;
    const getNext = () => {
      const next = iterator.next();
      if (next.done) {
        return false;
      }
      current = {id: next.value[0], val: next.value[1] };
      return true;
    }
    const renderPass: string[] = [];
    while (getNext()) {
      const action = this._actionMap[current!.id];
      renderPass.push(`${action.z}:${action.controllerName}:${action.name}`)
      if (action.controller && action.controller?.update) {
        const track = this._actionTrackMap[action.id];
        const actionTrack = {...action, hidden: track.hidden, lock: track.lock };
        action.controller.update({action: actionTrack, time: this.getTime(), engine: this});
      }
    }
    console.log(renderPass.join(' => '));
  }

  setScrollLeft(left: number) {
    this.trigger('setScrollLeft', { left, engine: this });
  }

  /** Reset active data */
  private _dealClear() {
    while (this._activeIds.size > 0) {
      const minKey = this._activeIds.minKey(); // Get the smallest entry in the BTree
      if (minKey) {
        const action = this._actionMap[minKey];
        console.log(`Deleting Key: ${minKey}, Value: ${action}`);
        this._activeIds.delete(minKey); // Delete the current smallest key

        if (action) {
          const controller = action.controller;
          if (controller?.leave) {
            controller.leave({action, time: this.getTime(), engine: this});
          }
        }
      }
    }
    this._next = 0;
  }

  /** Process action time enter */
  private _dealEnter(time: number) {

    // add to active
    while (this._actionSortIds[this._next]) {
      const actionId = this._actionSortIds[this._next];
      const action = this._actionMap[actionId];

      if (!action.disable) {
        // Determine whether the action start time has arrived

        if (action.start > time) {
          break;
        }
        // The action can be executed and started
        if (action.end > time && !this._activeIds.has(actionId)) {
          const controller = action.controller;
          if (controller && controller?.enter) {
            controller.enter({action, time: this.getTime(), engine: this});
          }

          this._activeIds.set(actionId, action.z);
        }
      }
      this._next += 1;
    }
  }

  /** Handle action time leave */
  private _dealLeave(time: number) {
    const keysToDelete: string[] = [];
    const keys = Array.from(this._activeIds.keys());
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i]; // Get the smallest entry in the BTree
      const action = this._actionMap[key];

      // Not within the playback area
      if (action.start > time || action.end < time) {
        const controller = this._controllers[action.controllerName];

        if (controller && controller?.leave) {
          controller.leave({action, time: this.getTime(), engine: this});
        }

        keysToDelete.push(key);
      }
    }
  }

  /** Data processing */
  private _dealData(tracks: ITimelineTrack[]) {
    const actions: ITimelineAction[] = [];
    tracks?.forEach((track) => {
      actions.push(...track.actions);
      track.actions.forEach((action) => {
        this._actionTrackMap[action.id] = track;
      })
    });
    const sortActions = actions.sort((a, b) => a.start - b.start);
    const actionMap: Record<string, ITimelineAction> = {};
    const actionSortIds: string[] = [];

    sortActions.forEach((action) => {
      actionSortIds.push(action.id);
      actionMap[action.id] = { ...action };
    });
    this._actionMap = actionMap;
    this._actionSortIds = actionSortIds;
  }
}
