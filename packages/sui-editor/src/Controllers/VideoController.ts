import { Controller, ControllerParams, IEngine, ITimelineAction } from "@stoked-ui/timeline";

class VideoControl extends Controller {
  cacheMap: Record<string, HTMLVideoElement> = {};

  cacheFrameSync: Record<string, number> = {};

  _videoItem: HTMLVideoElement | null = null;

  constructor() {
    super({
      id: 'video',
      name: 'Video',
      color: '#7299cc',
      colorSecondary: '#7299cc',
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async preload(params: Omit<ControllerParams, 'time'>) {
    const { action, engine } = params;
    const item = document.createElement('video') as HTMLVideoElement;
    this.cacheMap[action.id] = item;
    return new Promise((resolve, reject) => {
      try {
        if (!item) {
          reject(new Error(`Video not loaded ${action.name} - ${action.src}`))
          return;
        }
        item.addEventListener('loadedmetadata', () => {
          action.duration = item.duration;
          action.element = item;
          document.body?.appendChild(item);
          resolve(action);
        });
        item.autoplay = false;
        item.loop = true;
        item.muted = true;
        item.width = engine.renderWidth;
        item.height = engine.renderHeight;
        item.style.display = 'none';
        item.style.width = '25%';
        item.style.top = '0px';
        item.style.left = '0px';
        item.src = action.src;

      } catch (ex) {
        reject(ex);
      }
    })
  }

  // eslint-disable-next-line class-methods-use-this
  private _goToAndStop(item: HTMLVideoElement, time: number) {
    if (Number.isNaN(time)) {
      return;
    }
    const duration = item.duration * 1000;
    time *= 1000;
    if (time > duration) {
      time %= duration;
    }
    item.currentTime = time / 1000;
    item.pause();
  }

  // eslint-disable-next-line class-methods-use-this
  canvasSync(engine: IEngine, item: HTMLVideoElement, action: ITimelineAction) {
    // const fpsInfo = document.querySelector("#fps-info");
    // const metadataInfo =  document.querySelector("#metadata-info");

    // button.addEventListener('click', () => video.paused ? video.play() : video.pause());

    const { renderCtx, renderer } = engine;
    if (!renderer || !renderCtx) {
      return;
    }

    item.addEventListener('play', () => {
      if (!('requestVideoFrameCallback' in HTMLVideoElement.prototype)) {
        return alert('Your browser does not support the `Video.requestVideoFrameCallback()` API.');
      }
    });

    /* let width = renderer.width;
    let height = renderer.height;
 */
    // let paintCount = 0;
    let startTime = 0.0;

    const updateCanvas = (now, metadata) => {
      if (startTime === 0.0) {
        startTime = now;
      }

      renderCtx.drawImage(item, 0, 0, engine.renderWidth, engine.renderHeight);

      // const elapsed = (now - startTime) / 1000.0;
      // const fps = (++paintCount / elapsed).toFixed(3);
      // fpsInfo.innerText = !isFinite(fps) ? 0 : fps;
      // metadataInfo.innerText = JSON.stringify(metadata, null, 2);

      action.frameSyncId = item.requestVideoFrameCallback(updateCanvas);
    };

    action.frameSyncId = item.requestVideoFrameCallback(updateCanvas);
    setTimeout(() => {item.currentTime += 0.0001}, 10);
  };


  isVideoPlaying(video: HTMLVideoElement) {
    return !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
  }

  enter(params: ControllerParams) {
    const { action, time, engine} = params;
    console.log('video enter', time)
    let item: HTMLVideoElement;
    if (this.cacheMap[action.id] || action.element) {
      if (!this.cacheMap[action.id]) {
        this.cacheMap[action.id] = action.element;
      }
      item = this.cacheMap[action.id] || action.element;
      this.canvasSync(engine, item, action);
      if (engine.isPlaying) {
        item = this.cacheMap[action.id];
        item.play();
      }
    } else if (!action.hidden && engine.renderer){
      this.preload({engine, action})
        .then((loadedAction) => {
          item = (loadedAction as ITimelineAction).element as HTMLVideoElement;
          this.canvasSync(engine, (loadedAction as ITimelineAction).element, action)
          if (engine.isPlaying) {
            item.play();
          }
        })
    }

  }

  getActionTime(time: number, action: ITimelineAction) {
    const startDelta = time - action.start;
    const durationAdjusted = action.duration ? startDelta % action.duration : startDelta;;
    return durationAdjusted;
  }

  start(params: ControllerParams) {
    const { engine, action, time } = params;
    console.log('video start', time)
    if (engine.isPlaying) {
      const item = this.cacheMap[action.id];
      item.play();
    }
  }

  stop(params: ControllerParams) {
    const { action, time } = params;
    const item = this.cacheMap[action.id];
    item.pause();
  }

  update(params: ControllerParams) {
    /* const { action, time, engine } = params;
    console.log('video update', time)
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (action.hidden) {
      //item.style.display = 'none';
      return;
    }
    const { renderCtx, renderer } = engine;
    if (!renderCtx || !renderer) {
      return;
    } */

    // console.log(this.isVideoPlaying(item));
    // item.currentTime = this.getActionTime(time, action);
    // renderCtx.drawImage(item, 0, 0, engine.renderWidth, engine.renderHeight);
    // this._goToAndStop(item, item.currentTime );
  }

  leave(params: ControllerParams) {
    const { action, time, engine} = params;
    const item = this.cacheMap[action.id];
    engine.renderCtx?.clearRect(0, 0, engine.renderWidth, engine.renderHeight);

    if (!item) {
      return;
    }
    if (time > action.end || time < action.start) {
      item.style.display = 'none';
    } else {
      item.style.display = 'flex';
    }
    if (action.frameSyncId) {
      item.cancelVideoFrameCallback(action.frameSyncId);
    }
    this.stop(params);

  }

  destroy() {
    Object.values(this.cacheMap).forEach(video => {
      video.remove();
    });
    this.cacheMap = {};
  }
}

export { VideoControl };
const VideoController = new VideoControl();
export default VideoController;
