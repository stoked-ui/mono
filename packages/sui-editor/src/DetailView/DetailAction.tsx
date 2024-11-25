import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ActionDetail,
  ITimelineTrackDetail
} from '@stoked-ui/timeline';
import ControlledText from "./ControlledText";
import {
  CtrlCell,
  DetailActions,
  useEditMode
} from './Detail'
import {
  actionSchema, DetailViewProps,
  IEditorActionDetail,
  IEditorProjectDetail
} from "./Detail.types";
import { useEditorContext } from "../EditorProvider/EditorContext";

export function DetailAction(props: DetailViewProps) {
  const { selectedTrack, selectedAction, dispatch } = useEditorContext();
  const { editMode, enableEdit, disableEdit } = props;
  const data = props.detail as ActionDetail;
  const {
    control,
    handleSubmit: detailHandleSubmit,
    formState: {
      isDirty,
      errors,
    },
    reset,
  } = useForm<ActionDetail<IEditorProjectDetail, ITimelineTrackDetail, IEditorActionDetail>>({
    mode: 'onChange',
    defaultValues: data,
    // @ts-ignore
    resolver: yupResolver(actionSchema),
  });

  // Form submit handler
  const onSubmitAction: SubmitHandler<IEditorActionDetail> = (submitData: IEditorActionDetail) => {
    dispatch({ type: 'UPDATE_ACTION', payload: submitData });
  };

  React.useEffect(() => {
    dispatch({ type: 'SET_SETTING', payload: {
        value: {
          detailSubmit: onSubmitAction,
          detailHandleSubmit,
        }
      }})
  }, [])

  if (!selectedAction || !selectedTrack) {
    return undefined;
  }

  return (
    <React.Fragment>
      <CtrlCell width="40%">
        <ControlledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'Start'}
          prefix={'action'}
          control={control}
          disabled={!editMode}
          onClick={enableEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'end'}
          prefix={'action'}
          control={control}
          disabled={!editMode}
          onClick={enableEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          prefix={'action'}
          className={'whitespace-nowrap flex-grow flex'}
          label={'Coordinates'}
          name={['x', 'y', 'z']}
          control={control}
          disabled={!editMode}
          onClick={enableEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'y'}
          control={control}
          disabled={!editMode}
          onClick={enableEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'Width'}
          control={control}
          disabled={!editMode}
          onClick={enableEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'Height'}
          control={control}
          disabled={!editMode}
          onClick={enableEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
          label={'Start Trim'}
          control={control}
          disabled={!editMode}
          onClick={enableEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
          label={'End Trim'}
          control={control}
          disabled={!editMode}
          onClick={enableEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
          label={'Duration'}
          control={control}
          onClick={enableEdit}
        />
      </CtrlCell>
      <DetailActions errors={errors} isDirty={isDirty} reset={reset} disableEdit={disableEdit} editMode={editMode} />
    </React.Fragment>)
}
