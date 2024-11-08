import * as React from 'react';
import PropTypes from 'prop-types';
import { ITimelineAction, OutputBlob, useTimeline } from '@stoked-ui/timeline';
import {  FileExplorer } from '@stoked-ui/file-explorer';
import {IMediaFile, MediaFile } from '@stoked-ui/media-selector';
import { useSlotProps} from '@mui/base/utils';
import { SxProps } from "@mui/material";
import composeClasses from '@mui/utils/composeClasses';
import Timeline, { type TimelineState, ITimelineTrack } from '@stoked-ui/timeline';
import { createUseThemeProps, styled} from '../internals/zero-styled';
import { useEditor } from '../internals/useEditor';
import { EditorProps} from './Editor.types';
import { EditorPluginSignatures, VIDEO_EDITOR_PLUGINS } from './Editor.plugins';
import {  EditorControls } from '../EditorControls';
import EditorView from '../EditorView';
import { getEditorUtilityClass } from './editorClasses';
import Controllers from "../Controllers";
import initDb from '../db/init'
import {DetailView} from "../DetailView";
import {useEditorContext} from "../EditorProvider";
import { initEditorAction } from "../EditorAction/EditorAction";

const useThemeProps = createUseThemeProps('MuiEditor');

const useUtilityClasses = <R extends IMediaFile, Multiple extends boolean | undefined>(
  ownerState: EditorProps<R, Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    editorView: ['editorView'],
    controls: ['controls'],
    timeline: ['timeline'],
    fileExplorer: ['fileExplorer'],
  };

  return composeClasses(slots, getEditorUtilityClass, classes);
};

const EditorRoot = styled('div', {
  name: 'MuiEditor',
  slot: 'root',
})(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  '& .lottie-canvas': {
    width: '50%',
    backgroundColor: '#ffff00',
  },
  '& .player-panel': {
    width: '100%',
    height: '500px',
    position: 'relative',
    '& .lottie-ani': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
    },
  },
  '& .MuiEditorView-root': {
    overflow: 'hidden',
  },
  overflow: 'hidden',
}));


function createDirectoryFile({dirname, children}: { dirname: string, children: IMediaFile[] }) {
  const versionDir = {
    id: dirname.toLocaleLowerCase(),
    name: dirname,
    expanded: true,
    selected: true,
    mediaType: 'folder',
    icon: null,
    thumbnail: null,
    blob: null,
  };
  const blob = new Blob([JSON.stringify(versionDir)], { type: "inode/directory" });
  const url = URL.createObjectURL(blob);
  const versionFile = new File([blob], versionDir.name, { type: 'inode/directory' });
  const mediaFile =  MediaFile.fromFile(versionFile as IMediaFile);
  mediaFile.children = children;
  return mediaFile;
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
const Editor = React.forwardRef(function Editor<
  R extends IMediaFile = IMediaFile,
  Multiple extends boolean | undefined = undefined,
>(inProps: EditorProps<R, Multiple>, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
  const { file, engine, versions, id, dispatch } = useEditorContext();
  const { sx, ...props } = useThemeProps({ props: inProps, name: 'MuiEditor' });
  const {
    getRootProps,
    getEditorViewProps,
    getControlsProps,
    getTimelineProps,
    getFileExplorerProps,
    instance
  } = useEditor<EditorPluginSignatures, EditorProps<R, Multiple>>({
    plugins: VIDEO_EDITOR_PLUGINS,
    rootRef: ref,
    props,
  });

  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? EditorRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    getSlotProps: getRootProps,
    ownerState: props,
  });

  const EditorViewSlot = slots?.editorView ?? EditorView;
  const editorViewProps = useSlotProps({
    elementType: EditorViewSlot,
    externalSlotProps: slotProps?.editorView,
    className: classes.editorView,
    getSlotProps: getEditorViewProps,
    ownerState: {...props },
  });

  const ControlsSlot = slots?.controls ?? EditorControls;
  const videoControlsProps = useSlotProps({
    elementType: ControlsSlot,
    externalSlotProps: slotProps?.controls,
    className: classes.controls,
    getSlotProps: getControlsProps,
    ownerState: {...props },
  });

  const TimelineSlot = slots?.timeline ?? Timeline;
  const timelineProps = useSlotProps({
    elementType: TimelineSlot,
    externalSlotProps: slotProps?.timeline,
    className: classes.timeline,
    getSlotProps: getTimelineProps,
    ownerState: inProps,
  });

  const Explorer = slots?.fileExplorer ?? FileExplorer;
  const fileExplorerProps = useSlotProps({
    elementType: Explorer,
    externalSlotProps: slotProps?.fileExplorer,
    className: classes.fileExplorer,
    getSlotProps: getFileExplorerProps,
    ownerState: props as any,
  });

  const timelineState = React.useRef<TimelineState>(null);


  const viewerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    initDb('video').then((initResults) => {
      // co nsole.log('db init results', initResults);
    });
  }, []);

  const [startIt, setStartIt] = React.useState(false);
  React.useEffect(() => {

    if (!startIt && file && engine.isLoading && viewerRef.current) {
      setStartIt(true);
      engine.viewer = viewerRef.current;
      if (file.needsGeneration()) {
        file.generateTracks(Controllers, engine, initEditorAction)
          .then(() => {
            dispatch({
              type: 'LOAD_EDITOR_PROPS',
              payload: {
                tracks: file.tracks,
                viewer: viewerRef.current as HTMLDivElement
              }
            });
          })
      }
    }
  }, [viewerRef.current, engine, engine.isLoading]);

  const [mediaFiles, setMediaFiles] = React.useState<IMediaFile[]>([]);
  const [files, setFiles] = React.useState<IMediaFile[]>([]);
  const [saved, setSaved] = React.useState<IMediaFile[]>([])
  const [view, setView] = React.useState<'timeline' | 'files'>('timeline')
  const hiddenSx: SxProps = {position: 'absolute!important', opacity: '0!important', left: '200%'};
  const visibleSx: SxProps = {position: 'static!important', opacity: '1!important'};
  const timelineSx = {...(view === 'files' ? hiddenSx : visibleSx),  width: '100%'};
  const filesSx = view !== 'files' ? hiddenSx : visibleSx ;
  const [currentVersion, setCurrentVersion] = React.useState<string>()

  React.useEffect(() => {
    const actionFilesFolder = createDirectoryFile({ dirname: 'Tracks', children: mediaFiles })
    const versionDir = createDirectoryFile({ dirname: 'Versions', children: saved })
    setFiles([actionFilesFolder, versionDir]);

  }, [mediaFiles, saved])

  React.useEffect(() => {
    if (file?.tracks) {
      const trackFiles  = file.tracks.map((track) => track.file);
      // const tFiles: IMediaFile[] = trackFiles.filter((tf) => tf !== undefined);
      // setMediaFiles(tFiles);
    }
    if (versions?.length) {
      setSaved(versions);
    }
  }, [currentVersion, versions, engine]);

  React.useEffect(() => {
    if ("launchQueue" in window && "setConsumer" in (window.launchQueue as any)) {
      (window.launchQueue as any)?.setConsumer?.((launchParams) => {
        if (launchParams.files && launchParams.files.length) {
          file?.save()
        }
      })
    }
  }, [])

  const timelineRef = React.useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
    context: ITimelineTrack | ITimelineAction;
    type: 'action' | 'track' | 'label'
  } | null>(null);

  const handleContextMenuAction = (event: React.MouseEvent<HTMLElement, MouseEvent>, param: { action: ITimelineAction; track: ITimelineTrack; time: number; }) => {
    event.preventDefault();
    setContextMenu({ mouseX: event.clientX + 2, mouseY: event.clientY - 6, context: param.action, type: 'action' });
  };

  const handleContextMenuTrack = (event: React.MouseEvent<HTMLElement, MouseEvent>, param: { track: ITimelineTrack; time: number; }) => {
    event.preventDefault();
    setContextMenu({ mouseX: event.clientX + 2, mouseY: event.clientY - 6, context: param.track, type: 'track' });
  };

  const handleContextMenuLabel = (event: React.MouseEvent<HTMLElement, MouseEvent>, param: { track: ITimelineTrack; time: number; }) => {
    event.preventDefault();
    setContextMenu({ mouseX: event.clientX + 2, mouseY: event.clientY - 6, context: param.track, type: 'label' });
  };

  const onAddFiles = () => {
    const input = document.createElement('input') as HTMLInputElement;
    input.type = 'file';
    input.onchange =  async (ev) => {
      const addedFiles =  await MediaFile.from(ev)
      dispatch({ type: 'CREATE_TRACKS', payload: addedFiles });
    }
    input.click();
  };

  return (
    <Root role={'editor'} {...rootProps} id={id}>
      <EditorViewSlot {...editorViewProps} ref={viewerRef} />
      <ControlsSlot
        role={'controls'}
        {...videoControlsProps}
        view={view}
        setView={setView}
        versions={versions}
        currentVersion={currentVersion}
        setCurrentVersion={setCurrentVersion}
        disabled={engine.isLoading}
      />
      {!engine.isLoading &&
        <React.Fragment>
          <TimelineSlot
            role={'timeline'}
            {...timelineProps}
            ref={timelineRef}
            controllers={Controllers}
            timelineState={timelineState}
            file={inProps.file}
            onKeyDown={instance.onKeyDown}
            viewSelector={`.MuiEditorView-root`}
            labels
            sx={timelineSx}
            disabled={engine.isLoading}
            onContextMenuLabel={handleContextMenuLabel}
            onContextMenuTrack={handleContextMenuTrack}
            onContextMenuAction={handleContextMenuAction}
            onContextMenu={handleContextMenuLabel}
            onAddFiles={onAddFiles}
          />
          <Explorer
            grid
            role={'file-explorer'}
            id={'editor-file-explorer-renderer'}
            {...fileExplorerProps}
            items={files}
            dndInternal
            dndExternal
            alternatingRows
            defaultExpandedItems={['tracks']}
            sx={filesSx}
            onAddFiles={onAddFiles}
          />
          <DetailView />
        </React.Fragment>
      }
    </Root>);
});

Editor.propTypes = {
  /**
   * The ref object that allows Editor View manipulation. Can be instantiated with
   * `useEditorApiRef()`.
   */
  apiRef: PropTypes.any,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object, className: PropTypes.string,
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures: PropTypes.object,
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  file: PropTypes.any,
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

export default Editor;
