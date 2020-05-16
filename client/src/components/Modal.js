import React from 'react';
import { Transition } from 'react-transition-group';
import { Modal } from 'react-overlays'
import styled from 'styled-components';

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
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1040;
  transform: translate(-50%, -50%);
  width: 60%;
  outline: none;
`
// const FadeTransition = styled(Transition)`
// `
