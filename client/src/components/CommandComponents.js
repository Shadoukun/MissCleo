import ReactModalAdapter from './ModalAdapter'; 
import styled from 'styled-components';


export const StyledModal = styled(ReactModalAdapter).attrs({
    overlayClassName: 'Overlay',
    modalClassName: 'Modal'
})`
  .Modal {
    
  }
  .Overlay {
    background: ${props => props.theme.secondaryBackground};
    position: fixed;
    height: 90vh;
    width: 90vw;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`
