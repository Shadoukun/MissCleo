
import React from 'react';
import { Button } from "../Button"
import { useModal } from '../../context/Modal';

import { CommandListHeaderStyled, CommandEntryStyled, CommandDescription } from './Commands';
import CommandModal from './CommandModal'


export const ResponseListHeader = ({ update, setUpdate }) => {
  const { showModal, hideModal } = useModal()

  const handleClick = () => {
    showModal({
      content: CommandModal,
      contentProps: {
        type: "Response",
        edit: false,
        submitURL: "/add_response",
        hideModal: hideModal,
        update: update,
        setUpdate: setUpdate
       },
      ModalProps: {}
    })
  }

  return (
    <CommandListHeaderStyled>
      <h1>Custom Responses</h1>
      <Button variant="contained" onClick={() => handleClick()}>
        Add Response
      </Button>
    </CommandListHeaderStyled>
  )
}

export function ResponseListMain({ responses, update, setUpdate }) {
  const { showModal, hideModal } = useModal()

  const handleClick = (response) => {
    showModal({
      content: CommandModal,
      contentProps: {
        type: "Response",
        edit: true,
        entry: response,
        submitURL: "/edit_response",
        removeURL: "/remove_response",
        hideModal: hideModal,
        update: update,
        setUpdate: setUpdate
      },
      ModalProps: {}
    })
  }

  return (
    <>
      {responses.map((response, i) =>
        <CommandEntryStyled key={i}>
          <div className="command_name"> {response.name ? response.name : response.trigger} </div>
          <CommandDescription>{response.description}</CommandDescription>
          <Button onClick={() => handleClick(response)}>
            Edit
          </Button>
        </CommandEntryStyled>
      )}
    </>
  );
}
