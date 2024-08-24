import * as React from 'react';
import composeClasses from "@mui/utils/composeClasses";
import { useSlotProps } from '@mui/base/utils';
import {styled, Theme, useTheme, useThemeProps} from '@mui/material/styles';
import ToggleButton from "@mui/material/ToggleButton";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import { EditorLabelsProps } from './EditorLabels.types';
import { getEditorLabelsUtilityClass } from "./editorLabelsClasses";
import { ToggleButtonGroupSx, contrast } from '@stoked-ui/core/styles';
import {TimelineTrack} from "@stoked-ui/timeline";

const useUtilityClasses = (
  ownerState: EditorLabelsProps,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    label: ['label']
  };

  return composeClasses(slots, getEditorLabelsUtilityClass, classes);
};
/*

 const useUtilityClasses = <R extends FileBase, Multiple extends boolean | undefined>(
 ownerState: EditorProps<R, Multiple>,
 ) => {
 const { classes } = ownerState;

 const slots = {
 root: ['root'],
 viewSpace: ['viewSpace'],
 videoControls: ['videoControls'],
 timeline: ['timeline'],
 bottomLeft: ['bottomLeft'],
 bottomRight: ['bottomRight'],
 };

 return composeClasses(slots, getEditorUtilityClass, classes);
 };

 */
const EditorLabelsRoot = styled('div', {
  name: 'MuiEditorLabels',
  slot: 'root',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: '42px',
  height: '258px',
  flex: '0 1 auto',
  overflow: 'overlay',
}));


const EditorLabelRoot = styled('div', {
  name: 'MuiEditorLabel',
  slot: 'Label',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({
  height: '32px',
  paddingLeft: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '4px',

}));

const EditorLabelText = styled('div', {
  name: 'MuiEditorLabelText',
  slot: 'Label',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({
  backgroundColor: contrast(0.12),
  color: theme.palette.text.primary,
  height: '28px',
  width: '150px',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '6px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textWrap: 'nowrap',
  flexGrow: '1'
}));

const EditorLabel = React.forwardRef(
  function EditorLabel(inProps:any, ref: React.Ref<HTMLElement>): React.JSX.Element {
    const { track, tracks, classes } = inProps;
    const visibilityIcon = track.hidden ? <VisibilityOffIcon fontSize={'small'}/> : <VisibilityIcon fontSize={'small'}/>;

    const lockIcon = track.lock ? <LockIcon fontSize={'small'}/> : <LockOpenIcon fontSize={'small'}/>;
    return (
      <EditorLabelRoot key={track.id} className={classes.label}>
        <EditorLabelText>{track.name}</EditorLabelText>
        <ToggleButtonGroup
          exclusive

          sx={{
            ...ToggleButtonGroupSx(useTheme()),
          ...{
            width: 'min-content',
            display: 'flex',
            alignItems: 'center',
            paddingRight: '0px',
            '& button': {
              padding: '3px',
            }
          }}}
          aria-label="text alignment"
        >
          <ToggleButton  value={track.hidden}  onChange={(e, val) => {
            track.hidden = val;
            inProps.setTracks((previous) => {
              const newTracks = [...previous];
              const rowIndex = newTracks.findIndex((previousTrack) => previousTrack.id === track.id);
              if (rowIndex !== -1) {
                newTracks[rowIndex] = {...track};
              }
              return newTracks;
            });
          }} aria-label="hidden">
            {visibilityIcon}
          </ToggleButton>
          <ToggleButton value="lock" aria-label="lock">
            {lockIcon}
          </ToggleButton>
        </ToggleButtonGroup>
      </EditorLabelRoot>
    );
  }
)
/**
 *
 * Demos:
 *
 * - [EditorLabels](https://stoked-ui.github.io/timeline/docs/)
 *
 * API:
 *
 * - [EditorLabels](https://stoked-ui.github.io/timeline/api/)
 */
const EditorLabels = React.forwardRef(
  function EditorLabels(inProps: EditorLabelsProps, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
    const { tracks, slots, slotProps, sx, timelineState } = useThemeProps({ props: inProps, name: 'MuiEditorLabels' });

    const classes = useUtilityClasses(inProps);

    const Root = slots?.root ?? EditorLabelsRoot;
    const rootProps = useSlotProps({
      elementType: Root,
      externalSlotProps: slotProps?.root,
      className: classes.root,
      ownerState: inProps,
    });

    return (
      <Root
        ref={ref}
        style={{ overflow: 'overlay' }}
        onScroll={(scrollEvent:  React.UIEvent<HTMLDivElement, UIEvent>) => {
          timelineState.current?.setScrollTop((scrollEvent.target as HTMLDivElement).scrollTop);
        }}

        classes={classes}
        className={`${classes.root} timeline-list`}>
        {tracks?.map((track) => {
          return <EditorLabel
            track={track}
            tracks={tracks}
            classes={classes}
            key={track.id}
            onToggle={(inputTrack: TimelineTrack, property: string) => {
              inProps.setTracks((previous) => {
                const newTracks = [...previous];
                const rowIndex = newTracks.findIndex((previousTrack) => previousTrack.id === inputTrack.id);
                if (rowIndex !== -1) {
                  console.log('initial', JSON.stringify(newTracks[rowIndex], null, 2));
                  const newTrackInstance = {...newTracks[rowIndex]};
                  console.log('newTrackInstance', JSON.stringify(newTrackInstance, null, 2));
                  newTrackInstance[property] = !newTrackInstance[property];
                  newTracks[rowIndex] = newTrackInstance;
                  console.log('after setFlags', JSON.stringify(newTracks[rowIndex], null, 2));
                }

                return newTracks;
              });
            }}
            setTracks={inProps.setTracks}
          />
        })}
      </Root>
    )
  })

export default EditorLabels;



/*
import * as React from 'react';
import composeClasses from "@mui/utils/composeClasses";
import { useSlotProps } from '@mui/base/utils';
import {Theme, useTheme } from '@mui/material/styles';
import ToggleButton from "@mui/material/ToggleButton";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import { EditorLabelsProps } from './EditorLabels.types';
import { getEditorLabelsUtilityClass } from "./editorLabelsClasses";
import { ToggleButtonGroupSx } from '@stoked-ui/core/styles';
import { TimelineTrack } from "@stoked-ui/timeline";
import { styled, createUseThemeProps } from '../internals/zero-styled';

const useThemeProps = createUseThemeProps('MuiEditorLabels');

const useUtilityClasses = (
  ownerState: EditorLabelsProps,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    label: ['label']
  };

  return composeClasses(slots, getEditorLabelsUtilityClass, classes);
};

const EditorLabelsRoot = styled('div', {
  name: 'MuiEditorLabels',
  slot: 'root',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: '42px',
  height: '258px',
  flex: '0 1 auto',
  overflow: 'overlay',
}));


const EditorLabel = styled('div', {
  name: 'MuiEditorLabel',
  slot: 'Label',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({
  height: '32px',
  paddingLeft: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '4px',

}));

const EditorLabelText = styled('div', {
  name: 'MuiEditorLabelText',
  slot: 'Label',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey.A200 : theme.palette.grey['900'],
  color: theme.palette.text.primary,
  height: '28px',
  width: '150px',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '6px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textWrap: 'nowrap',
  flexGrow: '1'
}));

const LabelButtonContainer = styled(ToggleButtonGroup, {
  name: 'MuiLabelButtonContainer',
  slot: 'LabelButtonContainer',
  overridesResolver: (props, styles) => styles.icon,
})(({ theme }: { theme: Theme}) => {
  return {
  width: 'min-content',
  display: 'flex',
  alignItems: 'center',
  paddingRight: '0px',
  '& button': {
    padding: '3px',
  }
}});

function EditorTrackLabels(props: any) {
  const { track, setTracks, tracks, classes } = props;
  const visibilityIcon = track.hidden ? <VisibilityOffIcon fontSize={'small'}/> : <VisibilityIcon fontSize={'small'}/>;

  const lockIcon = track.lock ? <LockIcon fontSize={'small'}/> : <LockOpenIcon fontSize={'small'}/>;
  const getFlags = (inputTrack: TimelineTrack) => {
    const status: string[] = [];
    if (inputTrack.hidden) {
      status.push('hidden');
    }
    if (inputTrack.lock) {
      status.push('lock');
    }
    console.log('track id', status);
    return status;
  }

  const [trackFlags, setTrackFlags] = React.useState<string[]>(getFlags(track));
  const setFlags = (inputTrack: TimelineTrack) => {

    setTrackFlags(getFlags(inputTrack));
  }

  const onToggle = (property: string) => {
    props.setTracks((previous) => {
      const rowIndex = previous.findIndex((previousTrack) => previousTrack.id === track.id);
      if (rowIndex !== -1) {
        previous[rowIndex][property] = !previous[rowIndex][property]
        setFlags(previous[rowIndex]);
      }
      const newTracks = [...previous];

      return [...newTracks];
    });
  }
  const theme = useTheme();
  const labelsSx = ToggleButtonGroupSx(theme);
  return (
    <EditorLabel key={track.id} className={classes.label}>
      <EditorLabelText>{track.name}</EditorLabelText>

      <LabelButtonContainer
        value={trackFlags}
        exclusive
        onChange={(event, value) => {
          onToggle!(value)
        }}
        sx={labelsSx}
        aria-label="text alignment"
      >
        <ToggleButton  value="hidden" aria-label="hidden">
          {visibilityIcon}
        </ToggleButton>
        <ToggleButton value="lock" aria-label="lock">
          {lockIcon}
        </ToggleButton>
      </LabelButtonContainer>
    </EditorLabel>
  );
}
/!**
 *
 * Demos:
 *
 * - [EditorLabels](https://stoked-ui.github.io/timeline/docs/)
 *
 * API:
 *
 * - [EditorLabels](https://stoked-ui.github.io/timeline/api/)
 *!/
const EditorLabels = React.forwardRef(
  function EditorLabels(inProps: EditorLabelsProps, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
    const { tracks, slots, slotProps, sx, timelineState } = useThemeProps({ props: inProps, name: 'MuiEditorLabels' });

    const classes = useUtilityClasses(inProps);

    const Root = slots?.root ?? EditorLabelsRoot;
    const rootProps = useSlotProps({
      elementType: Root,
      externalSlotProps: slotProps?.root,
      className: classes.root,
      ownerState: inProps,
    });

    return (
      <EditorTrackLabels
        ref={ref}
        style={{ overflow: 'overlay' }}
        onScroll={(scrollEvent:  React.UIEvent<HTMLDivElement, UIEvent>) => {
          timelineState.current?.setScrollTop((scrollEvent.target as HTMLDivElement).scrollTop);
        }}
        classes={classes}
        className={`${classes.root} timeline-list`}>
        {tracks?.map((track) => {
          return <EditorTrackLabels track={track} {...inProps}/>
        })}
      </EditorTrackLabels>
    )
  })

export default EditorLabels;
*/
