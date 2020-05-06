import React, { useEffect, useState } from 'react';
import { Container, Col, Row, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {
  ModalProvider,
  ModalConsumer,
  ModalRoot
} from '../context/Modal';
import {
  StyledCommandModal,
  CommandHeaderStyle,
  CommandPageMainStyle,
  CommandEntryStyle
} from '../components/CommandComponents';


const CommandsPage = () => {
  const [update, setUpdate] = useState(0)

  return (
    <Container>
      <Row>
        <Col md={11} style={{ margin: "auto" }}>
          <CommandListHeader setUpdate={setUpdate} />
          <CommandListMain update={update} setUpdate={setUpdate} />
        </Col>
      </Row>
    </Container>
  )
}

const CommandListHeader = ({ setUpdate }) => {

  return (
    <CommandHeaderStyle>
      <h1>Chat Commands</h1>
      <ModalProvider>
        <ModalRoot />
        <ModalConsumer>
          {({ showModal }) => (
            <Button
              onClick={() => showModal(NewCommandModal, { command: {}, setUpdate: setUpdate })}>
              Add Command
            </Button>
          )}
        </ModalConsumer>
      </ModalProvider>
    </CommandHeaderStyle>
  )
}


const CommandListMain = ({ update, setUpdate }) => {
  const [commandList, setCommandList] = useState([])

  useEffect(() => {
    (async () => {
      let request = await axios('/getcommands')
      setCommandList(request.data)
    })()
  }, [update])

  return (
    <CommandPageMainStyle>
      <ModalProvider>
        <ModalRoot />
        <ModalConsumer>
          {({ showModal }) => (
            commandList.map((command, i) =>
              <CommandEntry key={i} command={command} setUpdate={setUpdate} showModal={showModal} />
            )
          )}
        </ModalConsumer>
      </ModalProvider>
    </CommandPageMainStyle>
  )

}


const CommandEntry = ({ setUpdate, showModal, command }) => {
  return (
    <CommandEntryStyle>
      <div className="command_name">
        {"!" + command.command}
      </div>
      <Button onClick={() => showModal(CommandModal, { command: command, setUpdate: setUpdate })}>
        Edit
      </Button>
    </CommandEntryStyle>
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


const NewCommandModal = ({ onRequestClose, ...props }) => {
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
    props.setUpdate(update => ++update)
    onRequestClose()
  }

  return (
    <StyledCommandModal ClassName="Modal" overlayClassName='Overlay' isOpen onRequestClose={onRequestClose} {...props}>
      <div className="modal-header">
        <div className="modal-title">
          <h1>New Command</h1>
        </div>
        <Button onClick={onRequestClose}><FontAwesomeIcon icon={faTimes} /></Button>
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
    </StyledCommandModal>
  )
}


const CommandModal = ({ onRequestClose, ...props }) => {
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
    props.setUpdate(update => ++update)
    onRequestClose()
  }

  return (
    <StyledCommandModal closeTimeoutMS={200} ClassName="Modal" overlayClassName='Overlay' isOpen onRequestClose={onRequestClose} {...props}>
      <div className="modal-header">
        <div className="modal-title">
          <h1>{"!" + command}</h1>
        </div>
        <Button onClick={onRequestClose}><FontAwesomeIcon icon={faTimes} /></Button>
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
    </StyledCommandModal>
  )
}


export default CommandsPage
