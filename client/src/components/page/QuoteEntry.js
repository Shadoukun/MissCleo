import React, { useEffect, useState } from 'react';
import { toHTML } from 'discord-markdown';
import parse from 'html-react-parser';

import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Link
} from '@material-ui/core';
import { lighten, darken } from 'polished';
import styled from 'styled-components';

import { rgbToHex } from '../../utilities';
import { DiscordAvatar } from '../Avatar';
import { QuoteDropdown } from './QuoteDropdown';
import { fade } from '@material-ui/core/styles';

const QuoteTimestamp = styled.div`
${({ theme }) => `
  color: ${darken(0.5, theme.colors.primaryFontColor)};
`}`

const QuoteEntryStyled = styled(Box)`
${({ theme }) => `
  flex-grow: 1;
  margin-bottom: ${theme.spacing(1)}px;
  background-color: ${lighten(0.03, theme.colors.backgroundColor)};
  padding: ${theme.spacing(1)}px;
  padding-bottom: ${theme.spacing(2)}px;
  border: 1px solid ${fade(theme.colors.secondaryBackground, 0.9)};

  a, a:visited {
    color: #00b0f4;
  }
`}`


const QuoteHeader = ({ quote }) => {

  const QuoteInfo = () => (
    <Box className="quoteInfo" display="flex" flexGrow={1} ml={2} mb="auto" p={0}>
      <Box
        classname="quoteUserName"
        component={RouterLink}
        to={`/quotes/${quote.guild_id}/${quote.user_id}`}
        mr={1} fontWeight="fontWeightBold"
        style={{
          color: rgbToHex(quote.member.top_role.color),
          textDecoration: 'none'
        }}
      >
        {quote.member.display_name}
      </Box>

      <QuoteTimestamp>
        {quote.timestamp}
      </QuoteTimestamp>
    </Box>
  )

  return (
    <Box display="flex" p={1} pr={0}>
      <DiscordAvatar src={quote.user.avatar_url} />
      <QuoteInfo />
     <QuoteDropdown quote={quote} />
    </Box>
  )
}

export const QuoteEntry = ({ quote }) => {
  const [message, setMessage] = useState([]);

  useEffect(() => {
    let msg = []
    if (quote.message) {
      msg.push(parse(toHTML(quote.message, { escapeHTML: false })))
      if (quote.attachments) {
        msg.push(<br />)
      }
    }

    if (quote.attachments) {
      for (let file of quote.attachments) {
        msg.push(<img src={window.location.origin + `/files/${file}`} alt="" />)
      }
    }
    setMessage(msg)
  }, [quote]);

  return (
    <QuoteEntryStyled>
      <QuoteHeader quote={quote} />
      <Box className="quoteBody" ml={8} mt={-2}>
        {message}
      </Box>
    </QuoteEntryStyled>
  )
}
