import * as React from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { ITimelineAction, ITimelineTrack } from "@stoked-ui/timeline";
import DesSelect from "./DesSelect";
import StokedSelect from "./StokedSelect";
import { useEditorContext } from "../EditorProvider";

export default function DetailTracks({ tracks, editMode, detail, onClickEdit, size, sx }) {
  const { dispatch } = useEditorContext();
  return <StokedSelect
    label={'Track'}
    placeholder={'Select Track'}
    name={'tracks'}
    disabled={!editMode}
    key={'id'}
    value={'id'}

    size={size}
    onClick={onClickEdit}
    sx={sx}
    options={tracks?.map((track: ITimelineTrack) => {
      return {
        value: track.id,
        label: track.name
      }
    })}
    onChange={(event: SelectChangeEvent, child?: any) => {
      console.info('event', event, 'child', child)
      const newTrack = tracks.find((track: ITimelineTrack) => track.id === child.props.value);
      if (!detail.track || (newTrack && detail.track.id !== newTrack.id)) {
        dispatch({ type: 'SELECT_TRACK', payload: newTrack });
      }
    }}
  />
}
