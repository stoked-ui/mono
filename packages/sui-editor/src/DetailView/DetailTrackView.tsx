import * as React from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import { Checkbox, FormControlLabel } from "@mui/material";
import { ITimelineAction } from "@stoked-ui/timeline";
import {SelectChangeEvent} from "@mui/material/Select";
import ControlledText from "./ControlledText";
import {
  CtrlCell,

  CtrlGroup,
  CtrlRow,
  DetailForm,
  DetailTypeProps, DetailViewBase,
  RootBox
} from './Detail'
import {
  getTrackSchema,
  humanFileSize,
  IDetailTrack,
  IDetailFile,

} from "./DetailTrackView.types";
import DesSelect from "./DesSelect";

export default function DetailTrackView(props: DetailTypeProps) {
  const {
    engine,
    detail,
    setDetail,
    setEditMode,
    editMode,
    onClickEdit,
    formRef,
    breadcrumbs,
    formData,
    setFormData,
    tracks: inputTracks,
    schema,
    onClose
  } = props;

  const {
    control,
    handleSubmit,
    getValues,
    register,
    unregister,
    formState: {
      isDirty,
      errors,
      dirtyFields,
      isValid,
      isValidating,
      isSubmitting,
      submitCount
    },
    reset,
    trigger,
    setValue,
  } = useForm<IDetailTrack>({
    mode: 'onChange',
    defaultValues: formData.track,
    resolver: yupResolver(schema.track),
  });

  // Form submit handler
  const onSubmit: SubmitHandler<IDetailTrack> = (dataTrack) => {

    const newDetail = {...detail};
    if (newDetail.track && dataTrack) {
      newDetail.track.name = dataTrack.name;
    }
    setDetail(newDetail);

    const tracks = [...inputTracks];
    const trackIndex = tracks.findIndex((prevTrack) => prevTrack.id === dataTrack.id);
    if (trackIndex !== -1 && dataTrack) {
      tracks[trackIndex].name = dataTrack!.name;
    }
    engine?.setTracks?.(tracks);
  };

  const detailViewBase = {
    title: detail.action?.name ?? detail.track?.name ?? detail.video.name,
    formName: 'track-detail',
    editMode,
    onClickEdit,
    handleSubmit,
    onSubmit,
    detail,
    setDetail,
    errors,
    control,
    formData,
    isDirty,
    reset,
    setEditMode,
    engine,
    onClose
  };
  return (
    <DetailViewBase {...detailViewBase}>
      <CtrlCell width="100%">
        <FormControlLabel control={<Checkbox defaultChecked={detail.track?.hidden} />} label="Hidden" />
        <FormControlLabel control={<Checkbox defaultChecked={detail.track?.lock} />} label="Locked" />
      </CtrlCell>
      <CtrlCell width="100%">
        <ControlledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'Track Name'}
          name={'name'}
          control={control}
          disabled={!editMode}
          onClick={onClickEdit}
        />
      </CtrlCell>
      <CtrlGroup label={'Track File'}>
        <CtrlCell width="70%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'File Name'}
            name={'file.name'}
            control={control}
            disabled={!editMode}
            onClick={onClickEdit}
          />
        </CtrlCell>

        <CtrlCell width="25%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'File Size'}
            control={control}
            disabled
            format={humanFileSize}
          />
        </CtrlCell>
      </CtrlGroup>
      {/* <CtrlGroup label={'Actions'}>
        <CtrlCell width="100%">
          <DesSelect
            control={control}
            label={'Selected Action'}
            name={'actions'}
            disabled={!editMode}
            key={'id'}
            value={'id'}
            width={400}
            format={(action: ITimelineAction) => `${action.start} - ${action.end}`}
            options={detail.track?.actions.map((action) => {
              return {
                value: action.id,
                label: `start: ${action.start}s; end: ${action.end}s`
              }
            })}
            onClick={onClickEdit}
            onChange={(event: SelectChangeEvent, fieldOnChange: (event: SelectChangeEvent, child?: any) => void, child?: any) => {
              fieldOnChange(event, child);
              console.info('event', event, 'child', child)
              const newAction = detail.track?.actions.find((action) => action.id === child.props.value)
              if (!detail.action || (newAction && detail.action.id !== newAction.id)) {
                setDetail({...detail, action: newAction})
              }
            }}
          />
        </CtrlCell> */}
      {detail.action &&
        <React.Fragment>
          <CtrlCell width="40%">
            <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Start'}
            name={'selectedAction.start'}
            control={control}
            disabled={!editMode}
            onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'end'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'x'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'y'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'Width'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'Height'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
              label={'Start Trim'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
              label={'End Trim'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
              label={'Duration'}
              control={control}
              onClick={onClickEdit}
            />
          </CtrlCell>
        </React.Fragment>
      }
    </DetailViewBase>
  );
}
