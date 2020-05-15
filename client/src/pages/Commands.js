import React, { useEffect, useState } from 'react';
import { CommandListHeader, CommandListMain } from '../components/Commands';
import { ModalProvider } from '../context/Modal';
import { useAuth } from '../context/Auth';
import { backendCall } from '../utilities';
import { Container, CssBaseline } from '@material-ui/core'


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
    <>
      <CssBaseline />
      <ModalProvider>
        <Container maxWidth="md">
          <CommandListHeader update={update} setUpdate={setUpdate} />
          <CommandListMain commands={commands} update={update} setUpdate={setUpdate} />
        </Container>
      </ModalProvider>
    </>
  )
}


export default CommandsPage;
