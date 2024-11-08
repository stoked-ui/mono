import * as React from 'react';
import { IMediaFile, namedId } from '@stoked-ui/media-selector';
import { isMobile } from 'react-device-detect';
import { Controllers } from '../Controller/AudioController';
import { IController } from "../Controller";
import { ITimelineFile } from "../TimelineFile";
import { EngineState, IEngine } from "../Engine";
import { type ITimelineTrack } from "../TimelineTrack";
import { DEFAULT_MOBILE_ROW_HEIGHT, DEFAULT_TRACK_HEIGHT } from "../interface/const";
import {
  BackgroundImageStyle, initTimelineAction,
  ITimelineAction,
  ITimelineFileAction
} from "../TimelineAction/TimelineAction.types";

export interface ITimelineState<
  EngineType extends IEngine = IEngine,
  State extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
> {
  engine: EngineType,
  file: FileType | null,
  id: string,
  selectedAction: ActionType | null;
  selectedTrack: TrackType | null;
  popovers: Record<string, boolean>;
  snapOptions: string[];
  isMobile: boolean;
  versions: IMediaFile[];
  getState: () => string | State;
  setState: (newState: string | State) => void;
  rowHeight: number;
}

export const onAddFiles = <
  EngineType extends IEngine = IEngine,
  State extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  ControllerType extends IController = IController,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
>(state: ITimelineState<EngineType, State, FileType, ActionType, TrackType>, newMediaFiles: IMediaFile[]) => {
  const { engine, file } = state;

  if (!file) {
    return state;
  }

  const { tracks } = file;
  newMediaFiles = newMediaFiles.filter((mediaFile) => engine.controllers[mediaFile.mediaType])
  const newTracks = newMediaFiles.map((mediaFile) => {
    return {
      id: namedId('track'),
      name: mediaFile.name,
      file: mediaFile,
      controller: Controllers[mediaFile.mediaType] as ControllerType,
      actions: [{
        id: namedId('action'),
        name: file.name,
        start: engine.getTime() || 0,
        end: (engine.getTime() || 0) + 2,
        volumeIndex: -2,
      }] as ActionType[],
      controllerName: mediaFile.mediaType,
    } as ITimelineTrack;
  })
  state.file.tracks = tracks.concat(newTracks);
  return {...state};
}

type SelectActionPayload<
  ActionType extends ITimelineAction,
  TrackType extends ITimelineTrack,
> = {
  action: ActionType | null,
  track: TrackType
};

export type TimelineStateAction<
  FileType extends ITimelineFile = ITimelineFile,
  FileActionType extends ITimelineFileAction = ITimelineFileAction,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
> = {
  type: 'SELECT_ACTION',
  payload: SelectActionPayload<ActionType, TrackType>,
} | {
  type: 'SELECT_TRACK',
  payload: TrackType,
} | {
  type: 'CREATE_ACTION',
  payload: {
    action: FileActionType,
    track: TrackType
  }
} | {
  type: 'CREATE_TRACKS',
  payload: IMediaFile[]
} | {
  type: 'SET_POPOVER',
  payload: { open: boolean, name: string }
} | {
  type: 'SET_SNAP_OPTIONS',
  payload: string[]
} | {
  type: 'LOAD_VERSIONS',
  payload: IMediaFile[]
} | {
  type: 'SET_FILE',
  payload: FileType
} | {
  type: 'SET_TRACKS',
  payload: TrackType[]
} | {
  type: 'SET_ROW_HEIGHT',
  payload: number
} | {
  type: 'UPDATE_ACTION_STYLE',
  payload: {
    action: ActionType,
    backgroundImageStyle: BackgroundImageStyle
  }
}

export type TimelineContextType = ITimelineState & {
  dispatch: React.Dispatch<TimelineStateAction>;
};

export const TimelineContext = React.createContext<TimelineContextType | undefined>(undefined);

export function TimelineReducer(state: ITimelineState, stateAction: TimelineStateAction): ITimelineState {
  switch (stateAction.type) {

    case 'SELECT_TRACK':
      return {
        ...state,
        selectedAction: null,
        selectedTrack: stateAction.payload,
      };
    case 'CREATE_TRACKS': {
      const newState = onAddFiles(state, stateAction.payload);
      newState.engine.setTracks(newState.file?.tracks ?? []);
      return { ...newState };
    }
    case 'SET_TRACKS': {
      const updatedTracks = [...stateAction.payload];
      state.engine.setTracks(updatedTracks);
      if (state.getState() === "loading") {
        state.setState("ready");
      }
      return {
        ...state,
        file: state.file ? { ...state.file, tracks: updatedTracks } : null,
      };
    }
    case 'SET_POPOVER':
      return {
        ...state,
        popovers: {[stateAction.payload.name]: stateAction.payload.open},
      };
    case 'LOAD_VERSIONS':
      return {
        ...state,
        versions: [...stateAction.payload],
      };
    case 'CREATE_ACTION': {
      const { action, track } = stateAction.payload;
      const updatedTracks = state.file?.tracks.map((t, index) =>
        t.id === track.id ? { ...t, actions: [...t.actions, initTimelineAction(state.engine, action, index)] } : t
      ) ?? [];
      return {
        ...state,
        file: state.file ? { ...state.file, tracks: updatedTracks } : null,
      };
    }
    case 'SET_FILE':
      return {
        ...state,
        file: stateAction.payload,
      };
    case 'SET_SNAP_OPTIONS':
      return {
        ...state,
        snapOptions: [...stateAction.payload],
      };
    case 'SET_ROW_HEIGHT': {
      return {
        ...state,
        rowHeight: stateAction.payload,
      }
    }
    case 'UPDATE_ACTION_STYLE': {
      const { action, backgroundImageStyle } = stateAction.payload;
      const updatedTracks = state.file?.tracks.map((t) => {
        t.actions = t.actions.map((a) => {
          if (a.id === action.id) {
            a.backgroundImageStyle = backgroundImageStyle;
          }
          return a;
        })
        return t;
      });
      return {
        ...state,
        file: state.file ? { ...state.file, tracks: [...updatedTracks] } : null,
      };
    }
    default:
      return state;
  }
}

export interface TimelineProviderProps<
  FileType extends ITimelineFile = ITimelineFile,
  EngineType  = IEngine,
  FileActionType extends ITimelineAction = ITimelineAction,
  State extends ITimelineState = ITimelineState,
  StateActionType  = TimelineStateAction
> {
  children: React.ReactNode,
  id?: string,
  file?: FileType,
  controllers?: Record<string, IController>,
  engine?: EngineType,
  reducer?: (state: State, stateAction: StateActionType) => State;
  actions?: FileActionType[],
}

export const initialTimelineState: Omit<ITimelineState, 'engine' | 'getState' | 'setState'> = {
  selectedTrack: null,
  selectedAction: null,
  popovers: { },
  isMobile,
  snapOptions: [],
  versions: [],
  id: 'timeline',
  file: null,
  rowHeight: isMobile ? DEFAULT_MOBILE_ROW_HEIGHT : DEFAULT_TRACK_HEIGHT,
}
