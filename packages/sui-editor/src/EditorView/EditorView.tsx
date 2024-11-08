import * as React from 'react';
import {IMediaFile} from '@stoked-ui/media-selector';
import {ITimelineFileProps, useTimeline} from "@stoked-ui/timeline";
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import composeClasses from "@mui/utils/composeClasses";
import {useSlotProps} from '@mui/base/utils';
import useForkRef from "@mui/utils/useForkRef";
import {createUseThemeProps, styled} from '../internals/zero-styled';
import {EditorViewProps} from './EditorView.types';
import {getEditorViewUtilityClass} from "./editorViewClasses";
import {useEditorContext} from "../EditorProvider";
import {keyframes} from "@emotion/react";
import Loader from "../Editor/Loader";
import EditorFile, {editorFileCache, IEditorFileProps} from '../Editor/EditorFile';
import {useContext} from "react";
import { IEditorFileTrack } from "../EditorTrack/EditorTrack";

const useThemeProps = createUseThemeProps('MuiEditorView');

const useUtilityClasses = <R extends IMediaFile, Multiple extends boolean | undefined>(
  ownerState: EditorViewProps<R, Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getEditorViewUtilityClass, classes);
};

const EditorViewRoot = styled('div', {
  name: "MuiEditorView",
  slot: "root"
})<{ loading: boolean }>(({ loading }) => {
  const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `;
  const anim = `2.5s cubic-bezier(0.35, 0.04, 0.63, 0.95) 0s infinite normal none running ${spin}`;
  return {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  '& .lottie-canvas': {
    width: '1920px!important',
    height: '1080px!important'
  },
  '& #settings': {
    alignSelf: 'bottom'
  },
  '& #tri-loader':{
    zIndex: 1000,
    animation: anim,
    transformOrigin: '50% 65%',
    '& svg': {
      transformOrigin: '50% 65%',
      '& polygon': {
        strokeDasharray: 17, animation: anim, transformOrigin: '0px 0px',
      }
    }
  }
}});

const Renderer = styled('canvas', {
  name: "MuiEditorViewRenderer",
  slot: "renderer",
  shouldForwardProp: (prop) => prop !== 'viewMode',
})(() => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  width: '100%',
  height: '100%'
/*   background: `repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0.2) 10px,
    rgba(0, 0, 0, 0.3) 10px,
    rgba(0, 0, 0, 0.3) 20px
  ),
  url(http://s3-us-west-2.amazonaws.com/s.cdpn.io/3/old_map_@2X.png)` */
}));

const Screener = styled('video', {
  name: "MuiEditorViewScreener",
  slot: "screener",
  shouldForwardProp: (prop) => prop !== 'viewMode',
})(() => ({
  display: 'none',
  flexDirection: 'column',
  width: '100%',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  zIndex: 50,
}));

const Stage = styled('div', {
  shouldForwardProp: (prop) => prop !== 'viewMode',
})(() => ({
  display: 'none',
  flexDirection: 'column',
  width: 'fit-content',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  vIndex: 100,
}));

/**
 *
 * Demos:
 *
 * - [FileExplorer View](https://stoked-ui.github.io/editor/docs/)
 *
 * API:
 *
 * - [FileExplorer API](https://stoked-ui.github.io/editor/api/)
 */
const EditorView = React.forwardRef(function EditorView<
  R extends IMediaFile = IMediaFile,
  Multiple extends boolean | undefined = undefined,
>(
  inProps: EditorViewProps<R, Multiple>,
  ref: React.Ref<HTMLDivElement>
): React.JSX.Element {
  const editorContext = useEditorContext();
  const { id, file, engine, isMobile } = editorContext;
  const timelineContext = useTimeline();
  console.log('isMobile', isMobile);
  const props = useThemeProps({ props: inProps, name: 'MuiEditorView' });
  const viewRef = React.useRef<HTMLDivElement>(null);
  const combinedViewRef = useForkRef(ref , viewRef);

  const [showSettings, setShowSettings] = React.useState<boolean>(false);
  const [showSettingsPanel, setShowSettingsPanel] = React.useState<boolean>(false);
  const [, setViewerSize] = React.useState<{w: number, h: number}>({w: 0, h: 0});
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const rendererRef = React.useRef<HTMLCanvasElement>(null);
  const screenerRef = React.useRef<HTMLVideoElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);


  React.useEffect(() => {
    if (engine && viewRef?.current) {
      engine.viewer = viewRef.current;
      if (viewRef.current.parentElement) {
        viewRef.current.id = `viewer-${id}`
        viewRef.current.classList.add(id);
      }
    }
  }, [viewRef, engine])

  // tie the renderer to the editor
  React.useEffect(() => {
    if (rendererRef.current && viewRef.current) {
      if (!rendererRef.current.id && viewRef.current.parentElement) {
        rendererRef.current.id = `renderer-${id}`
        rendererRef.current.classList.add(id);
      }
    }
  })

  // tie the renderer to the editor
  React.useEffect(() => {
    if (screenerRef.current && viewRef.current) {
      if (!screenerRef.current.id && viewRef.current.parentElement) {
        screenerRef.current.id = `screener-${id}`
        screenerRef.current.classList.add(id);
      }
    }
  })

  // tie the renderer to the editor
  React.useEffect(() => {
    if (stageRef.current && viewRef.current) {
      if (!stageRef.current.id && viewRef.current.parentElement) {
        stageRef.current.id = `stage-${id}`
        stageRef.current.classList.add(id);
      }
    }
  })

  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? EditorViewRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    ownerState: {...props, ref: viewRef },
  });

  const saveHandler = async () => {
    const newFile = new EditorFile(file as IEditorFileProps<IEditorFileTrack>);
    file?.save();
  }
  // if the viewer resizes make the renderer match it
  React.useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let i = 0; i < entries.length; i += 1){
        const entry = entries[i];
        if (entry.target === viewerRef.current) {
          setViewerSize({w: entry.contentRect.width, h: entry.contentRect.height});
          if (rendererRef.current) {
            rendererRef.current.width = entry.contentRect.width;
            rendererRef.current.height = entry.contentRect.height;
            rendererRef.current.style.top = `-${rendererRef.current.height}px`;
          }
        }
      }
    });
    return () => {
      resizeObserver.disconnect()
    }
  }, [viewerRef]);

  function handleClose() {

    setShowSettingsPanel(false);
  }
  return (<Root role={'viewer'}
                {...rootProps}
                ref={combinedViewRef}
                data-preserve-aspect-ratio
                onMouseEnter={() => {
                  setShowSettings(true)

                }}
                onMouseLeave={() => {
                  setShowSettings(false)
                }}
  >

    <Loader />
    <Renderer role={'renderer'} style={{backgroundColor: file?.backgroundColor}} ref={rendererRef}
              data-preserve-aspect-ratio/>
    <Screener role={'screener'} ref={screenerRef}/>
    <Stage role={'stage'} ref={stageRef}/>
    {showSettings && (<React.Fragment>
      {file && <IconButton
        id={'save'}
        aria-label="save"
        sx={{
          position: 'absolute',
          right: '40px',
          alignContent: 'top',
          borderRadius: '24px',
          margin: '8px'
        }}
        onClick={saveHandler}
      >
        <SaveIcon/>
      </IconButton>}
      <IconButton
        id={'settings'}
        aria-label="settings"
        sx={{
          position: 'absolute',
          right: '0px',
          alignContent: 'top',
          borderRadius: '24px',
          margin: '8px'
        }}
        onClick={() => {

          setShowSettingsPanel(true)
        }}
      >
        <SettingsIcon/>
      </IconButton>
    </React.Fragment>)}
  </Root>)
})

export default EditorView;
