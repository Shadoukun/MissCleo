import React, { createContext, PropsWithChildren, useState, useEffect } from 'react';
import { MemberListType, MemberEntry } from '../types';
import { useParams } from 'react-router';
import { backendCall } from '../utilities';


type GuildContextType = {
  guild: string
  guildData: Guild
  user: string
  memberList: MemberListType

  setGuild: React.Dispatch<string>
  setUser: React.Dispatch<string>
}

type Guild = {
  id: string
  name: string
  icon_url: string
}

export const GuildContext = createContext<Partial<GuildContextType>>({});

export const GuildProvider = (props: PropsWithChildren<{}>) => {
  const { guild: guildId, user: userId } = useParams();

  const [guild, setGuild] = useState<string>(guildId);
  const [user, setUser] = useState<string>(userId);
  const [memberList, setMemberList] = useState<MemberListType>({});
  const [guildData, setGuildData] = useState()

  useEffect(() => {
    fetchGuild().then((data) => {
      setGuildData(data[0])
    }).then(() => {
      (async () => {
        let members = await fetchMembers()
        setMemberList(members)
      })();
    })
  }, [])

  useEffect(() => {
    setUser(userId)
  }, [userId])

  const fetchMembers = async () => {
    let result = await backendCall.get(`/all_members?guild=${guild}`)
    let data: MemberListType = {}
    result.data.forEach((m: MemberEntry) => {
      data[m.user_id] = m
    });
    return data
  };

  const fetchGuild = async () => {
    let result = await backendCall.get(`/guilds?guild=${guild}`)
    return result.data
  }

  return (
    <GuildContext.Provider value={{ guild, setGuild, user, setUser, guildData, memberList }} >
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
