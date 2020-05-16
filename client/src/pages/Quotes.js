import React, { useState, useEffect } from 'react';
import ResponsiveDrawer from '../components/Drawer'
import { GuildList, MemberList, QuoteList } from '../components/Quotes'
import { useParams } from 'react-router-dom';


const QuotePage = (props) => {
  const { guildId, userId } = useParams();
  const [guild, setGuild] = useState();
  const [user, setUser] = useState();

  useEffect(() => {
    setUser(userId);
    setGuild(guildId);
  }, [guildId, userId])

  return (
    <>
      <ResponsiveDrawer>
        <GuildList setGuild={setGuild} activeGuildId={guild} />
        {guild && <MemberList guildId={guild} activeUserId={user} setUser={setUser} />}
      </ResponsiveDrawer>
      <QuoteList guildId={guild} userId={user} />
    </>
  )

}

export default QuotePage
