import ReactModalAdapter from './ModalAdapter'; 
import styled from 'styled-components';
import { darken, lighten } from 'polished';


export const CommandHeaderStyle = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2em 0;

  h1 {
    color: ${props => props.theme.primaryFontColor};
    font-size: 1.5rem;
    font-weight: bold;
    margin: auto 0;
  }

  button, &:focus  {
    font-size: 12px;
    margin: auto 0 auto auto;
    background: #43B581 !important;
    color: ${props => props.theme.primaryFontColor};
    border: 1px solid transparent !important;
    font-weight: bold;
    padding: 0.75em 1em;

    &:hover {
      box-shadow: none;
      border: 1px solid transparent;
      background: ${props => darken(0.2, "#43B581")} !important;
      color: ${props => darken(0.2, props.theme.primaryFontColor)}
    }

    &:focus { 
      box-shadow: none !important;
    }
  }
`

export const CommandPageMainStyle = styled.div`
  padding-top: 1em;
`

export const CommandEntryStyle = styled.div`
  display: flex;
  background: gray;
  padding: 1em;
  margin-bottom: 1em;
  color: ${props => props.theme.primaryFontColor};
  background: ${props => props.theme.secondaryBackground};
  border-radius: 5px;
  font-weight: bold;

  .command_name {
    margin: auto 0;
  }

  button, button:focus {
    width: 5em;
    margin-left: auto;
    border: 1px solid gray;
    background: ${props => props.theme.secondaryBackground};
    color: ${props => props.theme.primaryFontColor};
    box-shadow: none !important;


    &:active, &:hover {
      box-shadow: none;
      border: 1px solid ${props => lighten(0.1, props.theme.primaryFontColor)} !important;
      background-color: ${props => lighten(0.05, props.theme.secondaryBackground)} !important;
      color: ${props => lighten(0.05, props.theme.primaryFontColor)};
    }

    &:focus {
      box-shadow: none !important;
    }

  }

`

export const StyledCommandModal = styled(ReactModalAdapter).attrs({
    overlayClassName: 'Overlay',
    modalClassName: 'Modal'
})`
  .Modal {
    border-radius: 10px;
    background: ${props => props.theme.secondaryBackground};
    color: white;
    padding: 1em;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    position: fixed;
    width: 60%;
    transition: width 0.5s, height 0.5s, opacity 0.5s 0.5s;

    input, textarea {
    background-color: ${props => props.theme.backgroundColor};
    color: ${props => props.theme.primaryFontColor};
    border: none;
    }

    .modal-header {
         button {
            background: transparent;
            border: 1px solid gray;
            color: gray;
        }

    }

    .modal-footer {
        margin-top: 2em;
        padding: 1em 0 0 0;

        button {
            background: #43B581;
            padding: .5em 2em;
            border: 1px solid transparent;
        }
    }
  }

  .Overlay {
    position: fixed;
    top 0;
    height: 100vh;
    width: 100%;
    background:rgba(50, 50, 50, 0.9);
    
    .modal-header {
        display:flex;

        .btn {
            margin-left: auto;
        }
    }
  }
`
