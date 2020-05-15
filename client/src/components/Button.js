import { Button as MuiButton, IconButton as MuiIconButton } from '@material-ui/core'
import styled from 'styled-components';

export const Button = styled(MuiButton)`
 &:hover {
    color: inherit;
    text-decoration: none;
 }

 &:focus {
      box-shadow: none;
      outline: none;
      text-decoration: none;
    }
`

export const IconButton = styled(MuiIconButton)`
 &:hover {
    color: inherit;
    text-decoration: none;
 }

 &:focus {
      box-shadow: none;
      outline: none;
      text-decoration: none;
    }
`
