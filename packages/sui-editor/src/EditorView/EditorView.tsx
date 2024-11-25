import * as React from 'react';
import PropTypes from 'prop-types';
import { IMediaFile, MediaFile } from '@stoked-ui/media-selector';
import { useTimeline, WebFile, MimeType, EngineState } from '@stoked-ui/timeline';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import OpenIcon from '@mui/icons-material/OpenInBrowser';
import ClearIcon from '@mui/icons-material/Clear';
import composeClasses from '@mui/utils/composeClasses';
import { useSlotProps } from '@mui/base/utils';
import { keyframes } from '@emotion/react';
import {
  Fab,
  Popover,
  SpeedDial,
  SpeedDialAction,
  Stack,
  SxProps,
  Tooltip,
  TooltipProps,
  Zoom,
  alpha,
  tooltipClasses,
} from '@mui/material';
import useForkRef from '@mui/utils/useForkRef';
import { createUseThemeProps, styled } from '../internals/zero-styled';
import { EditorViewProps } from './EditorView.types';
import { getEditorViewUtilityClass } from './editorViewClasses';
import { useEditorContext } from '../EditorProvider/EditorContext';
import Loader from '../Editor/Loader';
import EditorFile from '../EditorFile/EditorFile';

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
  name: 'MuiEditorView',
  slot: 'root',
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
    maxWidth: '100vw',
    aspectRatio: 16 / 9,
    '& .lottie-canvas': {
      width: '1920px!important',
      height: '1080px!important',
    },
    '& #settings': {
      alignSelf: 'bottom',
    },
  };
});

const Renderer = styled('canvas', {
  name: 'MuiEditorViewRenderer',
  slot: 'renderer',
  shouldForwardProp: (prop) => prop !== 'viewMode',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  width: '100%',
  height: '100%',
  minWidth: '480px',
  backgroundColor: theme.palette.background.default,
}));

const Screener = styled('video', {
  name: 'MuiEditorViewScreener',
  slot: 'screener',
  shouldForwardProp: (prop) => prop !== 'viewMode',
})({
  display: 'none',
  flexDirection: 'column',
  width: '100%',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  zIndex: 50,
});

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

function Actions({ visible }: { visible: boolean }) {
  const { dispatch, file } = useEditorContext();

  const [fileIsDirty, setIsDirty] = React.useState<boolean>(false);
  React.useEffect(() => {
    const isFileDirty = async () => {
      const isDirty = await (file as EditorFile)?.isDirty();
      setIsDirty(isDirty);
    };

    isFileDirty().catch();
  }, [file]);

  const saveHandler = async () => {
    if (!file) {
      return;
    }
    await file.save();
    console.info('file saved');
  };

  const openHandler = async () => {
    const input = document.createElement('input') as HTMLInputElement;
    input.type = 'file';

    async function handleFiles() {
      if (!input.files) {
        return;
      }
      const files = Array.from(input.files);
      if (files.length) {
        for (let i = 0; i < files.length; i += 1) {
          const clientFile = files[i];
          // eslint-disable-next-line no-await-in-loop
          const loadedFile = await WebFile.fromBlob<EditorFile>(clientFile);
          dispatch({ type: 'SET_FILE', payload: loadedFile });
        }
      }
    }
    input.addEventListener('change', handleFiles, false);
    input.click();
  };

  return (
    <Stack direction={'column'}>
      <Zoom in={visible && !!file}>
        <Fab
          id={'clear'}
          color={'error'}
          aria-label="clear"
          size="small"
          sx={(theme) => ({
            position: 'absolute',
            left: '0px',
            margin: '8px',
            color: theme.palette.text.primary,
          })}
          onClick={() => {
            dispatch({ type: 'DISCARD_FILE' });
          }}
        >
          <ClearIcon />
        </Fab>
      </Zoom>
      <Stack direction={'row'}>
        {fileIsDirty && visible && (
          <Zoom in={visible}>
            <Fab
              id={'save'}
              aria-label="save"
              size="small"
              color={'secondary'}
              sx={(theme) => ({
                position: 'absolute',
                right: '96px',
                margin: '8px',
                color: theme.palette.text.primary,
              })}
              onClick={saveHandler}
            >
              <SaveIcon />
            </Fab>
          </Zoom>
        )}
        <Zoom in={visible}>
          <Fab
            id={'open'}
            color={'secondary'}
            aria-label="open"
            size="small"
            sx={(theme) => ({
              position: 'absolute',
              right: '48px',
              margin: '8px',
              color: theme.palette.text.primary,
            })}
            onClick={openHandler}
          >
            <OpenIcon />
          </Fab>
        </Zoom>
        <Zoom in={visible}>
          <Fab
            id={'settings'}
            color={'primary'}
            aria-label="settings"
            size="small"
            sx={(theme) => ({
              position: 'absolute',
              right: '0px',
              margin: '8px',
              color: theme.palette.text.primary,
            })}
            onClick={() => {
              dispatch({ type: 'DETAIL_OPEN' });
            }}
          >
            <SettingsIcon />
          </Fab>
        </Zoom>
      </Stack>
    </Stack>
  );
}
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

Actions.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  visible: PropTypes.bool.isRequired,
};

const EditorView = React.forwardRef(function EditorView<
  R extends IMediaFile = IMediaFile,
  Multiple extends boolean | undefined = undefined,
>(inProps: EditorViewProps<R, Multiple>, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
  const editorContext = useEditorContext();
  const { id, file, engine, flags, getState } = editorContext;
  const props = useThemeProps({ props: inProps, name: 'MuiEditorView' });
  const viewRef = React.useRef<HTMLDivElement>(null);
  const combinedViewRef = useForkRef(ref, viewRef);

  const [showActions, setShowSettings] = React.useState<boolean>(false);
  const [showActionsPanel, setShowSettingsPanel] = React.useState<boolean>(false);
  const [, setViewerSize] = React.useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const rendererRef = React.useRef<HTMLCanvasElement>(null);
  const screenerRef = React.useRef<HTMLVideoElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (engine && viewRef?.current) {
      engine.viewer = viewRef.current;
      if (viewRef.current.parentElement) {
        viewRef.current.id = `viewer-${id}`;
        viewRef.current.classList.add(id);
      }
    }
  }, [viewRef, engine]);

  // tie the renderer to the editor
  React.useEffect(() => {
    if (rendererRef.current && viewRef.current) {
      if (!rendererRef.current.id && viewRef.current.parentElement) {
        rendererRef.current.id = `renderer-${id}`;
        rendererRef.current.classList.add(id);
      }
    }
  });

  // tie the renderer to the editor
  React.useEffect(() => {
    if (screenerRef.current && viewRef.current) {
      if (!screenerRef.current.id && viewRef.current.parentElement) {
        screenerRef.current.id = `screener-${id}`;
        screenerRef.current.classList.add(id);
      }
    }
  });

  // tie the renderer to the editor
  React.useEffect(() => {
    if (stageRef.current && viewRef.current) {
      if (!stageRef.current.id && viewRef.current.parentElement) {
        stageRef.current.id = `stage-${id}`;
        stageRef.current.classList.add(id);
      }
    }
  });

  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? EditorViewRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    ownerState: { ...props, ref: viewRef },
  });

  // if the viewer resizes make the renderer match it
  React.useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        if (entry.target === viewerRef.current) {
          setViewerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
          if (rendererRef.current) {
            rendererRef.current.width = entry.contentRect.width;
            rendererRef.current.height = entry.contentRect.height;
            rendererRef.current.style.top = `-${rendererRef.current.height}px`;
          }
        }
      }
    });
    return () => {
      resizeObserver.disconnect();
    };
  }, [viewerRef]);

  function handleClose() {
    setShowSettingsPanel(false);
  }

  const styles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    left: 0,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
    width: '100%',
    height: '100%',
  };

  return (
    <Root
      role={'viewer'}
      {...rootProps}
      ref={combinedViewRef}
      data-preserve-aspect-ratio
      onMouseEnter={() => {
        setShowSettings(true && getState() !== EngineState.LOADING);
      }}
      onMouseLeave={() => {
        setShowSettings(false);
      }}
    >
      <Renderer
        role={'renderer'}
        style={{ backgroundColor: file?.backgroundColor }}
        ref={rendererRef}
        data-preserve-aspect-ratio
      />
      <Screener role={'screener'} ref={screenerRef} />
      <Loader styles={styles} />
      <Stage role={'stage'} ref={stageRef} />
      {false && <Actions visible={showActions} />}
    </Root>
  );
});

EditorView.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default EditorView;
