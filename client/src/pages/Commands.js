import React, { useEffect, useState, useRef } from 'react';
import { CommandListHeader, CommandListMain } from '../components/page/Commands';
import { ModalProvider } from '../context/Modal';
import { useAuth } from '../context/Auth';
import { backendCall } from '../utilities';
import { Container, CssBaseline, Box } from '@material-ui/core'
import { useParams } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars';



const CommandsPage = (props) => {
  const [commands, setCommands] = useState([])
  const [update, setUpdate] = useState(0)
  const { requestconfig } = useAuth();
  const { guild } = useParams();

  const scrollBar = useRef();

  useEffect(() => {
    (async () => {
      let request = await backendCall.get(`/get_commands?guild=${guild}`, requestconfig)
      setCommands(request.data)
    })()
  }, [update, requestconfig])

  return (
    <>
      <CssBaseline />
      <Box style={{ height: "calc(100vh - 64px)" }}>
        <Scrollbars ref={scrollBar} {...props}>
          <ModalProvider>
            <Container maxWidth="md" >
              <CommandListHeader update={update} setUpdate={setUpdate} />

              <CommandListMain commands={commands} update={update} setUpdate={setUpdate} />
            </Container>
          </ModalProvider>
        </Scrollbars>
      </Box>
    </>
  )
}


export default CommandsPage;
