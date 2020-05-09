import styled from 'styled-components';
import { lighten, darken } from 'polished';
import { Col } from 'react-bootstrap';

export const CommandCol = styled(Col)`
  margin: auto;
`

export const CommandModalStyle = styled.div`
  border-radius: 10px;
  background: ${props => props.theme.secondaryBackground};
  color: white;
  padding: 1em;

  .modal-header {
      display: flex;
      justify-content: space-between;

      button {
        background: transparent;
        border: 1px solid gray;
        color: gray;
      }
  }

  .modal-footer {
    padding: 1em 0 0 1em;

    button {
      font-size: 12px;
      margin: auto 0 auto auto;
      background: #43B581 !important;
      color: ${props => props.theme.primaryFontColor};
      border: 1px solid transparent !important;
      font-weight: bold;
      padding: 0.75em 3em;

      &:hover {
        box-shadow: none;
        border: 1px solid transparent;
        background: ${props => darken(0.2, "#43B581")} !important;
        color: ${props => darken(0.2, props.theme.primaryFontColor)}
      }

      &:focus {
        box-shadow: none !important;
      }

      &:active {
        background: ${props => lighten(0.05, "#43B581")} !important;
      }

    }
  }

  input, textarea {
    background-color: ${props => props.theme.backgroundColor};
    color: ${props => props.theme.primaryFontColor};
    border: none;

    &:active, &:focus, &:hover {
        transition: all 0.2s linear;
        box-shadow: 0 0 0 .1rem ${props => darken(0.1, props.theme.backgroundColor)};
        background: ${props => lighten(0.05, props.theme.backgroundColor)};
        color: ${props => props.theme.primaryFontColor};
  }


`


export const CommandListMainStyled = styled.div`
    display: flex;
    flex-direction: column;

`


export const CommandListHeaderStyled = styled.div`
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

    &:active {
      background: ${props => lighten(0.05, "#43B581")} !important;
    }

    &:focus {
      color: ${props => props.theme.primaryFontColor};
      box-shadow: none !important;
    }
  }
`


export const CommandEntryStyled = styled.div`
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
