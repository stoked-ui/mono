import * as React from 'react';
import Editor from '@stoked-ui/editor';
import { cloneDeep } from 'lodash';
import { namedId } from '@stoked-ui/media-selector';
import {TimelineFile} from "@stoked-ui/timeline";

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export const actions = [
  {
    id: namedId('action'),
    name: 'write stuff',
    start: 9.5,
    end: 16,
    controllerName: 'animation',
    src: '/static/timeline/docs/overview/lottie1.json',
  },
  {
    id: namedId('action'),
    name: 'doing things',
    start: 5,
    end: 9.5,
    controllerName: 'animation',
    src: '/static/timeline/docs/overview/lottie2.json',
  },
  {
    id: namedId('action'),
    name: 'stolen cow',
    start: 0,
    end: 5,
    controllerName: 'animation',
    src: '/static/timeline/docs/overview/lottie3.json',
  },
  {
    id: namedId('action'),
    name: 'music',
    start: 0,
    end: 20,
    controllerName: 'audio',
    src: '/static/timeline/docs/overview/funeral.m4a',
    /* src:'https://archive.org/download/radiohead-ok-computer-oknotok-1997-2017-remastered/02%20Paranoid%20Android%20%28Remastered%29.mp3', */
  },
  {
    id: namedId('action'),
    name: 'video',
    start: 0,
    end: 10,
    controllerName: 'video',  // Use the new video effect
    src: '/static/editor/stock-loop.mp4',
    style: { width: '100%'}
  },
];
const defaultEditorData = cloneDeep(actions);

export default function Hero() {

  return (
      <Editor id='editor-sandbox' sx={{ width: '100%'}} file={new TimelineFile({ actionData: defaultEditorData})} />
  );
}
