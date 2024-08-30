import * as React from 'react';
import { SxProps, Theme } from "@mui/material/styles";
import { SlotComponentProps } from "@mui/material";
import { CSSProperties } from "@mui/system/CSSProperties";
import { TimelineActionClasses } from "./timelineActionClasses";
import { ITimelineTrack } from "../TimelineTrack";
import { DragLineData } from "../DragLines/DragLines.types";
import { CommonProps } from '../interface/common_prop';
import {ITimelineEngine} from "../TimelineEngine/TimelineEngine";

export type TimelineActionParams = {
  action: ITimelineAction;
  time: number;
  engine: ITimelineEngine;
};

export interface ITimelineActionType {
  start?: (params: TimelineActionParams) => void;
  stop?: (params: TimelineActionParams) => void;
  enter?: (params: TimelineActionParams) => void;
  leave: (params: TimelineActionParams) => void;
  update?: (params: TimelineActionParams) => void;
  viewerUpdate?: (engine: any) => void;
  destroy?: () => void;
  color?: string;
}

export interface TimelineActionState {
  /** Whether the action is selected */
  selected?: boolean;
  /** Whether the action is scalable */
  flexible?: boolean;
  /** Whether the action is movable */
  movable?: boolean;
  /** Whether the action is prohibited from running */
  disable?: boolean;
}

export interface ITimelineActionInput extends TimelineActionState {
  /** action id */
  id?: string;
  /** action display name */
  name: string;
  /** Action start time */
  start: number;
  /** Action end time */
  end: number;
  /** The effectId corresponding to the action */
  effectId: string;

  data?: {
    src: string;
    style?: CSSProperties;
  };
}

/**
 *Basic parameters of the action
 * @export
 * @interface ITimelineAction
 */
export interface ITimelineAction extends Omit<ITimelineActionInput, 'id' | 'name' | 'start' | 'end' | 'data'> {
  /** action id */
  id: string;
  /** action display name */
  name?: string;
  /** Action start time */
  start: number;
  /** Action end time */
  end: number;

  /** Minimum start time limit for actions */
  minStart?: number;
  /** Maximum end time limit of action */
  maxEnd?: number;

  onKeyDown?: (event: any, id: string) => void;

  data?: {
    src: string;
    style?: CSSProperties;
  };
}

export interface TimelineActionSlots {
  /**
   * Element rendered at the root.
   * @default TimelineActionRoot
   */
  root?: React.ElementType;

  left?: React.ElementType;

  right?: React.ElementType;
}

export interface TimelineActionSlotProps {
  root?: SlotComponentProps<'div', {}, {}>;
  left?: SlotComponentProps<'div', {}, {}>;
  right?: SlotComponentProps<'div', {}, {}>;
}

export interface TimelineActionProps
  extends TimelineActionState,
    CommonProps,
    Omit<React.HTMLAttributes<HTMLUListElement>, 'id'> {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Overridable component slots.
   */
  slots?: TimelineActionSlots;
  /**
   * The props used for each component slot.
   */
  slotProps?: TimelineActionSlotProps;
  className?: string;

  classes?: Partial<TimelineActionClasses>;
  /**
   * Override or extend the styles applied to the component.
   */
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  track: ITimelineTrack;
  action: ITimelineAction;
  dragLineData: DragLineData;
  setTracks: (tracks: ITimelineTrack[]) => void;
  handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
  areaRef: React.MutableRefObject<HTMLDivElement>;
  /* setUp scroll left */
  deltaScrollLeft?: (delta: number) => void;
}

export interface TimelineActionOwnerState extends Omit<TimelineActionProps, 'action' | 'onKeyDown'>, ITimelineAction  {}
