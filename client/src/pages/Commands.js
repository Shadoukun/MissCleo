import React, { useEffect, useState } from 'react';
import { ModalProvider, useModal } from '../context/Modal';
import { backendCall } from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Container, Row, Button, Form } from 'react-bootstrap';
import { useAuth } from '../context/Auth';

import {
  CommandCol,
  CommandModalStyle,
  CommandListMainStyled,
  CommandListHeaderStyled,
  CommandEntryStyled
} from '../components/Commands';


const CommandsPage = () => {
  const [commands, setCommands] = useState([])
  const [update, setUpdate] = useState(0)
  const { requestconfig } = useAuth();

  useEffect(() => {
    (async () => {
      let request = await backendCall.get('/getcommands', requestconfig)
      setCommands(request.data)
    })()
  }, [update, requestconfig])

  return (
    <ModalProvider>
      <Container>
        <Row>
          <CommandCol md={10}>
            <CommandListHeader update={update} setUpdate={setUpdate} />
            <CommandListMain commands={commands} update={update} setUpdate={setUpdate} />
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


function CommandListMain({ commands, update, setUpdate }) {
  const { showModal, hideModal } = useModal()


  return (
    <CommandListMainStyled>
      {commands.map((command, i) =>
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
  const { requestconfig } = useAuth();


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
    backendCall.post('/editcommand', { id: commandId, command: command, response: response }, requestconfig);
    setUpdate((update) => ++update)
    hideModal()
  }

  return (
    <CommandModalStyle>
      <div className="modal-header">
        <div className="modal-title">
          <h1>{"!" + props.command.command}</h1>
        </div>
        <Button onClick={hideModal}>
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
  const { requestconfig } = useAuth();


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
    backendCall.post('/addcommand', { command: command, response: response }, requestconfig);
    setUpdate(update => ++update)
    hideModal()
  }

  return (
    <CommandModalStyle>
      <div className="modal-header">
        <div className="modal-title">
          <h1>New Command</h1>
        </div>
        <Button onClick={hideModal}><FontAwesomeIcon icon={faTimes} /></Button>
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
