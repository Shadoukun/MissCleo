import React, { createContext, PropsWithChildren, useState, useEffect } from 'react';
import { MemberEntryList, MemberEntry } from '../types';
import { useParams } from 'react-router';
import { backendCall } from '../utilities';


type GuildContextType = {
  guild: Guild
  user: string
  memberList: MemberEntryList

  setGuild: React.Dispatch<Guild>
  setUser: React.Dispatch<string>
}

type Guild = {
  id: string
  name: string
  icon_url: string
  members: MemberEntryList
  roles: Role
}

type Role = {
  id: string
  guild_id: string
  color: string
  name: string
  position: string
  raw_permissions: string
}

type RoleList = {
  [key: string]: Role
}

export const GuildContext = createContext<Partial<GuildContextType>>({});

export const GuildProvider = (props: PropsWithChildren<{}>) => {
  const { guild: guildId, user: userId } = useParams();

  const [guild, setGuild] = useState<Guild | undefined>();
  const [user, setUser] = useState<string>(userId);
  const [memberList, setMemberList] = useState<MemberEntryList | undefined>();
  const [roleList, setRoleList] = useState<RoleList | undefined>()

  useEffect(() => {
    fetchGuild().then((data) => {
      setGuild(data)

      let members = data.members.reduce((members: MemberEntryList, m: MemberEntry) => {
        members[m.user_id] = m
        return members
      }, {});
      setMemberList(members)

      let roles = data.roles.reduce((roles: RoleList, r: Role) => {
        roles[r.id] = r
        return roles
      }, {})
      setRoleList(roles)
    })
  }, [])

  useEffect(() => {
    setUser(userId)
  }, [userId])

  const fetchGuild = async () => {
    let result = await backendCall.get(`/guilds?guild=${guildId}`)
    return result.data[0]
  }

  return (
    <GuildContext.Provider value={{ guild, setGuild, user, setUser, memberList }} >
      {props.children}
    </GuildContext.Provider>
  )
}

export const useGuildContext = () => {
  const context = React.useContext(GuildContext)
  if (context === undefined) {
    throw new Error('useGUildContext must be used within a GuildProvider.')
  }
  return context
}
