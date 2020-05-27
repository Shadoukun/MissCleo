import React, { useEffect, useState } from 'react';
import { toHTML } from 'discord-markdown';
import parse from 'html-react-parser';

import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Link
} from '@material-ui/core';
import { darken } from 'polished';
import styled from 'styled-components';

import { rgbToHex } from '../../utilities';
import { DiscordAvatar } from '../Avatar';
import { QuoteDropdown } from './QuoteDropdown';
import { fade } from '@material-ui/core/styles';


const QuoteEntryStyled = styled.div`
${({ theme }) => `
  flex-grow: 1;
  margin-bottom: 10px;
  background-color: "gray";
  padding: 10px;
  padding-bottom: 20px;
  padding-right: 5px;
  background: #36393f;
  border: 1px solid ${fade(theme.colors.secondaryBackground, 1)};


  .quoteHeader {
    padding: 5px;
    display: flex;
  }

  .quoteInfo {
    display: flex;
    flex-grow: 1;
    margin-bottom: auto;
    margin-left: 15px;
  }

  .quoteUsername {
    margin-right: 5px;
    font-weight: bold;
  }

  .quoteTimestamp {
    color: ${darken(0.5, theme.colors.primaryFontColor)};
  }

  .quoteBody {
    text-align: left;
    margin-left: 60px;
    margin-top: -15px;
    max-width: 100%;
    padding-right: 20px;

    a, a:visited {
      color: #00b0f4;
    }

    img {
      height: auto;
      max-height: 300px;
    }
  }
`}`

const QuoteHeader = ({ quote }) => (
  <div className="quoteHeader">
    <DiscordAvatar src={quote.user.avatar_url} />
    <div className="quoteInfo">
      <Link
        className="quoteUsername"
        component={RouterLink}
        to={`/quotes/${quote.guild_id}/${quote.user_id}`}
        style={{ color: rgbToHex(quote.member.top_role.color) }}
      >
        {quote.member.display_name}
      </Link>
      <div className="quoteTimestamp">{quote.timestamp}</div>
    </div>
    <QuoteDropdown quote={quote} />
  </div>
)

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
      <div className="quoteBody">
        {message}
      </div>
    </QuoteEntryStyled>
  )
}
