
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
import CommandForm from './CommandForm'

export const ReactionListHeader = ({ update, setUpdate }) => {
  const { showModal, hideModal } = useModal()

  const handleClick = () => {
    showModal({
      content: NewReactionModal,
      contentProps: { hideModal, update, setUpdate },
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
      content: ReactionModal,
      contentProps: { reaction, hideModal, update, setUpdate },
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

const ReactionModal = ({ update, setUpdate, hideModal, ...props }) => {
  const [reactionId,] = useState(props.reaction.id)
  const [name, setName] = useState(props.reaction.name)
  const [description, setDescription] = useState(props.reaction.description)
  const [trigger, setTrigger] = useState(props.reaction.trigger)
  const [response, setResponse] = useState(props.reaction.reaction)
  const [useRegex, setUseRegex] = useState(Boolean(props.reaction.use_regex))

  const { requestconfig } = useAuth();


  const handleTriggerChange = (event) => {
    setTrigger(event.target.value)
  }

  const handleResponseChange = (event) => {
    setResponse(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    backendCall.post(
      '/editreaction',
      {
        id: reactionId,
        name: name,
        description: description,
        trigger: trigger,
        reaction: response,
        response: response,
        use_regex: useRegex,
      },
      requestconfig
    );

    setUpdate((update) => ++update)
    hideModal()
  }

  const handleRemove = (event) => {
    event.preventDefault();
    backendCall.post(
      '/removereaction',
      { id: reactionId },
      requestconfig
    );

    setUpdate((update) => ++update)
    hideModal()
  }

  const toggleRegex = (event) => {
    setUseRegex(!useRegex)
  }

  const handleNameChange = (event) => {
    setName(event.target.value)
  }

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value)
  }

  return (
    <>
      <div className="modalHeader">
        <div className="modalTitle">
          <h1>{props.reaction.trigger}</h1>
        </div>
        <Button onClick={hideModal}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </div>

      <div className="modalBody">
        <CommandForm
          type="Reaction"
          edit
          hideMultiResponse
          name={name}
          description={description}
          trigger={trigger}
          response={response}
          useRegex={useRegex}
          handleNameChange={handleNameChange}
          handleDescriptionChange={handleDescriptionChange}
          handleSubmit={handleSubmit}
          handleTriggerChange={handleTriggerChange}
          handleResponseChange={handleResponseChange}
          handleRemove={handleRemove}
          toggleRegex={toggleRegex}
        />
      </div>
    </>
  )
}

const NewReactionModal = ({ update, setUpdate, hideModal, ...props }) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [trigger, setTrigger] = useState("")
  const [response, setResponse] = useState("")
  const [useRegex, setUseRegex] = useState(false)

  const { requestconfig } = useAuth();


  const handleTriggerChange = (event) => {
    setTrigger(event.target.value)
  }

  const handleResponseChange = (event) => {
    setResponse(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    backendCall.post(
      '/addreaction',
      { trigger: trigger, reaction: response, name: name, description: description },
      requestconfig
    );

    setUpdate((update) => ++update)
    hideModal()
  }

  const toggleRegex = (event) => {
    setUseRegex(!useRegex)
  }

  const handleNameChange = (event) => {
    setName(event.target.value)
  }

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value)
  }

  return (
    <>
      <div className="modalHeader">
        <div className="modalTitle">
          <h1>New Reaction</h1>
        </div>
        <Button onClick={hideModal}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </div>

      <div className="modalBody">
        <CommandForm
          type="Reaction"
          hideMultiResponse
          name={name}
          description={description}
          trigger={trigger}
          response={response}
          useRegex={useRegex}
          handleNameChange={handleNameChange}
          handleDescriptionChange={handleDescriptionChange}
          handleSubmit={handleSubmit}
          handleTriggerChange={handleTriggerChange}
          handleResponseChange={handleResponseChange}
          toggleRegex={toggleRegex}
        />
      </div>
    </>
  )
}
