import React, { useState } from 'react';
import { lighten, darken } from 'polished';
import { Button } from "../Button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { useModal } from '../../context/Modal';
import { useAuth } from '../../context/Auth';
import { backendCall } from '../../utilities';

import CommandForm from './CommandForm';


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

export const CommandDescription = styled.div`
${({ theme }) => `
  margin: auto 0 auto 30px ;
  font-weight: normal;
  color: ${darken(0.5, theme.colors.primaryFontColor)}
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
          <CommandDescription>{command.description}</CommandDescription>
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
  const [description, setDescription] = useState(props.command.description)

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
      '/edit_command',
      { id: commandId, command: command, response: response, description: description },
      requestconfig
    );

    setUpdate((update) => ++update)
    hideModal()
  }

  const handleRemove = (event) => {
    event.preventDefault();
    backendCall.post(
      '/remove_command',
      { id: commandId, name: command },
      requestconfig
    );

    setUpdate((update) => ++update)
    hideModal()
  }

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value)
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
          hideName
          hideRegex
          hideMultiResponse
          trigger={command}
          response={response}
          description={description}
          handleDescriptionChange={handleDescriptionChange}
          handleSubmit={handleSubmit}
          handleTriggerChange={handleCommandChange}
          handleResponseChange={handleResponseChange}
          handleRemove={handleRemove}
        />
      </div>
    </>
  )
}


const NewCommandModal = ({ update, setUpdate, hideModal, ...props }) => {
  const [command, setCommand] = useState("")
  const [response, setResponse] = useState("")
  const [description, setDescription] = useState("")
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
      '/add_command',
      { command: command, response: response, description: description },
      requestconfig
    );

    setUpdate(update => ++update)
    hideModal()
  }

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value)
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
          hideName
          hideRegex
          hideMultiResponse
          trigger={command}
          response={response}
          description={description}
          handleDescriptionChange={handleDescriptionChange}
          handleSubmit={handleSubmit}
          handleTriggerChange={handleCommandChange}
          handleResponseChange={handleResponseChange}
        />
      </div>
    </>
  )
}
