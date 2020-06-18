import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { fade } from '@material-ui/core/styles';
import { lighten, darken } from 'polished';
import { toHTML } from 'discord-markdown';
import parse from 'html-react-parser';
import styled from 'styled-components';

import { rgbToHex } from '../utilities';
import { DiscordAvatar } from './Avatar';
import { QuoteDropdown } from './QuoteDropdown';
import { useGuildContext } from '../context/Guild';

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

  .quoteBody {
    img {
      max-width: 80%;
    }
  }

  .d-user {
    color: #7289da;
    background: rgba(114,137,218,.1);
    font-weight: bold;
  }
`}`


const QuoteHeader = ({ quote }) => {

  const QuoteInfo = () => (
    <Box className="quoteInfo" display="flex" flexGrow={1} ml={2} mb="auto" p={0}>
      <Box
        className="quote-username"
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

export const QuoteEntry = ({ quote, ...props }) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);

  const { memberList } = useGuildContext();

  useEffect(() => {
    if (quote.message) {
      setMessage(
        parse(toHTML(quote.message, {
          escapeHTML: false,
          discordCallback: {
            user: node => { return memberList ? '@' + memberList[node.id].display_name : node } }
          }
        ))
      )
    } else {
      setMessage("")
    }

    if (quote.attachments) {
      setAttachments(quote.attachments)
    } else {
      setAttachments([])
    }
  }, [quote, memberList]);

  return (
    <QuoteEntryStyled key={props.key}>
      <QuoteHeader quote={quote} />
      <Box className="quoteBody" ml={8} mt={-2}>
        {message}
        {( message && attachments) && <br />}

        {attachments.map((attachment, i) =>
          <img src={window.location.origin + `/files/${attachment}`} alt="" />
        )}
      </Box>
    </QuoteEntryStyled>
  )
}
