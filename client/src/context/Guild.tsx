import React, { createContext, PropsWithChildren, useState, useEffect } from 'react';
import { MemberListType, MemberEntry } from '../types';
import { useParams } from 'react-router';
import { backendCall } from '../utilities';


type GuildContextType = {
  guild: Guild
  user: string
  memberList: MemberListType

  setGuild: React.Dispatch<Guild>
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

  const [guild, setGuild] = useState<Guild | undefined>();
  const [user, setUser] = useState<string>(userId);
  const [memberList, setMemberList] = useState<MemberListType>({});

  useEffect(() => {
    fetchGuild().then((data) => {
      setGuild(data)
      setMemberList(data.members)
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
