import React, { useEffect, useState } from 'react';
import { ModalProvider } from '../context/Modal';
import { useAuth } from '../context/Auth';
import { backendCall } from '../utilities';
import { Container, CssBaseline } from '@material-ui/core'
import { ReactionListHeader, ReactionListMain } from '../components/page/Reactions'


export const ReactionsPage = () => {
    const [reactions, setReactions] = useState([])
    const [update, setUpdate] = useState(0)
    const { requestconfig } = useAuth();

    useEffect(() => {
        (async () => {
            let request = await backendCall.get('/getreactions', requestconfig)
            setReactions(request.data)
        })()
    }, [update, requestconfig])

    return (
        <>
            <CssBaseline />
            <ModalProvider>
                <Container maxWidth="md">
                    <ReactionListHeader update={update} setUpdate={setUpdate} />
                    <ReactionListMain reactions={reactions} update={update} setUpdate={setUpdate} />
                </Container>
            </ModalProvider>
        </>
    )
}


export default ReactionsPage;
