import * as React from "react";
import Select from "@mui/material/Select";
import {FormControl, SxProps} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";

export default function BlendModeSelect({onClickEdit, editMode}) {
  return <FormControl>
    <InputLabel id="track-id-blend-mode">Blend Mode</InputLabel>
    <Select
      labelId="track-id-blend-mode"
      id="demo-simple-select-helper"
      name={'blendMode'}
      onClick={onClickEdit}
      placeholder={'Blend Mode'}
      disabled={!editMode}
    >
      <MenuItem value="normal">
        <em>normal</em>
      </MenuItem>
      <MenuItem value={'multiply'}>multiply</MenuItem>
      <MenuItem value={'screen'}>screen</MenuItem>
      <MenuItem value={'overlay'}>overlay</MenuItem>
      <MenuItem value={'darken'}>darken</MenuItem>
      <MenuItem value={'lighten'}>lighten</MenuItem>
      <MenuItem value={'color-dodge'}>color-dodge</MenuItem>
      <MenuItem value={'color-burn'}>color-burn</MenuItem>
      <MenuItem value={'hard-light'}>hard-light</MenuItem>
      <MenuItem value={'soft-light'}>soft-light</MenuItem>
      <MenuItem value={'difference'}>difference</MenuItem>
      <MenuItem value={'exclusion'}>exclusion</MenuItem>
      <MenuItem value={'hue'}>hue</MenuItem>
      <MenuItem value={'saturation'}>saturation</MenuItem>
      <MenuItem value={'color'}>color</MenuItem>
      <MenuItem value={'luminosity'}>luminosity</MenuItem>
      <MenuItem value={'plus-darker'}>plus-darker</MenuItem>
      <MenuItem value={'plus-lighter'}>plus-lighter</MenuItem>
    </Select>
  </FormControl>
}
