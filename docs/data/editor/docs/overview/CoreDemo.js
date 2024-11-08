import * as React from 'react';
import Editor, {EditorProvider} from '@stoked-ui/editor';
import { TimelineFile } from '@stoked-ui/timeline';
import { cloneDeep } from 'lodash';

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export const actions = [
  {
    name: 'write stuff',
    start: 9.5,
    end: 16,
    controllerName: 'animation',
    data: {
      src: '/static/timeline/docs/overview/writing.lottie',
    },
  },
  {
    name: 'doing things',
    start: 5,
    end: 9.5,
    controllerName: 'animation',
    data: {
      src: '/static/timeline/docs/overview/writing.lottie',
    },
  },
  {
    name: 'stolen cow',
    start: 0,
    end: 5,
    controllerName: 'animation',
    data: {
      src: '/static/timeline/docs/overview/writing.lottie',
    },
  },
  {
    name: 'music',
    start: 0,
    end: 20,
    controllerName: 'audio',
    data: {
      src: '/static/timeline/docs/overview/bg.mp3',
    },
  },
  {
    name: 'video',
    start: 0,
    end: 10,
    controllerName: 'video', // Use the new video effect
    data: {
      src: '/static/video-editor/stock-loop.mp4',
      style: {
        width: '100%',
      },
    },
  },
];

export default function CoreDemo() {
  return (
    <EditorProvider actions={actions}>
      <Editor
        id={'video-editor'}
        sx={{ borderRadius: '12px 12px 0 0' }}
      />
    </EditorProvider>
  );
}
