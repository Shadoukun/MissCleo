import React, { useState } from 'react';
import { lighten, darken } from 'polished';
import Fade from '@material-ui/core/Fade';
import { Button } from "../Button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { useModal } from '../../context/Modal';
import { useAuth } from '../../context/Auth';
import { backendCall } from '../../utilities';

import { CommandModal } from './CommandModal';
import { fade } from '@material-ui/core/styles';


export const CommandListHeaderStyled = styled.div`
 ${({ theme }) => `
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing(4, 0, 5, 0)};

  h1 {
    color: ${theme.colors.primaryFontColor};
    font-size: 24px;
    font-weight: bold;
    margin: auto 0;
  }

  button {
    transition: ${theme.transitions.create(['color', 'background'])};
  }

  button, &:focus  {
    font-size: 12px;
    background: #43B581 !important;
    color: white;
    border: 1px solid ${fade('#000', 0.05)} !important;
    font-weight: bold;
    padding: ${theme.spacing(1, 2)};

    &:active {
      background: ${lighten(0.05, "#43B581")} !important;
    }
  }

  button:hover {
      border: 1px solid transparent;
      background: ${darken(0.2, "#43B581")} !important;
      color: ${darken(0.3, 'white')};
    }
`}`

export const CommandEntryStyled = styled.div`
 ${({ theme }) => `
  display: flex;
  background: gray;
  padding: ${theme.spacing(2,2,2,2)};
  margin-bottom: ${theme.spacing(1)}px;
  color: ${theme.colors.primaryFontColor};
  background: ${theme.colors.secondaryBackground};
  border-radius: ${theme.shape.borderRadius}px;

  .command_name {
    font-weight: bold;
    margin: auto 0;
  }

  button {
    margin-left: auto;
    font-weight: bold;
    font-size: 12px;
    padding: ${theme.spacing(1, 1, 1, 1)};
    border: 1px solid ${fade('#000', 0.3)};
    background: ${theme.colors.backgroundColor};
  }
`}`

export const CommandDescription = styled.div`
${({ theme }) => `
  margin: auto 0 auto ${theme.spacing(4)}px;
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

