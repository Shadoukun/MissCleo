import React, { Component, useEffect, useState, createContext, Fragment } from 'react';
import { Container, Col, Row, Button } from 'react-bootstrap';
import styled from 'styled-components';
import axios from 'axios';
import ReactModal from 'react-modal';
import {
  ModalContext,
  ModalProvider,
  ModalConsumer,
  ModalRoot
} from '../context/Modal';
import { StyledModal } from '../components/CommandComponents';

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const CommandEntry = styled.div`
  display: flex;
  background: gray;
  padding: 1em;
  
  button {
    margin-left: auto
  }
`

const CommandsPage = () => {

  return (
    <Container>
      <Row>
        <Col>
          <CommandsHeader />
          <CommandsList />
        </Col>
      </Row>
    </Container>
  )
}


const CommandsHeader = () => {

  useEffect(() => {

  }, [])

  return (
    <HeaderWrapper>
      <h1>Chat Commands</h1>
      <Button>Add Command</Button>
    </HeaderWrapper>
  )

}

const CommandsList = () => {
  const [commandList, setCommandList] = useState([])

  useEffect(() => {
    (async () => {
      let request = await axios('/getcommands')
      setCommandList(request.data)
    })()
  }, [])

  return (
    <div>
      <ModalProvider>
        <ModalRoot />
        <ModalConsumer>
          {({ showModal }) => (
            commandList.map((command, i) =>
              <Fragment>
                <CommandEntry>
                  {command.command}
                  <Button onClick={() => showModal(Modal1, { command: command })}>
                    Edit
                  </Button>
                </CommandEntry>
              </Fragment>
            )
          )}
        </ModalConsumer>


      </ModalProvider>
    </div>
  )
}


const Modal1 = ({ onRequestClose, ...otherProps }) => (
  <StyledModal modalClassName="Modal" overlayClassName='Overlay' isOpen onRequestClose={onRequestClose} {...otherProps}>
      <div class="modal-header">
        <Button onClick={onRequestClose}>close</Button>
      </div>
    <div class="modal-content">
      <div>I am a {otherProps.command.command}</div>
    </div>
  </StyledModal>
);


export default CommandsPage
