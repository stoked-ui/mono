import {Howl} from 'howler';
import generateWaveformImage from "./AudioImage";
import MediaController from "../../MediaController/MediaController";
import {
  GetBackgroundImage, MediaControllerParams
} from "../../MediaController/MediaController.types";
import MediaAction from "../../MediaAction/MediaAction";
import AudioFile from "./AudioFile";

class AudioController extends MediaController{
  cacheMap: Record<string, Howl> = {};

  listenerMap: Record<
    string,
    {
      time?: (data: { time: number }) => void;
      rate?: (data: { rate: number }) => void;
    }
  > = {};

  constructor() {
    super({
      color: AudioFile.primaryColor,
      colorSecondary: AudioFile.secondaryColor,
      name: 'Audio',
      id: 'audio',
    });
  }

  enter(params: MediaControllerParams) {
    this.start(params);
  }

  start(params: MediaControllerParams) {
    const { action, time, engine } = params;
    if (!action.data) {
      throw new Error('engine is required to play audio');
    }

    let item: Howl;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      item.rate(engine.getPlayRate());
      item.seek((time - action.start) % item.duration());
      item.play();
    } else {
      item = new Howl({ src: action.data.src, loop: true, autoplay: true });
      this.cacheMap[action.id] = item;
      item.on('load', () => {
        item.rate(engine.getPlayRate());
        item.seek((time - action.start) % item.duration());
      });
    }

    const timeListener = (listenTime: { time: number }) => {
      item.seek(listenTime.time,time);
    };

    const rateListener = (listenRate: { rate: number}) => {
      item.rate(listenRate.rate);
    };

    if (!this.listenerMap[action.id]) {
      this.listenerMap[action.id] = {};
    }

    engine.on('afterSetTime', timeListener);
    engine.on('afterSetPlayRate', rateListener);
    this.listenerMap[action.id].time = timeListener;
    this.listenerMap[action.id].rate = rateListener;
  }

  stop(params: MediaControllerParams) {
    const { action, engine } = params;
    if (this.cacheMap[action.id]) {
      const item = this.cacheMap[action.id];
      item.stop();
      if (this.listenerMap[action.id]) {
        if (this.listenerMap[action.id].time) {
          engine.off('afterSetTime', this.listenerMap[action.id].time);
        }
        if (this.listenerMap[action.id].rate) {
          engine.off('afterSetPlayRate', this.listenerMap[action.id].rate);
        }
        delete this.listenerMap[action.id];
      }
    }
  }

  leave(params: MediaControllerParams) {
    this.stop(params);
  }

  getBackgroundImage?: GetBackgroundImage = async (action: MediaAction) => {
    const blobUrl = await generateWaveformImage(action.data!.src, {
      width: 5000, height: 300, backgroundColor: this.color, // Black
      waveformColor: this.colorSecondary,   // Green waveform
      outputType: 'blob'          // Output a Blob URL
    })
    return `url(${blobUrl})`;
  }
}

const AudioControllerInstance = new AudioController();
export { AudioController };
export default AudioControllerInstance
