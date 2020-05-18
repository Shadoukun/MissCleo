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

export const Backdrop = styled("div")`
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
  width: 60%;
  outline: none;
  background: ${theme.colors.secondaryBackground};
  color: ${theme.colors.primaryFontColor};
  padding: 20px;
  border-radius: 5px;

  h1 {
    font-size: 25px;
  }

  .modalHeader {
    display: flex;
    margin-bottom: 20px;

    button {
      margin-left: auto;
    }
  }

  .modalFooter {
    padding: 20px 0 0 20px;
    display: flex;

    button {
      font-size: 12px;
      margin: auto 0 auto auto;
      background: #43B581 !important;
      color: ${theme.colors.primaryFontColor};
      border: 1px solid transparent !important;
      font-weight: bold;
      padding: 0.75em 3em;

      &:hover {
        box-shadow: none;
        border: 1px solid transparent;
        background: ${darken(0.2, "#43B581")} !important;
        color: ${darken(0.2, theme.colors.primaryFontColor)}
      }

      &:focus {
        box-shadow: none !important;
      }

      &:active {
        background: ${lighten(0.05, "#43B581")} !important;
      }

    }
  `}`

export const ModalForm = styled.form`
    display: flex;
    flex-direction: column;
`


export const ModalFormControl = styled(FormControl)`
  div.MuiFormControl-root + & {
    margin-top: 15px;
  }
`
