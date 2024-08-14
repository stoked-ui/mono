import React, { FC, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { TimelineAction, TimelineRow } from '../../interface/action';
import { CommonProp } from '../../interface/common_prop';
import { DEFAULT_ADSORPTION_DISTANCE, DEFAULT_MOVE_GRID } from '../../interface/const';
import { prefix } from '../../utils/deal_class_prefix';
import { getScaleCountByPixel, parserTimeToPixel, parserTimeToTransform, parserTransformToTime } from '../../utils/deal_data';
import { RowDnd } from '../row_rnd/row_rnd';
import { RndDragCallback, RndDragEndCallback, RndDragStartCallback, RndResizeCallback, RndResizeEndCallback, RndResizeStartCallback, RowRndApi } from '../row_rnd/row_rnd_interface';
import { DragLineData } from './drag_lines';

export type EditActionProps = CommonProp & {
  row: TimelineRow;
  action: TimelineAction;
  dragLineData: DragLineData;
  setEditorData: (params: TimelineRow[]) => void;
  handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
  areaRef: React.MutableRefObject<HTMLDivElement>;
  /* setUp scroll left */
  deltaScrollLeft?: (delta: number) => void;
};

const Action = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  backgroundColor: theme.palette.action.selected,
  alignContent: 'center',
  padding: '0 0 0 10px',
  overflow: 'hidden',
  textWrap: 'nowrap',
  borderTop: `1px solid ${theme.palette.action.hover}`,
  borderBottom: `1px solid ${theme.palette.action.hover}`,
}));

const LeftStretch = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  width: '10px',
  borderRadius: '4px',
  height: '100%',
  overflow: 'hidden',
  left: 0,
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


export const EditAction: FC<EditActionProps> = ({
  editorData,
  row,
  action,
  effects,
  rowHeight,
  scale,
  scaleWidth,
  scaleSplitCount = 10,
  startLeft = 20,
  gridSnap,
  disableDrag,

  scaleCount,
  maxScaleCount,
  setScaleCount,
  onActionMoveStart,
  onActionMoving,
  onActionMoveEnd,
  onActionResizeStart,
  onActionResizeEnd,
  onActionResizing,

  dragLineData,
  setEditorData,
  onClickAction,
  onClickActionOnly,
  onDoubleClickAction,
  onContextMenuAction,
  getActionRender,
  handleTime,
  areaRef,
  deltaScrollLeft,
}) => {
  const rowRnd = useRef<RowRndApi>();
  const isDragWhenClick = useRef(false);
  const { id, maxEnd, minStart, end, start, selected, flexible = true, movable = true, effectId } = action;

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
  const [transform, setTransform] = useState(() => {
    return parserTimeToTransform({ start, end }, { startLeft, scale, scaleWidth });
  });

  React.useEffect(() => {
    setTransform(parserTimeToTransform({ start, end }, { startLeft, scale, scaleWidth }));
  }, [end, start, startLeft, scaleWidth, scale]);

  // configure drag grid and its properties
  const gridSize = scaleWidth / scaleSplitCount;

  // actionName
  const classNames = ['action'];
  if (movable) classNames.push('action-movable');
  if (selected) classNames.push('action-selected');
  if (flexible) classNames.push('action-flexible');
  if (effects[effectId]) classNames.push(`action-effect-${effectId}`);

  /** calculate scale count */
  const handleScaleCount = (left: number, width: number) => {
    const curScaleCount = getScaleCountByPixel(left + width, {
      startLeft,
      scaleCount,
      scaleWidth,
    });
    if (curScaleCount !== scaleCount) setScaleCount(curScaleCount);
  };

  //#region [rgba(100,120,156,0.08)] callback
  const handleDragStart: RndDragStartCallback = () => {
    onActionMoveStart && onActionMoveStart({ action, row });
  };
  const handleDrag: RndDragCallback = ({ left, width }) => {
    isDragWhenClick.current = true;

    if (onActionMoving) {
      const { start, end } = parserTransformToTime({ left, width }, { scaleWidth, scale, startLeft });
      const result = onActionMoving({ action, row, start, end });
      if (result === false) return false;
    }
    setTransform({ left, width });
    handleScaleCount(left, width);
  };

  const handleDragEnd: RndDragEndCallback = ({ left, width }) => {
    // 计算时间
    const { start, end } = parserTransformToTime({ left, width }, { scaleWidth, scale, startLeft });

    // setData
    const rowItem = editorData.find((item) => item.id === row.id);
    const action = rowItem.actions.find((item) => item.id === id);
    action.start = start;
    action.end = end;
    setEditorData(editorData);

    // executeCallback
    if (onActionMoveEnd) onActionMoveEnd({ action, row, start, end });
  };

  const handleResizeStart: RndResizeStartCallback = (dir) => {
    onActionResizeStart && onActionResizeStart({ action, row, dir });
  };

  const handleResizing: RndResizeCallback = (dir, { left, width }) => {
    isDragWhenClick.current = true;
    if (onActionResizing) {
      const { start, end } = parserTransformToTime({ left, width }, { scaleWidth, scale, startLeft });
      const result = onActionResizing({ action, row, start, end, dir });
      if (result === false) return false;
    }
    setTransform({ left, width });
    handleScaleCount(left, width);
  };

  const handleResizeEnd: RndResizeEndCallback = (dir, { left, width }) => {
    // calculatingTime
    const { start, end } = parserTransformToTime({ left, width }, { scaleWidth, scale, startLeft });

    // 设置数据
    const rowItem = editorData.find((item) => item.id === row.id);
    const action = rowItem.actions.find((item) => item.id === id);
    action.start = start;
    action.end = end;
    setEditorData(editorData);

    // triggerCallback
    if (onActionResizeEnd) onActionResizeEnd({ action, row, start, end, dir });
  };
  //#endregion

  const nowAction = {
    ...action,
    ...parserTransformToTime({ left: transform.left, width: transform.width }, { startLeft, scaleWidth, scale }),
  };

  const nowRow: TimelineRow = {
    ...row,
    actions: [...row.actions],
  };
  if (row.actions.includes(action)) {
    nowRow.actions[row.actions.indexOf(action)] = nowAction;
  }

  return (
    <RowDnd
      ref={rowRnd}
      parentRef={areaRef}
      start={startLeft}
      left={transform.left}
      width={transform.width}
      grid={(gridSnap && gridSize) || DEFAULT_MOVE_GRID}
      adsorptionDistance={gridSnap ? Math.max((gridSize || DEFAULT_MOVE_GRID) / 2, DEFAULT_ADSORPTION_DISTANCE) : DEFAULT_ADSORPTION_DISTANCE}
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
        onMouseDown={() => {
          isDragWhenClick.current = false;
        }}
        onClick={(e) => {
          let time: number;
          if (onClickAction) {
            time = handleTime(e);
            onClickAction(e, { row, action, time: time });
          }
          if (!isDragWhenClick.current && onClickActionOnly) {
            if (!time) time = handleTime(e);
            onClickActionOnly(e, { row, action, time: time });
          }
        }}
        onDoubleClick={(e) => {
          if (onDoubleClickAction) {
            const time = handleTime(e);
            onDoubleClickAction(e, { row, action, time: time });
          }
        }}
        onContextMenu={(e) => {
          if (onContextMenuAction) {
            const time = handleTime(e);
            onContextMenuAction(e, { row, action, time: time });
          }
        }}
        className={prefix((classNames || []).join(' '))}
        style={{ height: rowHeight }}
      >
        {getActionRender && getActionRender(nowAction, nowRow)}
        {flexible && <LeftStretch className={prefix('action-left-stretch')} />}
        {flexible && <RightStretch className={prefix('action-right-stretch')} />}
      </Action>
    </RowDnd>
  );
};
