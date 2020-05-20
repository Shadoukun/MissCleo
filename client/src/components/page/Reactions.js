
import React, { useState } from 'react';
import { Input, FormLabel } from '../Form'
import { Button } from "../Button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useModal } from '../../context/Modal';
import { useAuth } from '../../context/Auth';
import { backendCall } from '../../utilities';
import { ModalForm, ModalFormControl } from '../Modal';

import { CommandListHeaderStyled, CommandEntryStyled } from './Commands';

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
          <div className="command_name"> {reaction.trigger} </div>
          <Button onClick={() => handleClick(reaction)}>
            Edit
          </Button>
        </CommandEntryStyled>
      )}
    </>
  );
}

const ReactionModal = ({ update, setUpdate, hideModal, ...props }) => {
  const [trigger, setTrigger] = useState(props.reaction.trigger)
  const [response, setResponse] = useState(props.reaction.reaction)
  const [reactionId,] = useState(props.reaction.id)
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
      { id: reactionId, trigger: trigger, reaction: response },
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
        <ReactionForm
          edit
          trigger={trigger}
          response={response}
          handleSubmit={handleSubmit}
          handleTriggerChange={handleTriggerChange}
          handleResponseChange={handleResponseChange}
          remove={handleRemove}
        />
      </div>
    </>
  )
}

const NewReactionModal = ({ update, setUpdate, hideModal, ...props }) => {
  const [trigger, setTrigger] = useState("")
  const [response, setResponse] = useState("")
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
      { trigger: trigger, reaction: response },
      requestconfig
    );

    setUpdate((update) => ++update)
    hideModal()
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
        <ReactionForm
          trigger={trigger}
          response={response}
          handleSubmit={handleSubmit}
          handleTriggerChange={handleTriggerChange}
          handleResponseChange={handleResponseChange}
        />
      </div>
    </>
  )
}

const ReactionForm = ({edit, ...props}) => (
  <ModalForm onSubmit={props.handleSubmit} autoComplete="off">
    <ModalFormControl>
      <FormLabel>Trigger</FormLabel>
      <Input
        variant="filled"
        label="Trigger"
        id="trigger"
        value={props.trigger}
        onChange={props.handleTriggerChange}

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
