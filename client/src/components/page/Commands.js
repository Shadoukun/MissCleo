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
import CommandModal from './CommandModal';


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
      content: CommandModal,
      contentProps: {
        type: "Command",
        edit: false,
        submitURL: "/add_command",
        hideModal: hideModal,
        update: update,
        setUpdate: setUpdate,
        hideName: true,
        hideRegex: true,
        hideMultiResponse: true,
      },
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
      contentProps: {
        type: "Command",
        edit: true,
        entry: command,
        submitURL: "/edit_command",
        removeURL: "/remove_command",
        hideModal: hideModal,
        update: update,
        setUpdate: setUpdate,
        hideName: true,
        hideRegex: true,
        hideMultiResponse: true,
      },
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

