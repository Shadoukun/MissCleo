import React from 'react';
import { Transition } from 'react-transition-group';
import { Modal as OverlaysModal } from 'react-overlays'
import styled from 'styled-components';
import { lighten, darken } from 'polished';


const FADE_DURATION = 200;

const fadeStyles = {
    entering: 'show',
    entered: 'show',
    exiting: '',
    exited: ''
};

export const Fade = ({ children, ...props }) => {
    console.log(props)
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
  transition: opacity 200ms ease-in-out;
`

export const StyledModal = styled(OverlaysModal)`
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1040;
  transform: translate(-50%, -50%);
  transition: opacity 200ms ease-in-out;
  width: 60%;

`
