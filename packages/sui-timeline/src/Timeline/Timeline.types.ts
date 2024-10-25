import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import { type IController } from '../Engine/Controller.types';
import {TimelineClasses} from './timelineClasses';
import {type ITimelineTrack} from "../TimelineTrack/TimelineTrack.types";
import {type TimelineLabelsProps} from "../TimelineLabels/TimelineLabels.types";
import {type TimelineState} from "./TimelineState";
import TimelineControl, {TimelineControlProps} from "../TimelineControl";
import {IEngine, ViewMode} from "../Engine/Engine.types";
import {ITimelineFile} from "../TimelineFile/TimelineFile";
import { MediaFile } from '@stoked-ui/media-selector';

export type TimelineComponent = ((
  props: TimelineProps & React.RefAttributes<HTMLDivElement>,
) => React.JSX.Element) & { propTypes?: any };

export interface TimelineSlots {
  /**
   * Element rendered at the root.
   * @default TimelineRoot
   */
  root?: React.ElementType;
  labels?: React.ElementType;
  control?: React.ElementType;
}

export interface TimelineSlotProps {
  root?: SlotComponentProps<'div', {}, TimelineProps>;
  labels?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  control?: SlotComponentProps<typeof TimelineControl, {}, TimelineControlProps>;
}

export interface TimelineProps
  extends React.HTMLAttributes<HTMLDivElement> {
  detailMode?: boolean,

  children?: React.ReactNode;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: TimelineSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: TimelineSlotProps;
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<TimelineClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  labelsSx?: SxProps<Theme>;
  labelSx?: SxProps<Theme>;
  controlSx?: SxProps<Theme>;
  trackSx?: SxProps<Theme>;

  tracks?: ITimelineTrack[];
  setTracks?: React.Dispatch<React.SetStateAction<ITimelineTrack[] | null>>;
  controllers?: Record<string, IController>;
  timelineState?: React.RefObject<TimelineState>;
  viewSelector?: string;
  engineRef?: React.RefObject<IEngine>;
  labels?: boolean;

  scaleWidth?: number;
  setScaleWidth?: (scaleWidth: number) => void;
  file?: ITimelineFile;
  viewMode?: ViewMode;

  detailRenderer?: boolean;
  locked?: boolean;

  onAddFiles?: (mediaFiles: MediaFile[]) => void;
}
