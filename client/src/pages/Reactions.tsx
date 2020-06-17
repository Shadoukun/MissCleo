import React, { useEffect, useState, useRef } from 'react';
import { ModalProvider } from '../context/Modal';
import { useAuth } from '../context/Auth';
import { backendCall } from '../utilities';
import { Container, CssBaseline, Box } from '@material-ui/core';
import { ReactionListHeader, ReactionListMain } from '../components/page/Reactions';
import { useParams } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars';
import { CommandEntry } from '../types';


export const ReactionsPage = () => {
  const [reactions, setReactions] = useState<CommandEntry[]>([]);
  const [update, setUpdate] = useState(0);
  const { requestconfig } = useAuth();
  const { guild } = useParams();

  const scrollBar = useRef() as React.RefObject<Scrollbars>;

  useEffect(() => {
    (async () => {
      let request = await backendCall.get(`/get_reactions?guild=${guild}`, requestconfig)
      setReactions(request.data)
    })()
  }, [update, requestconfig]);

  return (
    <>
      <CssBaseline />
      <Box className="scrollbar-container" style={{ height: "calc(100vh - 64px)" }}>
        <Scrollbars ref={scrollBar}>
          <ModalProvider>
            <Container maxWidth="md">
              <ReactionListHeader update={update} setUpdate={setUpdate} />
              <ReactionListMain reactions={reactions} update={update} setUpdate={setUpdate} />
            </Container>
          </ModalProvider>
        </Scrollbars>
      </Box>
    </>
  );
};


export default ReactionsPage;
