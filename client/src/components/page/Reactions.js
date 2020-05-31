
import React, { useState } from 'react';
import { Input, FormLabel } from '../Form'
import { Button } from "../Button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useModal } from '../../context/Modal';
import { useAuth } from '../../context/Auth';
import { backendCall } from '../../utilities';
import { ModalForm, ModalFormControl } from '../Modal';

import { CommandListHeaderStyled, CommandEntryStyled, CommandDescription } from './Commands';
import { CommandModal } from './CommandModal';

export const ReactionListHeader = ({ update, setUpdate }) => {
  const { showModal, hideModal } = useModal()

  const handleClick = () => {
    showModal({
      content: CommandModal,
      contentProps: {
        type: "Reaction",
        edit: false,
        submitURL: "/add_reaction",
        hideModal: hideModal,
        update: update,
        setUpdate: setUpdate,
        hideMultiResponse: true
      },
      ModalProps: {}
    })
  }

  return (
    <CommandListHeaderStyled>
      <h1>Custom Reactions</h1>
      <Button variant="contained" onClick={() => handleClick()}>
        Add Reaction
      </Button>
    </CommandListHeaderStyled>
  )
}

export function ReactionListMain({ reactions, update, setUpdate }) {
  const { showModal, hideModal } = useModal()
  const handleClick = (reaction) => {
    showModal({
      content: CommandModal,
      contentProps: {
        type: "Reaction",
        edit: true,
        entry: reaction,
        submitURL: "/edit_reaction",
        removeURL: "/remove_reaction",
        hideModal: hideModal,
        update: update,
        setUpdate: setUpdate,
        hideMultiResponse: true,
      },
      ModalProps: {}
    })
  }

  return (
    <>
      {reactions.map((reaction, i) =>
        <CommandEntryStyled key={i}>
          <div className="command_name">{reaction.name ? reaction.name : reaction.trigger}</div>
          <CommandDescription>{reaction.description}</CommandDescription>
          <Button onClick={() => handleClick(reaction)}>
            Edit
          </Button>
        </CommandEntryStyled>
      )}
    </>
  );
}
