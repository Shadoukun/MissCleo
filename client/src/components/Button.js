import { Button as MuiButton, IconButton as MuiIconButton } from '@material-ui/core'
import styled from 'styled-components';

export const Button = styled(MuiButton)`
 &:hover {
    color: inherit;
 }

 &:focus {
      box-shadow: none;
      outline: none;
    }
`

export const IconButton = styled(MuiIconButton)`
    &:focus {
      box-shadow: none;
      outline: none;
    }
`
