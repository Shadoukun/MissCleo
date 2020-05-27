import React from 'react';
import { Transition } from 'react-transition-group';
import { Modal } from 'react-overlays'
import styled from 'styled-components';
import { Input, FormLabel, FormControl } from './Form'
import { lighten, darken } from 'polished';

const FADE_DURATION = 200;

const fadeStyles = {
  entering: 'show',
  entered: 'show',
  exiting: '',
  exited: ''
};


export const Fade = ({ children, ...props }) => {
  return (
    <Transition {...props} timeout={FADE_DURATION}>
      {(status, innerProps) => (
        React.cloneElement(children, {
          ...innerProps,
          className: `fade ${fadeStyles[status]} ${children.props.className}`,
        }))
      }
    </Transition>
  );
}

export const Backdrop = styled("div").attrs({ className: 'backdrop' })`
  position: fixed;
  z-index: 1040;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #000;
  opacity: 0.5;
`

export const StyledModal = styled(Modal)`
${({ theme }) => `
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1040;
  transform: translate(-50%, -50%);
  width: 50%;
  outline: none;
  background: ${theme.colors.secondaryBackground};
  color: ${theme.colors.primaryFontColor};
  padding: ${theme.spacing(2)}px;
  border-radius: ${theme.shape.borderRadius}px;

  h1 {
    font-size: 25px;
  }

  .modalHeader {
    display: flex;
    margin-bottom: ${theme.spacing(2)}px;

    button {
      margin-left: auto;
    }
  }

  .modalFooter {
    padding: ${theme.spacing(3,0,0,0)};
    display: flex;


    button {
      font-size: 12px;
      margin: auto 0 auto auto;
      background: #43B581;
      color: ${theme.colors.primaryFontColor};
      border: 1px solid transparent !important;
      font-weight: bold;
      padding: ${theme.spacing(1, 4)};

      &:hover {
        box-shadow: none;
        border: 1px solid transparent;
        background: ${darken(0.2, "#43B581")};
        color: ${darken(0.2, theme.colors.primaryFontColor)}
      }

      &:focus {
        box-shadow: none !important;
      }

      &:active {
        background: ${darken(0.05, "#43B581")} !important;
      }
    }

    button.Remove {
      color: ${darken(0.2, theme.colors.primaryFontColor)};
      background: rgba(0,0,0,0.1);
      margin-left: 0;
      padding: ${theme.spacing(1, 2)};
      font-weight: normal;

       &:hover {
        background: ${darken(0.2, "#F04747")};
      }
    }
  `}`

export const ModalForm = styled.form`
    display: flex;
    flex-direction: column;
`


export const ModalFormControl = styled(FormControl)`
${({theme}) => `
  div.MuiFormControl-root + & {
    margin-top: ${theme.spacing(2)}px;
  }
`}`
