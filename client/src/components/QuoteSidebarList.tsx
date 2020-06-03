import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  List,
  ListSubheader,
} from '@material-ui/core';
import { backendCall, rgbToHex } from '../utilities';
import { QuotesContext } from '../context/Quote';
import SidebarEntry from './QuoteSidebarEntry';


type ListHeaderProps = {
  name: string
}

type ListProps = {
  guildId: string,
  setGuild: React.Dispatch<string>,
}


const SidebarListHeader = (props: ListHeaderProps) => (
  <ListSubheader component="div" id={`nested-list-${props.name}`}>
    {props.name}
  </ListSubheader>
)


export const GuildList = ({ setGuild }: ListProps) => {
  const context = useContext(QuotesContext);
  const [guildList, setGuildList] = useState([]);
  // const { guildId } = useParams();

  const isActive = (value: string) => (value === context.guild ? "active" : '')


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
      {guildList.map((guild: any, i) =>
        <SidebarEntry
          key={i}
          to={`/quotes/${guild.id}`}
          name={guild.name}
          icon={guild.icon_url}
          activeClass={isActive(guild.id)}
          onClick={() => setGuild(guild.id)}
        />
      )}

    </List>
  )
}


export const MemberList = ({ guildId }: ListProps) => {
  const [userList, setUserList] = useState([]);
  const { userId } = useParams();

  const isActive = (value: string) => (value === userId ? "active" : '')

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
      {userList.map((user: any, i) =>
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
