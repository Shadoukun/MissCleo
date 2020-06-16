import React, { useEffect, useState, useRef } from 'react';
import { ModalProvider } from '../context/Modal';
import { useAuth } from '../context/Auth';
import { backendCall } from '../utilities';
import { Container, CssBaseline, Box } from '@material-ui/core';
import { ResponseListHeader, ResponseListMain } from '../components/page/Responses';
import { useParams } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars';


export const ResponsesPage = () => {
  const [responses, setResponses] = useState([]);
  const [update, setUpdate] = useState(0);
  const { requestconfig } = useAuth();
  const { guild } = useParams();

  const scrollBar = useRef();

  useEffect(() => {
    (async () => {
      let request = await backendCall.get(`/get_responses?guild=${guild}`, requestconfig)
      setResponses(request.data)
    })()
  }, [update, requestconfig]);

  return (
    <>
      <CssBaseline />
      <Box className="scrollbar-container" style={{ height: "calc(100vh - 64px)" }}>
        <Scrollbars ref={scrollBar}>
          <ModalProvider>
            <Container maxWidth="md">
              <ResponseListHeader update={update} setUpdate={setUpdate} />
              <ResponseListMain responses={responses} update={update} setUpdate={setUpdate} />
            </Container>
          </ModalProvider>
        </Scrollbars>
      </Box>
    </>
  );
};


export default ResponsesPage;
