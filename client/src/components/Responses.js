
import React, { useState } from 'react';
import { lighten, darken } from 'polished';
import { Input, FormLabel } from './Form'
import { Button } from "./Button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useModal } from '../context/Modal';
import { useAuth } from '../context/Auth';
import { backendCall } from '../utilities';
import { ModalForm, ModalFormControl } from './Modal';

import { CommandListHeaderStyled, CommandEntryStyled } from './Commands';

export const ResponseListHeader = ({ update, setUpdate }) => {
  const { showModal, hideModal } = useModal()

  const handleClick = () => {
    showModal({
      content: NewResponseModal,
      contentProps: { hideModal, update, setUpdate },
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
      content: ResponseModal,
      contentProps: { response, hideModal, update, setUpdate },
      ModalProps: {}
    })
  }

  return (
    <>
      {responses.map((response, i) =>
        <CommandEntryStyled key={i}>
          <div className="command_name"> {response.trigger} </div>
          <Button onClick={() => handleClick(response)}>
            Edit
          </Button>
        </CommandEntryStyled>
      )}
    </>
  );
}

const ResponseModal = ({ update, setUpdate, hideModal, ...props }) => {
  const [trigger, setTrigger] = useState(props.response.trigger)
  const [response, setResponse] = useState(props.response.response)
  const [responseId,] = useState(props.response.id)
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
          '/editresponse',
          { id: responseId, trigger: trigger, response: response },
          requestconfig
      );

      setUpdate((update) => ++update)
      hideModal()
  }

  return (
    <>
      <div className="modalHeader">
        <div className="modalTitle">
          <h1>{props.response.trigger}</h1>
        </div>
        <Button onClick={hideModal}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </div>

      <div className="modalBody">
        <ResponseForm
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

const NewResponseModal = ({ update, setUpdate, hideModal, ...props }) => {
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
            '/addresponse',
            { trigger: trigger, response: response },
            requestconfig
        );

        setUpdate((update) => ++update)
    hideModal()
  }

  return (
    <>
      <div className="modalHeader">
        <div className="modalTitle">
          <h1>New Response</h1>
        </div>
        <Button onClick={hideModal}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </div>

      <div className="modalBody">
        <ResponseForm
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

const ResponseForm = (props) => (
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
      <Button type="submit">
        Save
      </Button>
    </div>
  </ModalForm>
)
