import React from 'react';
import { Box, Typography } from '@material-ui/core';
import styled from 'styled-components';

const BackgroundBox = styled(Box) <any>`
${({theme}) => `
    background: linear-gradient( rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) ), url('${window.location.origin + '/background.jpg'}');
    background-size: cover;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    width: 100%;
    color: ${theme.colors.primaryFontColor}

`}`

const IndexBox = styled(Box)<any>`
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const LogoImage = styled.img`
    max-height: 350px;
    max-width: 80vw;
    margin-bottom: 16px;
    margin-top: auto
`

const FooterText = styled(Typography) <any>`
    margin-top: auto;
    margin-bottom: auto;
`

const IndexPage = () => (
    <BackgroundBox>
        <IndexBox>
            <LogoImage src={window.location.origin + "/miss_cleo.png"} alt="" />
            <Typography variant="h2">Miss Cleo</Typography>
            <Typography>CALL ME NAO!</Typography>
        </IndexBox>
    </BackgroundBox>
)

export default IndexPage
