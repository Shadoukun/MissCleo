import React from 'react';
import {
  fade,
  withStyles,
} from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import styled from 'styled-components';
import { FormLabel as MuiFormLabel, FormControl as MuiFormControl } from '@material-ui/core';
import { lighten, darken } from 'polished';

export const FormControl = styled(MuiFormControl)`
 label + &.MuiInputBase-formControl {
    padding: 0 0 7px 0;
 }
`

export const FormLabel = styled(MuiFormLabel)`
${({theme}) => `
  color: ${darken(0.5, theme.colors.primaryFontColor)};
  transition ${theme.transitions.create(['color'])};
  font-size: 14px;

  &.Mui-focused {
    color: ${darken(0.25,theme.colors.primaryFontColor)};
  }
`}`

export const Input = styled(InputBase)`
${({theme}) => `
  label + &.MuiInputBase-multiline {
    padding: 0 0 7px;
  }

  input, textarea {
    border-radius: 4px;
    position: relative;
    background-color ${theme.colors.backgroundColor};
    border: 1px solid ${darken(0.025, theme.colors.secondaryBackground)};
    font-size: 16px;
    padding: 10px 12px;
    transition: ${theme.transitions.create(['background-color', 'border-color', 'box-shadow'])};

    &:focus {
      background-color: ${lighten(0.05, theme.colors.backgroundColor)};
      border-color: ${theme.colors.secondaryBackground}
    }
  }
`}`

