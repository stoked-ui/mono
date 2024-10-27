import {Emitter, Engine,  ITimelineTrack, ScreenerBlob } from '@stoked-ui/timeline';
import {EditorEvents, EditorEventTypes} from './events';
import {
  IEditorEngine,
  EditorEngineState,
  ScreenVideoBlob, EditorEngineOptions
} from "./EditorEngine.types";


/**
 * Timeline player
 * Can be run independently of the editor
 * @export
 * @class Engine
 * @extends {Engine<EditorState, EditorEventTypes>}
 */
export default class EditorEngine extends Engine<EditorEngineState, EditorEventTypes> implements IEditorEngine<EditorEventTypes> {

  emitter: Emitter<EditorEventTypes>;

  _recorder?: MediaRecorder;

  _recordedChunks: Blob[] = [];

  constructor(params: EditorEngineOptions ) {
    super({...params});
    this.emitter = new Emitter<EditorEventTypes>(params.events ?? new EditorEvents())
    if (params?.viewer) {
      this.viewer = params.viewer;
    }
    if (params?.controllers) {
      this._controllers = params.controllers;
    }
  }

  set tracks(tracks: ITimelineTrack[]) {
    this._dealData(tracks);
    this._dealClear();
    this._dealEnter(this._currentTime);
  }

  /** Whether it is playing */
  get isPlaying() {
    return this._state === 'playing' || this.isRecording;
  }

  /** Whether it is playing */
  get isRecording() {
    return this._state === 'recording';
  }
/*

  async getVersionKeys(id: string) {
    const matchingKeys = await getKeysStartingWithPrefix('editor', 'video', id)
    return matchingKeys.map((match) => {
      const parts = match.split('|');
      return { id: parts[0], version: Number(parts[1]), key: match} as Version;
    })
  }

  async getVersions(id: string): Promise<ScreenerBlob[]> {
    const versions = await this.getVersionKeys(id);
    const promises = versions.map((version) => EditorEngine.loadVersion(version.key))
    return Promise.all(promises);
  }

  static async loadVersion(dbKey: string): Promise<ScreenerBlob> {
    const db = await openDB('editor', 1);
    const store = db.transaction('video').objectStore('video');
    return store.get(dbKey);
  };
*/

  displayVersion(screenerBlob: ScreenerBlob) {
    ScreenVideoBlob(screenerBlob, this);
  }

/*
  finalizeVideo() {
    if (!this.renderer || !this.screener || !this.stage) {
      return;
    }
    const blob = new Blob(this._recordedChunks, {
      type: "video/mp4",
    });

    const dbKey = `${this._editorId}|${versions.length + 1}`;
    const version = VideoVersionFromKey(dbKey);
    const screenerBlob = { blob, key: dbKey, version: version.version, name: version.id, created: Date.now(), size: blob.size };
    saveVersion(screenerBlob).then(() => {
      setVersions([...versions, version]);
    });

    const url = ScreenVideoBlob(screenerBlob, this);
    setVideoURLs((prev) => [url, ...prev]);
    this._recordedChunks = [];
    this.pause();
    this._recorder = undefined;
  }; */


  /**
   * Run: The start time is the current time
   * @param param
   * @return {boolean} {boolean}
   */
  record(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number; /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean {
    const {toTime, autoEnd} = param;

    const currentTime = this.getTime();

    /** The current state is being played or the running end time is less than the start time, return directly */
    if (this.isPlaying || (toTime && toTime <= currentTime)) {
      return false;
    }

    this._state = 'recording' as EditorEngineState;
    // activeIds run start
    this._startOrStop('start');
    // trigger event
    this.trigger('record', {engine: this});

    // Set running status

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({now: time, autoEnd, to: toTime});
    });
/*
    // Get the video stream from the canvas renderer
    const videoStream = this.renderer?.captureStream();

    // Get the Howler audio stream
    const audioContext = Howler.ctx;
    const destination = audioContext.createMediaStreamDestination();
    Howler.masterGain.connect(destination);
    const audioStream = destination.stream;

    // Get audio tracks from video elements
    const videoElements = document.querySelectorAll('video');
    const videoAudioStreams: MediaStreamTrack[] = [];
    videoElements.forEach((video) => {
      const videoElement = video as HTMLVideoElement & { captureStream?: () => MediaStream };

      if (videoElement.captureStream) {
        const videoStream = videoElement.captureStream();
        videoStream.getAudioTracks().forEach((track) => {
          videoAudioStreams.push(track);
        });
      }
    });

    // Combine Howler and video audio streams
    const combinedAudioStream = new MediaStream([
      ...audioStream.getAudioTracks(),
      ...videoAudioStreams,
    ]);

    // Combine the video and audio streams
    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...combinedAudioStream.getAudioTracks(),
    ]);

    // Create the MediaRecorder with the combined stream
    this._recorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/mp4',
    });
    // setMediaRecorder(recorder);
    // setRecordedChunks([]);
    this._recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this._recordedChunks.push(e.data);
        // setRecordedChunks([...recordedChunks]);
      }
    };

    this._recorder.onstop = () => {
      if (!this.screener || !this.renderer || !this.stage) {
        console.warn("recording couldn't stop");
        return;
      }
      this.pause();
      this.finalizeRecording();
    };

    this._recorder.start(100); // Start recording

     */
    return true;
  }
}

