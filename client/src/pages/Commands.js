import React, { useEffect, useState } from 'react';
import { ModalProvider, useModal } from '../context/Modal';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Container, Row, Button, Form } from 'react-bootstrap';

import {
  CommandCol,
  CommandModalStyle,
  CommandListMainStyled,
  CommandListHeaderStyled,
  CommandEntryStyled
} from '../components/Commands';


const CommandsPage = () => {
  const [update, setUpdate] = useState(0)

  return (
  <ModalProvider>
    <Container>
      <Row>
        <CommandCol md={10}>
          <CommandListHeader update={update} setUpdate={setUpdate} />
          <CommandListMain update={update} setUpdate={setUpdate} />
        </CommandCol>
      </Row>
    </Container>
  </ModalProvider>
  )
  }

const CommandListHeader = ({ setUpdate }) => {
  const { showModal, hideModal } = useModal()


  return (
    <CommandListHeaderStyled>
      <h1>Chat Commands</h1>
      {/* pass content component, props for the content component, and additional props for the modal itself. */}
      <Button onClick={() => showModal({ content: NewCommandModal, contentProps: { hideModal, setUpdate }, ModalProps: {} })}>
        Add Command
      </Button>
    </CommandListHeaderStyled>
  )
}

function CommandListMain({update, setUpdate}) {
  const { showModal, hideModal } = useModal()
  const [commandList, setCommandList] = useState([])

  useEffect(() => {
    (async () => {
      let request = await axios('/getcommands')
      setCommandList(request.data)
    })()
  }, [update])

  return (

    <CommandListMainStyled>
      {commandList.map((command, i) =>
        <CommandEntryStyled key={i}>
          <div className="command_name"> {"!" + command.command} </div>
          {/* pass content component, props for the content component, and additional props for the modal itself. */}
          <Button onClick={() => showModal({ content: CommandModal, contentProps: { command, hideModal, update, setUpdate }, ModalProps: {} })}>
            Edit
          </Button>
        </CommandEntryStyled>
      )}
    </CommandListMainStyled>
  );
}


const CommandModal = ({ update, setUpdate, hideModal, ...props }) => {
  const [command, setCommand] = useState(props.command.command)
  const [response, setResponse] = useState(props.command.response)
  const [commandId,] = useState(props.command.id)

  const handleCommandChange = (event) => {
    setCommand(event.target.value)
  }

  const handleResponseChange = (event) => {
    setResponse(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    setCommand(event.target.elements.command.value)
    setResponse(event.target.elements.response.value)
    axios.post('/editcommand', { id: commandId, command: command, response: response });
    setUpdate((update) => ++update)
    hideModal()
  }

  return (
    <CommandModalStyle>
      <div className="modal-header">
        <div className="modal-title">
          <h1>{"!" + command}</h1>
        </div>
        <Button onClick={props.hideModal}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </div>

      <div className="modal-body">
        <CommandForm
          command={command}
          response={response}
          handleSubmit={handleSubmit}
          handleCommandChange={handleCommandChange}
          handleResponseChange={handleResponseChange}
        />
      </div>
    </CommandModalStyle>
  )
}

const NewCommandModal = ({ update, setUpdate, hideModal, ...props }) => {
  const [command, setCommand] = useState("")
  const [response, setResponse] = useState("")

  const handleCommandChange = (event) => {
    setCommand(event.target.value)
  }

  const handleResponseChange = (event) => {
    setResponse(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setCommand(event.target.elements.command.value)
    setResponse(event.target.elements.response.value)
    axios.post('/addcommand', { command: command, response: response });
    setUpdate(update => ++update)
    hideModal()
  }

  return (
    <CommandModalStyle>
      <div className="modal-header">
        <div className="modal-title">
          <h1>New Command</h1>
        </div>
        <Button onClick={props.hideModal}><FontAwesomeIcon icon={faTimes} /></Button>
      </div>

      <div className="modal-body">
        <CommandForm
          command={command}
          response={response}
          handleSubmit={handleSubmit}
          handleCommandChange={handleCommandChange}
          handleResponseChange={handleResponseChange}
        />
      </div>
    </CommandModalStyle>
  )
}


const CommandForm = (props) => (
  <Form onSubmit={props.handleSubmit}>
    <Form.Group controlId="command">
      <Form.Label>Command</Form.Label>
      <Form.Control type="command" value={props.command} onChange={props.handleCommandChange} />
    </Form.Group>

    <Form.Group controlId="response">
      <Form.Label>Response</Form.Label>
      <Form.Control as="textarea" rows="3" onChange={props.handleResponseChange}>
        {props.response}
      </Form.Control>
    </Form.Group>

    <div className="modal-footer">
      <Button type="submit">Save</Button>
    </div>
  </Form>
)

export default CommandsPage;
