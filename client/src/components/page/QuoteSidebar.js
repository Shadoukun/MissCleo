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

  .MuiListItemText-primary {
    line-height: 1.2;
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
        <SidebarEntry
          key={i}
          to={`/quotes/${guild.id}`}
          name={guild.name}
          icon={guild.icon_url}
          activeClass={isActive(guild.id)}
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
        <SidebarEntry
          key={i}
          to={`/quotes/${guildId}/${user.user_id}`}
          name={user.display_name}
          icon={user.user.avatar_url}
          activeClass={isActive(user.user_id)}
          textProps={{
            style: { color: rgbToHex(user.top_role.color) }
          }}

        />
      )}
    </List>
  )
}

const SidebarEntry = ({ to, name, icon, activeClass, textProps }) => (
  <SidebarLink className={activeClass} component={RouterLink} to={to} underline="none">
    <ListItem button>
      <ListItemAvatar className="sidebarIcon">
        <DiscordAvatar src={icon} />
      </ListItemAvatar>
      <ListItemText primary={name} {...textProps} />
    </ListItem>
  </SidebarLink>
)
