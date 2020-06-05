import React, { useEffect, useState } from 'react';
import { ModalProvider } from '../context/Modal';
import { useAuth } from '../context/Auth';
import { backendCall } from '../utilities';
import { Container, CssBaseline } from '@material-ui/core'
import { ResponseListHeader, ResponseListMain } from '../components/page/Responses'
import { useParams } from 'react-router-dom';


export const ResponsesPage = () => {
    const [responses, setResponses] = useState([])
    const [update, setUpdate] = useState(0)
    const { requestconfig } = useAuth();
    const { guild } = useParams();

    useEffect(() => {
        (async () => {
            let request = await backendCall.get(`/get_responses?guild=${guild}`, requestconfig)
            setResponses(request.data)
        })()
    }, [update, requestconfig])

    return (
        <>
            <CssBaseline />
            <ModalProvider>
                <Container maxWidth="md">
                    <ResponseListHeader update={update} setUpdate={setUpdate} />
                    <ResponseListMain responses={responses} update={update} setUpdate={setUpdate} />
                </Container>
            </ModalProvider>
        </>
    )
}


export default ResponsesPage;
