import React, { useEffect, useState } from 'react';
import { Button, IconButton } from '../Button';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import styled from 'styled-components';
import Copy from 'copy-to-clipboard';
import { darken } from 'polished';

import {
  Menu,
  MenuItem
} from '@material-ui/core';

const QuoteDropdownButton = styled(IconButton)`
${({ theme }) => `
  border-radius: 5px;
  padding: ${theme.spacing(1)};
  padding-top: 0;
  transition: ${theme.transitions.create(['color'])};

  &:hover, &:hover svg {
    background: transparent;
    color: ${theme.colors.primaryFontColor};
    transition: ${theme.transitions.create(['color'])};
  }

  svg {
    color: ${darken(0.5, theme.colors.primaryFontColor)};
  }
`}`

const QuoteDropdownMenu = styled(Menu)`
${({ theme }) => `

  .MuiPaper-root {
    background: ${theme.colors.secondaryBackground};
  }

  ul {
    padding: 0;
  }

  li {
    padding: 12px;
    font-size: 12px;
    font-weight: bold;
  }
`}`

export const QuoteDropdown = ({ quote }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [quoteId, setQuoteId] = useState(quote.message_id)

  useEffect(() => {
    setQuoteId(quote.message_id)
  }, [quote])

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const copyId = () => {
    Copy(quoteId)
    handleClose()
  }

  return (
    <>
      <QuoteDropdownButton
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <ExpandMoreIcon />
      </QuoteDropdownButton>

      <QuoteDropdownMenu
        id="simple-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={copyId}>Copy Quote ID</MenuItem>
      </QuoteDropdownMenu>
    </>
  )
}
