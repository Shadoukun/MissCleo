import styled from 'styled-components';
import { TextareaAutosize } from '@material-ui/core';
import { lighten, darken } from 'polished';


export const TextArea = styled(TextareaAutosize)`
${({theme}) => `
    color: ${theme.colors.primaryFontColor};
    border-radius: 4px;
    position: relative;
    background-color ${theme.colors.backgroundColor};
    border: 1px solid ${darken(0.05, theme.colors.secondaryBackground)};
    font-size: 16px;
    padding: 10px 12px;
    transition: ${theme.transitions.create(['background-color', 'border-color', 'box-shadow'])};

    &:focus {
      background-color: ${lighten(0.05, theme.colors.backgroundColor)};
      border-color: transparent
    }
`}`
