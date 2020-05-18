import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListSubheader,
} from '@material-ui/core';
import styled from 'styled-components';

import { backendCall, rgbToHex } from '../../utilities';
import { DiscordAvatar } from '../Avatar';
import ResponsiveDrawer from '../Drawer'


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

export const QuotesSidebar = ({ activeGuildId, activeUserId, setUser, setGuild }) => (
  <ResponsiveDrawer>
    <GuildList setGuild={setGuild} activeGuildId={activeGuildId} />
    {activeGuildId &&
      <MemberList
        guildId={activeGuildId}
        activeUserId={activeUserId}
        setUser={setUser} />}
  </ResponsiveDrawer>
)

const SidebarListHeader = ({ name }) => (
  <ListSubheader component="div" id={`nested-list-${name}`}>
    {name}
  </ListSubheader>
)

const GuildList = ({ setGuild }) => {
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

const MemberList = ({ guildId, activeUserId, setUser }) => {
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

const MemberEntry = ({ activeClass, guildId, user }) => (
  <SidebarLink className={activeClass} component={RouterLink} to={`/quotes/${guildId}/${user.user_id}`}>
    <ListItem button>
      <ListItemAvatar>
        <DiscordAvatar src={user.user.avatar_url} />
      </ListItemAvatar>
      <ListItemText primary={user.display_name} style={{ color: rgbToHex(user.top_role.color) }} />
    </ListItem>
  </SidebarLink>
)
