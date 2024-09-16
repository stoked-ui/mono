import * as React from 'react';
import PropTypes from 'prop-types';
import {alpha, emphasize, styled} from '@mui/material/styles';
import composeClasses from '@mui/utils/composeClasses';
import Typography from '@mui/material/Typography';
// import clsx from 'clsx';
// import useSlotProps from '@mui/utils/useSlotProps';
import {shouldForwardProp} from '@mui/system/createStyled';
import {DEFAULT_ADSORPTION_DISTANCE, DEFAULT_MOVE_GRID} from '../interface/const';
import {
  getScaleCountByPixel, parserTimeToPixel, parserTimeToTransform, parserTransformToTime,
} from '../utils/deal_data';
import TimelineTrackDnd from '../TimelineTrack/TimelineTrackDnd';
import {
  RndDragCallback,
  RndDragEndCallback,
  RndDragStartCallback,
  RndResizeCallback,
  RndResizeEndCallback,
  RndResizeStartCallback,
  RowRndApi,
} from '../TimelineTrack/TimelineTrackDnd.types';
import {getTimelineActionUtilityClass} from './timelineActionClasses';
import {prefix} from '../utils/deal_class_prefix';
import {
  type TimelineActionOwnerState,
  type TimelineActionProps
} from './TimelineAction.types';
import {type ITimelineTrack} from '../TimelineTrack/TimelineTrack.types';

export const useActionUtilityClasses = (ownerState: TimelineActionOwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    left: ['left'],
    right: ['right'],
    selected: ['selected'],
    flexible: ['flexible'],
    movable: ['movable'],
    disable: ['disable'],
  };

  return composeClasses(slots, getTimelineActionUtilityClass, classes);
};

const Action = styled('div', {
  name: 'MuiTimelineAction',
  slot: 'root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'selected',
})<{
  selected: boolean;
  color: string;
  size?: number;
}>(({ theme, color = 'blue', size }) => {
  /* const base = theme.vars ? `rgba(color(from ${color}) / 1)` : alpha(color, 1);
  const unselected = emphasize(color, 0.7);
  const hover = emphasize(color, 0.45);
  const selectedColor = emphasize(color, 0.3);
  const background = selected ? selectedColor : unselected; */
  // console.log('color', color)
  return {
    position: 'absolute',
    left: 0,
    top: 0,
    background: `linear-gradient(to right, ${theme.palette.background.default} 1px, transparent 1px)`,
    backgroundSize: size ? `${size}px` : undefined,
    backgroundColor: `${emphasize(color, 0.10)}`,
    alignContent: 'center',
    padding: '0 0 0 10px',
    overflow: 'hidden',
    textWrap: 'nowrap',
    height: '100%',
    borderTop: `1px solid ${theme.palette.action.hover}`,
    borderBottom: `1px solid ${theme.palette.action.hover}`,
    userSelect: 'none',
    '&:hover': {
      backgroundColor:   `${emphasize(color, 0.15)}`,
    },
    variants: [{
      props: {
        selected: true
      },
      style: {
        backgroundColor: `${color}`,
        '&:hover': {
          backgroundColor:   `${emphasize(color, 0.05)}`,
        },
      }
    }]
  };
});

const LeftStretch = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  width: '10px',
  borderRadius: '4px',
  height: '100%',
  overflow: 'hidden',
  left: 0,
  '&:hover': {
    '&::after': {
      borderLeftColor: theme.palette.text.primary,
    }
  },
  '&::after': {
    position: 'absolute',
    top: 0,
    bottom: 0,
    margin: 'auto',
    bordeRadius: '4px',
    borderTop: '28px solid transparent',
    borderBottom: '28px solid transparent',
    left: 0,
    content: "''",
    borderLeft: `7px solid ${theme.palette.action.disabled}`,
    borderRight: '7px solid transparent',
  },
}));

const RightStretch = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  width: '10px',
  borderRadius: '4px',
  height: '100%',
  overflow: 'hidden',
  right: 0,
  '&:hover': {
    '&::after': {
      borderRightColor: theme.palette.text.primary,
    }
  },
  '&::after': {
    position: 'absolute',
    top: 0,
    bottom: 0,
    margin: 'auto',
    bordeRadius: '4px',
    borderTop: '28px solid transparent',
    borderBottom: '28px solid transparent',
    right: 0,
    content: "''",
    borderLeft: '7px solid transparent',
    borderRight: `7px solid ${theme.palette.action.disabled}`,
  },
}));



const ActionLabel = styled('div', {
  name: 'MuiTimelineAction',
  slot: 'root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'color',
})<{
  color: string;
}>(({ theme }) => {

  const bgColor = alpha(theme.palette.background.default, theme.palette.action.focusOpacity * 4);
  return {
    padding: '3px 6px',
    display: 'flex',
    width: 'min-content',
    borderRadius: '4px',
    background: bgColor,
    position: 'sticky',
    right: 0,
    alignSelf: 'end'
  }
});

function TimelineAction(props: TimelineActionProps) {
  const { action, setTracks, ...restProps } = props;
  const { selected, flexible = true, movable = true, disable } = action;
  const state = { selected, flexible, movable, disable };
  const ownerStateProps = { ...state, ...restProps, ...action, setTracks };
  const { onKeyDown, ...ownerState } = ownerStateProps;
  const classes = useActionUtilityClasses(ownerState as TimelineActionOwnerState);
  /* const classNamesNew = Object.keys(classes).reduce((result, key) => {
    const classKey = classes[key];
    result[classKey] = !!state[key];
    return result;
  }, {}); */

  /*
    const { slotProps = {} } = props;
      const rootProps = useSlotProps({
      elementType: TimelineAction,
      externalSlotProps: slotProps.root,
      externalForwardedProps: props,
      ownerState,
      className: clsx(props.className, classes.root, classNamesNew),
    });
  */
  /*
  const actionEl = React.useRef(null);
  */
  const rowRnd = React.useRef<RowRndApi>();
  const isDragWhenClick = React.useRef(false);
  const { id, maxEnd, minStart, end, start } = action;
  const {
    track,
    scaleCount,
    setScaleCount,
    controllers,
    startLeft,
    scale,
    scaleWidth,
    maxScaleCount,
    scaleSplitCount,
  } = props;
  // get the maximum minimum pixel range
  const leftLimit = parserTimeToPixel(minStart || 0, {
    startLeft,
    scale,
    scaleWidth,
  });
  const rightLimit = Math.min(
    maxScaleCount * scaleWidth + startLeft, // 根据maxScaleCount限制移动范围
    parserTimeToPixel(maxEnd || Number.MAX_VALUE, {
      startLeft,
      scale,
      scaleWidth,
    }),
  );

  // initialize action coordinate data
  const [transform, setTransform] = React.useState(() => {
    return parserTimeToTransform({ start, end }, { startLeft, scale, scaleWidth });
  });

  React.useEffect(() => {
    if (track.lock) {
      return;
    }
    setTransform(parserTimeToTransform({ start, end }, { startLeft, scale, scaleWidth }));
  }, [end, start, startLeft, scaleWidth, scale]);

  // configure drag grid and its properties
  const gridSize = scaleWidth / scaleSplitCount;

  // actionName
  const classNames = ['action'];
  if (movable && !track.lock) {
    classNames.push('action-movable');
  }
  if (selected) {
    classNames.push('action-selected');
  }
  if (flexible) {
    classNames.push('action-flexible');
  }

  // rootProps.className = classNames.join(' ')

  /** calculate scale count */
  const handleScaleCount = (left: number, width: number) => {
    const curScaleCount = getScaleCountByPixel(left + width, {
      startLeft,
      scaleCount,
      scaleWidth,
    });
    if (curScaleCount !== scaleCount) {
      setScaleCount(curScaleCount);
    }
  };

  const { onActionMoveStart, onActionMoving } = props;
  const handleDragStart: RndDragStartCallback = () => {
    if (track.lock) {
      return;
    }
    if (onActionMoveStart) {
      onActionMoveStart({ action, track });
    }
  };
  const handleDrag: RndDragCallback = ({ left, width }) => {
    if (track.lock) {
      return;
    }
    isDragWhenClick.current = true;

    if (onActionMoving) {
      const { start: dragStart, end: dragEnd } = parserTransformToTime(
        { left, width },
        { scaleWidth, scale, startLeft },
      );
      const result = onActionMoving({ action, track, start: dragStart, end: dragEnd });
      if (result === false) {
        return;
      }
    }
    setTransform({ left, width });
    handleScaleCount(left, width);
  };

  const { tracks, onActionMoveEnd } = props;
  const handleDragEnd: RndDragEndCallback = ({ left, width }) => {
    if (track.lock) {
      return;
    }
    // Computation time
    const { start: dragEndStart, end: dragEndEnd } = parserTransformToTime(
      { left, width },
      { scaleWidth, scale, startLeft },
    );

    // setData
    const rowItem = tracks.find((item) => item.id === track.id);
    const dragEndAction = rowItem.actions.find((item) => item.id === id);
    dragEndAction.start = dragEndStart;
    dragEndAction.end = dragEndEnd;
    setTracks(tracks);

    // executeCallback
    if (onActionMoveEnd) {
      onActionMoveEnd({ action: dragEndAction, track, start: dragEndStart, end: dragEndEnd });
    }
  };

  const { onActionResizeStart, onActionResizing, onActionResizeEnd } = props;

  const handleResizeStart: RndResizeStartCallback = (dir) => {
    if (track.lock) {
      return;
    }
    if (onActionResizeStart) {
      onActionResizeStart({ action, track, dir });
    }
  };

  const handleResizing: RndResizeCallback = (dir, { left, width }) => {
    if (track.lock) {
      return;
    }
    isDragWhenClick.current = true;
    if (onActionResizing) {
      const { start: resizingStart, end: resizingEnd } = parserTransformToTime(
        { left, width },
        { scaleWidth, scale, startLeft },
      );
      const result = onActionResizing({
        action,
        track,
        start: resizingStart,
        end: resizingEnd,
        dir,
      });
      if (result === false) {
        return;
      }
    }
    setTransform({ left, width });
    handleScaleCount(left, width);
  };

  const handleResizeEnd: RndResizeEndCallback = (dir, { left, width }) => {
    if (track.lock) {
      return;
    }
    // calculatingTime
    const { start: resizeEndStart, end: resizeEndEnd } = parserTransformToTime(
      { left, width },
      { scaleWidth, scale, startLeft },
    );

    // Set data
    const rowItem = tracks.find((item) => item.id === track.id);
    const resizeEndAction = rowItem.actions.find((item) => item.id === id);
    resizeEndAction.start = resizeEndStart;
    resizeEndAction.end = resizeEndEnd;
    setTracks(tracks);

    // triggerCallback
    if (onActionResizeEnd) {
      onActionResizeEnd({
        action: resizeEndAction,
        track,
        start: resizeEndStart,
        end: resizeEndEnd,
        dir,
      });
    }
  };

  const nowAction = {
    ...action,
    ...parserTransformToTime(
      { left: transform.left, width: transform.width },
      { startLeft, scaleWidth, scale },
    ),
  };

  const nowRow: ITimelineTrack = {
    ...track,
    actions: [...track.actions],
  };
  if (track.actions.includes(action)) {
    nowRow.actions[track.actions.indexOf(action)] = nowAction;
  }

  const [backgroundImage, setBackgroundImage] = React.useState<null | string>(null);
  React.useEffect(() => {
    try {
      action.controller.getBackgroundImage?.(action).then((img) => {
        // console.log('img', img);
        setBackgroundImage(img);
      });
    } catch (error) {
      console.error('Error applying audio waveform:', error);
    }
  }, [])
  const {
    areaRef,
    gridSnap,
    dragLineData,
    disableDrag,
    deltaScrollLeft,
    onClickAction,
    handleTime,
    onClickActionOnly,
    onDoubleClickAction,
    onContextMenuAction,
    rowHeight,
  } = props;

  return (
    <TimelineTrackDnd
      ref={rowRnd}
      parentRef={areaRef}
      start={startLeft}
      left={transform.left}
      width={transform.width}
      grid={(gridSnap && gridSize) || DEFAULT_MOVE_GRID}
      adsorptionDistance={
        gridSnap
          ? Math.max((gridSize || DEFAULT_MOVE_GRID) / 2, DEFAULT_ADSORPTION_DISTANCE)
          : DEFAULT_ADSORPTION_DISTANCE
      }
      adsorptionPositions={dragLineData.assistPositions}
      bounds={{
        left: leftLimit,
        right: rightLimit,
      }}
      edges={{
        left: !disableDrag && flexible && `.${prefix('action-left-stretch')}`,
        right: !disableDrag && flexible && `.${prefix('action-right-stretch')}`,
      }}
      enableDragging={!disableDrag && movable}
      enableResizing={!disableDrag && flexible}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onResizeStart={handleResizeStart}
      onResize={handleResizing}
      onResizeEnd={handleResizeEnd}
      deltaScrollLeft={deltaScrollLeft}
    >
      <Action
        size={action.file?.duration ? action.file.duration * scaleWidth : undefined}
        id={action.id}
        onKeyDown={(event: any) => {
          event.currentTarget = action;
          action.onKeyDown(event, action.id);
          event.preventDefault();
        }}
        onMouseDown={() => {
          if (track.lock) {
            return;
          }
          isDragWhenClick.current = false;
        }}
        onClick={(e) => {
          if (track.lock) {
            return;
          }
          tracks.forEach((t) => {
            t.actions.forEach((a) => {
              if (a.id === action.id) {
                action.selected = true;
              } else {
                a.selected = false;
              }
            })
          })
          setTracks([...tracks]);
          let time: number;
          if (onClickAction) {
            time = handleTime(e);
            onClickAction(e, {track, action, time});
          }
          if (!isDragWhenClick.current && onClickActionOnly) {
            if (!time) {
              time = handleTime(e);
            }
            onClickActionOnly(e, {track, action, time});
          }
        }}
        onDoubleClick={(e) => {
          if (track.lock) {
            return;
          }
          if (onDoubleClickAction) {
            const time = handleTime(e);
            onDoubleClickAction(e, {track, action, time});
          }
        }}
        onContextMenu={(e) => {
          if (track.lock) {
            return;
          }
          if (onContextMenuAction) {
            const time = handleTime(e);
            onContextMenuAction(e, {track, action, time});
          }
        }}
        className={prefix((classNames || []).join(' '))}
        selected={action.selected}
        style={{
          height: rowHeight - 1, ...(backgroundImage ? {
            backgroundImage,
            backgroundSize: 'contain'
          } : {})
        }}
        color={`${action?.controller?.color}`}
      >
        {flexible && <LeftStretch className={`${prefix('action-left-stretch')} ${classes.left}`}/>}
        {flexible && (<RightStretch className={`${prefix('action-right-stretch')} ${classes.right}`}/>)}
        <ActionLabel color={`${controllers?.controller?.color}`}>
          <Typography variant="body2" color="text.primary" sx={(theme) => ({
            color: `${theme.palette.mode === 'light' ? '#000' : '#FFF'}`, fontWeight: '500',
          })}>
            {action.name}
          </Typography>
        </ActionLabel>

      </Action>
    </TimelineTrackDnd>);
}

TimelineAction.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  action: PropTypes.shape({
    data: PropTypes.shape({
      src: PropTypes.string,
      style: PropTypes.object,
    }),
    disable: PropTypes.bool,
    end: PropTypes.number,
    flexible: PropTypes.bool,
    id: PropTypes.string,
    maxEnd: PropTypes.number,
    minStart: PropTypes.number,
    movable: PropTypes.bool,
    name: PropTypes.string,
    onKeyDown: PropTypes.func,
    selected: PropTypes.bool,
    start: PropTypes.number,
  }),
  /**
   * @description timelineControl action actionType map
   */
  controllers: PropTypes.object,
  areaRef: PropTypes.shape({
    current: PropTypes.object,
  }),
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  /**
   * Cursor time
   */
  cursorTime: PropTypes.number,
  deltaScrollLeft: PropTypes.func,
  /**
   * Whether the action is prohibited from running
   */
  disable: PropTypes.bool,
  /**
   * @description Disable dragging of all action areas
   * @default false
   */
  disableDrag: PropTypes.bool,
  /**
   * @description Start dragging auxiliary line adsorption
   * @default false
   */
  dragLine: PropTypes.bool,
  dragLineData: PropTypes.shape({
    assistPositions: PropTypes.arrayOf(PropTypes.number),
    isMoving: PropTypes.bool,
    movePositions: PropTypes.arrayOf(PropTypes.number),
  }),
  /**
   * @description timelineControl runner, if not passed, the built-in runner will be used
   */
  engine: PropTypes.shape({
    current: PropTypes.any,
  }),
  /**
   * Whether the action is scalable
   */
  flexible: PropTypes.bool,
  /**
   * @description Custom action area rendering
   */
  getActionRender: PropTypes.func,
  /**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when
   *   move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds: PropTypes.func,
  /**
   * @description Custom scale rendering
   */
  getScaleRender: PropTypes.func,
  /**
   * @description Whether to enable grid movement adsorption
   * @default false
   */
  gridSnap: PropTypes.bool,
  handleTime: PropTypes.func,
  /**
   * @description whether to hide the cursor
   * @default false
   */
  hideCursor: PropTypes.bool,
  /**
   * @description Maximum number of scales (>=minScaleCount)
   * @default Infinity
   */
  maxScaleCount: PropTypes.number,
  /**
   * @description Minimum number of ticks (>=1)
   * @default 20
   */
  minScaleCount: PropTypes.number,
  /**
   * Whether the action is movable
   */
  movable: PropTypes.bool,
  /**
   * @description Move end callback (return false to prevent onChange from triggering)
   */
  onActionMoveEnd: PropTypes.func,
  /**
   * @description Start moving callback
   */
  onActionMoveStart: PropTypes.func,
  /**
   * @description Move callback (return false to prevent movement)
   */
  onActionMoving: PropTypes.func,
  /**
   * @description size change end callback (return false to prevent onChange from triggering)
   */
  onActionResizeEnd: PropTypes.func,
  /**
   * @description Start changing the size callback
   */
  onActionResizeStart: PropTypes.func,
  /**
   * @description Start size callback (return false to prevent changes)
   */
  onActionResizing: PropTypes.func,
  /**
   * @description click action callback
   */
  onClickAction: PropTypes.func,
  /**
   * @description Click action callback (not executed when drag is triggered)
   */
  onClickActionOnly: PropTypes.func,
  /**
   * @description Click track callback
   */
  onClickRow: PropTypes.func,
  /**
   * @description Click time area event, prevent setting time when returning false
   */
  onClickTimeArea: PropTypes.func,
  /**
   * @description Right-click action callback
   */
  onContextMenuAction: PropTypes.func,
  /**
   * @description Right-click track callback
   */
  onContextMenuRow: PropTypes.func,
  /**
   * @description cursor drag event
   */
  onCursorDrag: PropTypes.func,
  /**
   * @description cursor ends drag event
   */
  onCursorDragEnd: PropTypes.func,
  /**
   * @description cursor starts drag event
   */
  onCursorDragStart: PropTypes.func,
  /**
   * @description Double-click action callback
   */
  onDoubleClickAction: PropTypes.func,
  /**
   * @description Double-click track callback
   */
  onDoubleClickRow: PropTypes.func,
  /**
   * @description Default height of each edit line (>0, unit: px)
   * @default 32
   */
  rowHeight: PropTypes.number,
  /**
   * @description Single tick mark category (>0)
   * @default 1
   */
  scale: PropTypes.number,
  /**
   * Number of scales
   */
  scaleCount: PropTypes.number,
  /**
   * @description Number of single scale subdivision units (>0 integer)
   * @default 10
   */
  scaleSplitCount: PropTypes.number,
  /**
   * @description Display width of a single scale (>0, unit: px)
   * @default 160
   */
  scaleWidth: PropTypes.number,
  /**
   * Whether the action is selected
   */
  selected: PropTypes.bool,
  setEditorData: PropTypes.func,
  /**
   * Set the number of scales
   */
  setScaleCount: PropTypes.func,
  /**
   * @description Data change callback, which will be triggered after the operation action end
   *   changes the data (returning false will prevent automatic engine synchronization to reduce
   *   performance overhead)
   */
  setTracks: PropTypes.func,
  /**
   * The props used for each component slot.
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   */
  slots: PropTypes.object,
  /**
   * @description The distance from the start of the scale to the left (>=0, unit: px)
   * @default 20
   */
  startLeft: PropTypes.number,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
    ),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * Current timeline width
   */
  timelineWidth: PropTypes.number,
  track: PropTypes.shape({
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.shape({
          src: PropTypes.string,
          style: PropTypes.object,
        }),
        disable: PropTypes.bool,
        end: PropTypes.number,
        flexible: PropTypes.bool,
        id: PropTypes.string,
        maxEnd: PropTypes.number,
        minStart: PropTypes.number,
        movable: PropTypes.bool,
        name: PropTypes.string,
        onKeyDown: PropTypes.func,
        selected: PropTypes.bool,
        start: PropTypes.number,
      }),
    ),
    classNames: PropTypes.arrayOf(PropTypes.string),
    hidden: PropTypes.bool,
    id: PropTypes.string,
    lock: PropTypes.bool,
    name: PropTypes.string,
    rowHeight: PropTypes.number,
    selected: PropTypes.bool,
  }),
  /**
   * @description TimelineControl editing data
   */
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          data: PropTypes.shape({
            src: PropTypes.string,
            style: PropTypes.object,
          }),
          disable: PropTypes.bool,
          end: PropTypes.number,
          flexible: PropTypes.bool,
          id: PropTypes.string,
          maxEnd: PropTypes.number,
          minStart: PropTypes.number,
          movable: PropTypes.bool,
          name: PropTypes.string,
          onKeyDown: PropTypes.func,
          selected: PropTypes.bool,
          start: PropTypes.number,
        }),
      ),
      classNames: PropTypes.arrayOf(PropTypes.string),
      hidden: PropTypes.bool,
      id: PropTypes.string,
      lock: PropTypes.bool,
      name: PropTypes.string,
      rowHeight: PropTypes.number,
      selected: PropTypes.bool,
    }),
  ),
  trackSx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
    ),
    PropTypes.func,
    PropTypes.object,
  ]),
  viewSelector: PropTypes.string,
} as any;

export default TimelineAction;
