
import React from 'react';
import { Button } from "../Button"
import { useModal } from '../../context/Modal';

import { CommandListHeaderStyled, CommandEntryStyled, CommandDescription } from './Commands';
import CommandModal from './CommandModal'
import { CommandEntry } from '../../types';


type ResponseListProps = {
  responses?: CommandEntry[] | undefined
  update: number
  setUpdate: React.Dispatch<number>
}

export const ResponseListHeader = ({ update, setUpdate }: ResponseListProps) => {
  const { showModal, hideModal } = useModal()

  const handleClick = () => {
    const contentProps = {
      type: "Response",
      edit: false,
      entry: {},
      submitURL: "/add_response",
      hideModal: hideModal,
      update: update,
      setUpdate: setUpdate
    }

    showModal({
      content: CommandModal,
      contentProps: contentProps,
      modalProps: {}
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

export function ResponseListMain({ responses, update, setUpdate }: ResponseListProps) {
  const { showModal, hideModal } = useModal()

  const handleClick = (response: CommandEntry) => {
    const contentProps = {
      type: "Response",
      edit: true,
      entry: response,
      submitURL: "/edit_response",
      removeURL: "/remove_response",
      hideModal: hideModal,
      update: update,
      setUpdate: setUpdate
    }

    showModal({
      content: CommandModal,
      contentProps: contentProps,
      modalProps: {}
    })
  }

  if (responses) {
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
  } else {
    return (<React.Fragment/>)
  }
}
