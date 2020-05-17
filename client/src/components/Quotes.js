import React, { useState, useEffect } from 'react';
import Copy from 'copy-to-clipboard';
import { Link as RouterLink, useParams } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import { IconButton } from './Button';
import {
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListSubheader,
  Paper,
  Menu,
  MenuItem
} from '@material-ui/core';
import { lighten, darken } from 'polished';
import styled from 'styled-components';

import { backendCall, rgbToHex } from '../utilities';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiscordAvatar } from './Avatar';

const SidebarLink = styled(Link)`
${({ theme }) => `
  color: ${theme.colors.primaryFontColor};

  &:hover {
    color: inherit;
    text-decoration: none;
  }

  &.active .MuiListItem-button::after {
    content: " ";
    white-space: pre;
    background: white;
    position: absolute;
    left: 0;
    height: 50px;
  }
`}`

const QuoteEntryStyled = styled(Paper)`
${({ theme }) => `
  flex-grow: 1;
  margin-bottom: 10px;
  background-color: "gray";
  padding: 10px;
  padding-bottom: 20px;
  padding-right: 5px;
  background: #36393f;

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
    margin-top: -5px;
    max-width: 100%;
    padding-right: 20px;

    img {
      height: auto;
      max-height: 300px;
    }
  }
`}`

const QuoteListStyled = styled.div`
${({ theme }) => `
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  padding: ${theme.spacing(2)}px;
  color: ${theme.colors.primaryFontColor};

  ${theme.breakpoints.up('sm')} {
    margin-left: ${theme.drawerWidth}px;
  }

  .pagination {
    padding-top: 1em;
    padding-bottom: 2em;
    display: inline-flex !important;
    margin: auto;

    .page-item {
      color: white;

        .page-link {
          color: white;
          background: ${theme.colors.backgroundColor};
          border: 1px solid ${theme.colors.secondaryBackground};

          &:active, &:focus, &:hover {
            box-shadow: none !important;
          }
        }

      &.active .page-link {
          color: ${ darken(0.05, theme.colors.primaryFontColor)};
          background: ${ lighten(0.1, theme.colors.backgroundColor)};
      }
    }

    &.active {
      border:
      background: #474a51;
    }
  }
`}`

const QuoteDropdownButton = styled(IconButton)`
${({ theme }) => `
  border-radius: 5px;
  padding: 10px;
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


const SidebarListHeader = ({ name }) => (
  <ListSubheader component="div" id={`nested-list-${name}`}>
    {name}
  </ListSubheader>
)

export const GuildList = ({ setGuild }) => {
  const [guildList, setGuildList] = useState([]);
  const { guildId } = useParams();

  const isActive = (value) => (value === guildId ? "active" : '')


  useEffect(() => {
    (async () => {
      let request = await backendCall.get('/guilds')
      setGuildList(request.data)
    })()
  }, [])


  return (
    <List
      aria-labelledby="Servers"
      subheader={<SidebarListHeader name="Servers" />}
    >
      {guildList.map((guild, i) =>
        <GuildEntry key={i}
          activeClass={isActive(guild.id)}
          guild={guild}
          onClick={() => setGuild(guild.id)}
        />
      )}

    </List>
  )
}


export const MemberList = ({ guildId, activeUserId, setUser }) => {
  const [userList, setUserList] = useState([]);
  const { userId } = useParams();

  const isActive = (value) => (value === userId ? "active" : '')

  useEffect(() => {
    (async () => {
      let request = await backendCall.get(`/members?guild=${guildId}`)
      setUserList(request.data)
    })()
  }, [guildId])

  return (
    <List aria-labelledby="Members"
      subheader={<SidebarListHeader name="Members" />}
    >
      {userList.map((user, i) =>
        <MemberEntry key={i}
          activeClass={isActive(user.user_id)}
          user={user}
          guildId={guildId}
        />
      )}
    </List>
  )
}


const GuildEntry = ({ guild, activeClass }) => {
  return (
    <SidebarLink className={activeClass} component={RouterLink} to={`/quotes/${guild.id}`} underline="none">
      <ListItem button>
        <ListItemAvatar className="sidebarAvatar">
          <DiscordAvatar src={guild.icon_url} />
        </ListItemAvatar>
        <ListItemText primary={guild.name} />
      </ListItem>
    </SidebarLink>
  )
}


export const MemberEntry = ({ activeClass, guildId, user }) => (
  <SidebarLink className={activeClass} component={RouterLink} to={`/quotes/${guildId}/${user.user_id}`}>
    <ListItem button>
      <ListItemAvatar>
        <DiscordAvatar src={user.user.avatar_url} />
      </ListItemAvatar>
      <ListItemText primary={user.display_name} style={{ color: rgbToHex(user.top_role.color) }} />
    </ListItem>
  </SidebarLink>
)


export const QuoteList = ({ guildId, userId }) => {

  const [quoteList, setQuoteList] = useState([]);
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const url = "/quotes"

  // reset currentPage when userId changes.
  useEffect(() => {
    setCurrentPage(1)
  }, [guildId, userId])

  useEffect(() => {
    (async () => {
      let params = []

      if (guildId) { params.push(`guild=${guildId}`) }
      if (userId) { params.push(`user=${userId}`) }
      if (currentPage) { params.push(`page=${currentPage}`) }

      let result = await backendCall.get(url + `?${params.join('&')}`)
      setQuoteList(result.data.quotes)
      setPageCount(result.data.pages)
    })()
  }, [guildId, userId, currentPage])

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1)
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  return (
    <QuoteListStyled>
      {quoteList.map((quote, i) =>
        <QuoteEntry key={i} quote={quote} />
      )}

      {!!quoteList.length &&
        <ReactPaginate className="pagination"
          containerClassName="pagination"
          breakClassName="page-item"
          breakLabel={<button className="page-link">...</button>}
          previousLabel="<"
          nextLabel=">"
          pageCount={pageCount}
          forcePage={currentPage - 1}
          pageClassName="page-item"
          previousClassName="page-item"
          nextClassName="page-item"
          pageLinkClassName="page-link"
          previousLinkClassName="page-link"
          nextLinkClassName="page-link"
          activeClassName="active"
          onPageChange={handlePageClick}
        />
      }
    </QuoteListStyled>
  )
}


const QuoteHeader = ({ quote }) => (
  <div className="quoteHeader">
    <DiscordAvatar src={quote.user.avatar_url} />
    <div className="quoteInfo">
      <div className="quoteUsername" style={{ color: rgbToHex(quote.member.top_role.color) }}>
        {quote.member.display_name}
      </div>
      <div className="quoteTimestamp">{quote.timestamp}</div>
    </div>
    <QuoteDropdown quote={quote} />
  </div>
)


const QuoteEntry = ({ quote }) => (
  <QuoteEntryStyled elevation={2}>
    <QuoteHeader quote={quote} />
    <div className="quoteBody">
      {quote.message ? (
        quote.message.split('\n').map((item, key) => (
          <span key={key}>{item}<br /></span>)
        )
      ) : (quote.message)}

      {quote.attachments && quote.attachments.map((file, i) =>
        <img src={window.location.origin + `/files/${file}`} alt="" />
      )}
    </div>
  </QuoteEntryStyled>
)


const QuoteDropdown = ({ quote }) => {
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
      <QuoteDropdownButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
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
        }
        }
      >
        <MenuItem onClick={copyId}>Copy Quote ID</MenuItem>
      </QuoteDropdownMenu>
    </>
  )
}
