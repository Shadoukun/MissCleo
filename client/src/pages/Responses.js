import React, { useEffect, useState } from 'react';
import { CommandListHeader, CommandListMain } from '../components/Commands';
import { ModalProvider } from '../context/Modal';
import { useAuth } from '../context/Auth';
import { backendCall } from '../utilities';
import { Container, CssBaseline } from '@material-ui/core'
import { ResponseListHeader, ResponseListMain } from '../components/Responses'


export const ResponsesPage = () => {
    const [responses, setResponses] = useState([])
    const [update, setUpdate] = useState(0)
    const { requestconfig } = useAuth();

    useEffect(() => {
        (async () => {
            let request = await backendCall.get('/getresponses', requestconfig)
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
