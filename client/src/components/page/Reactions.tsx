import React from 'react';
import { Button } from "../Button"
import { useModal } from '../../context/Modal';

import { CommandListHeaderStyled, CommandEntryStyled, CommandDescription } from './Commands';
import { CommandModal } from './CommandModal';
import { CommandEntry } from '../../types';

type ReactionListProps = {
  reactions?: CommandEntry[] | undefined
  update: number
  setUpdate: React.Dispatch<number>
}

export const ReactionListHeader = ({ update, setUpdate }: ReactionListProps) => {
  const { showModal, hideModal } = useModal()

  const handleClick = () => {

    const contentProps = {
      type: "Reaction",
      edit: false,
      entry: {},
      submitURL: "/add_reaction",
      hideModal: hideModal,
      update: update,
      setUpdate: setUpdate,
      hideMultiResponse: true
    }

    showModal({
      content: CommandModal,
      contentProps: contentProps,
      modalProps: {}
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

export function ReactionListMain({ reactions, update, setUpdate }: ReactionListProps) {
  const { showModal, hideModal } = useModal()

  const handleClick = (reaction: CommandEntry) => {
    const contentProps = {
      type: "Reaction",
      edit: true,
      entry: reaction,
      submitURL: "/edit_reaction",
      removeURL: "/remove_reaction",
      hideModal: hideModal,
      update: update,
      setUpdate: setUpdate,
      hideMultiResponse: true,
    }

    showModal({
      content: CommandModal,
      contentProps: contentProps,
      modalProps: {}
    })
  }

  if (reactions) {
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
  } else {
    return (<React.Fragment/>)
  }
}
