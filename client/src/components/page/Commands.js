import React, { useState } from 'react';
import { lighten, darken } from 'polished';
import { Input, FormLabel } from '../Form'
import { Button } from "../Button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { useModal } from '../../context/Modal';
import { useAuth } from '../../context/Auth';
import { backendCall } from '../../utilities';
import { ModalForm, ModalFormControl } from '../Modal';


export const CommandListHeaderStyled = styled.div`
 ${({ theme }) => `
  display: flex;
  justify-content: space-between;
  padding: 2em 0;

  h1 {
    color: ${theme.colors.primaryFontColor};
    font-size: 1.5rem;
    font-weight: bold;
    margin: auto 0;
  }

  button, &:focus  {
    font-size: 12px;
    margin: auto 0 auto auto;
    background: #43B581 !important;
    color: ${theme.colors.primaryFontColor};
    border: 1px solid transparent !important;
    font-weight: bold;
    padding: 0.75em 1em;

    &:hover {
      box-shadow: none;
      border: 1px solid transparent;
      background: ${props => darken(0.2, "#43B581")} !important;
      color: ${darken(0.2, theme.colors.primaryFontColor)}
    }

    &:active {
      background: ${lighten(0.05, "#43B581")} !important;
    }

    &:focus {
      color: ${theme.colors.primaryFontColor};
      box-shadow: none !important;
    }
  }
`}`

export const CommandEntryStyled = styled.div`
 ${({ theme }) => `
  display: flex;
  background: gray;
  padding: 1em;
  margin-bottom: 1em;
  color: ${theme.colors.primaryFontColor};
  background: ${theme.colors.secondaryBackground};
  border-radius: 5px;
  font-weight: bold;

  .command_name {
    margin: auto 0;
  }

  button {
    margin-left: auto;
    background: ${theme.colors.backgroundColor};
  }
`}`


export const CommandListHeader = ({ update, setUpdate }) => {
  const { showModal, hideModal } = useModal()

  const handleClick = () => {
    showModal({
      content: NewCommandModal,
      contentProps: { hideModal, update, setUpdate },
      ModalProps: {}
    })
  }

  return (
    <CommandListHeaderStyled>
      <h1>Chat Commands</h1>
      <Button variant="contained" onClick={() => handleClick()}>
        Add Command
      </Button>
    </CommandListHeaderStyled>
  )
}


export function CommandListMain({ commands, update, setUpdate }) {
  const { showModal, hideModal } = useModal()

  const handleClick = (command) => {
    showModal({
      content: CommandModal,
      contentProps: { command, hideModal, update, setUpdate },
      ModalProps: {}
    })
  }

  return (
    <>
      {commands.map((command, i) =>
        <CommandEntryStyled key={i}>
          <div className="command_name"> {"!" + command.command} </div>
          <Button onClick={() => handleClick(command)}>
            Edit
          </Button>
        </CommandEntryStyled>
      )}
    </>
  );
}


const CommandModal = ({ update, setUpdate, hideModal, ...props }) => {
  const [command, setCommand] = useState(props.command.command)
  const [response, setResponse] = useState(props.command.response)
  const [commandId,] = useState(props.command.id)
  const { requestconfig } = useAuth();


  const handleCommandChange = (event) => {
    setCommand(event.target.value)
  }

  const handleResponseChange = (event) => {
    setResponse(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    backendCall.post(
      '/editcommand',
      { id: commandId, command: command, response: response },
      requestconfig
    );

    setUpdate((update) => ++update)
    hideModal()
  }

  const handleRemove = (event) => {
    event.preventDefault();
    backendCall.post(
      '/removecommand',
      { id: commandId },
      requestconfig
    );

    setUpdate((update) => ++update)
    hideModal()
  }

  return (
    <>
      <div className="modalHeader">
        <div className="modalTitle">
          <h1>{"!" + props.command.command}</h1>
        </div>
        <Button onClick={hideModal}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </div>

      <div className="modalBody">
        <CommandForm
          edit
          command={command}
          response={response}
          handleSubmit={handleSubmit}
          handleCommandChange={handleCommandChange}
          handleResponseChange={handleResponseChange}
          remove={handleRemove}
        />
      </div>
    </>
  )
}


const NewCommandModal = ({ update, setUpdate, hideModal, ...props }) => {
  const [command, setCommand] = useState("")
  const [response, setResponse] = useState("")
  const { requestconfig } = useAuth();


  const handleCommandChange = (event) => {
    setCommand(event.target.value)
  }

  const handleResponseChange = (event) => {
    setResponse(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    backendCall.post(
      '/addcommand',
      { command: command, response: response },
      requestconfig
    );

    setUpdate(update => ++update)
    hideModal()
  }

  return (
    <>
      <div className="modalHeader">
        <div className="modalTitle">
          <h1>New Command</h1>
        </div>
        <Button onClick={hideModal}><FontAwesomeIcon icon={faTimes} /></Button>
      </div>

      <div className="modalBody">
        <CommandForm
          command={command}
          response={response}
          handleSubmit={handleSubmit}
          handleCommandChange={handleCommandChange}
          handleResponseChange={handleResponseChange}
        />
      </div>
    </>
  )
}


const CommandForm = ({edit, ...props}) => (
  <ModalForm onSubmit={props.handleSubmit} autoComplete="off">
    <ModalFormControl>
      <FormLabel>Command</FormLabel>
      <Input
        variant="filled"
        label="Command"
        id="command"
        value={props.command}
        onChange={props.handleCommandChange}

      />
    </ModalFormControl>

    <ModalFormControl>
      <FormLabel>Response</FormLabel>
      <Input
        variant="filled"
        label="Response"
        id="response"
        multiline
        rows={3}
        rowsMax={6}
        value={props.response}
        onChange={props.handleResponseChange}
      />
    </ModalFormControl>

    <div className="modalFooter">
      {edit &&
        <Button className="Remove" onClick={props.remove}>
        Remove
      </Button>
      }
      <Button type="submit">
        Save
      </Button>
    </div>
  </ModalForm>
)
