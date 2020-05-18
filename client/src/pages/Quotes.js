import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QuoteList } from '../components/page/QuoteMain'
import { QuotesSidebar } from '../components/page/QuoteSidebar';


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
      <QuotesSidebar
        setGuild={setGuild}
        activeGuildId={guild}
        activeUserId={user}
        setUser={setUser}
      />
      <QuoteList guildId={guild} userId={user} />
    </>
  )

}

export default QuotePage
