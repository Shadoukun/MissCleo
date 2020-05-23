
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

const ResponseModal = ({ update, setUpdate, hideModal, ...props }) => {
  const [responseId,] = useState(props.response.id)
  const [name, setName] = useState(props.response.name)
  const [description, setDescription] = useState(props.response.description)
  const [trigger, setTrigger] = useState(props.response.trigger)
  const [response, setResponse] = useState(props.response.response)
  const [useRegex, setUseRegex] = useState(Boolean(props.response.use_regex))
  const [multiResponse, setMultiResponse] = useState(Boolean(props.response.multi_response))

  const { requestconfig } = useAuth();

  const handleNameChange = (event) => {
    setName(event.target.value)
  }

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value)
  }

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
      {
        id: responseId,
        name: name,
        description: description,
        trigger: trigger,
        response: response,
        use_regex: useRegex,
        multi_response: multiResponse,
      },
      requestconfig
    );

    setUpdate((update) => ++update)
    hideModal()
  }

  const handleRemove = (event) => {
    event.preventDefault();
    backendCall.post(
      '/removeresponse',
      { id: responseId },
      requestconfig
    );

    setUpdate((update) => ++update)
    hideModal()
  }

  const toggleMultiResponse = (event) => {
    setMultiResponse(!multiResponse)
  }

  const toggleRegex = (event) => {
    setUseRegex(!useRegex)
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
        <CommandForm
          type="Response"
          edit
          name={name}
          description={description}
          trigger={trigger}
          response={response}
          useRegex={useRegex}
          multiResponse={multiResponse}
          handleNameChange={handleNameChange}
          handleDescriptionChange={handleDescriptionChange}
          handleSubmit={handleSubmit}
          handleTriggerChange={handleTriggerChange}
          handleResponseChange={handleResponseChange}
          toggleRegex={toggleRegex}
          toggleMultiResponse={toggleMultiResponse}
          handleRemove={handleRemove}
        />
      </div>
    </>
  )
}

const NewResponseModal = ({ update, setUpdate, hideModal, ...props }) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [trigger, setTrigger] = useState("")
  const [response, setResponse] = useState("")
  const [useRegex, setUseRegex] = useState(false)
  const [multiResponse, setMultiResponse] = useState(false)

  const { requestconfig } = useAuth();

  const handleNameChange = (event) => {
    setName(event.target.value)
  }

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value)
  }



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
      {
        name: name,
        description: description,
        trigger: trigger,
        response: response,
        use_regex: useRegex,
        multi_response: multiResponse,
      },
      requestconfig
    );

    setUpdate((update) => ++update)
    hideModal()
  }

  const toggleMultiResponse = (event) => {
    setMultiResponse(!multiResponse)
  }

  const toggleRegex = (event) => {
    setUseRegex(!useRegex)
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
        <CommandForm
          type="Response"
          name={name}
          description={description}
          trigger={trigger}
          response={response}
          useRegex={useRegex}
          multiResponse={multiResponse}
          handleNameChange={handleNameChange}
          handleDescriptionChange={handleDescriptionChange}
          handleSubmit={handleSubmit}
          handleTriggerChange={handleTriggerChange}
          handleResponseChange={handleResponseChange}
          toggleRegex={toggleRegex}
          toggleMultiResponse={toggleMultiResponse}
        />
      </div>
    </>
  )
}
