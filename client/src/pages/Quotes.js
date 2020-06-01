import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QuoteList } from '../components/page/QuoteMain';
import { GuildList, MemberList } from '../components/page/QuoteSidebar';
import ResponsiveDrawer from '../components/Drawer'
import { backendCall } from '../utilities';


const QuotePage = (props) => {
  const { guildId, userId } = useParams();
  const [guild, setGuild] = useState();
  const [user, setUser] = useState();
  const [searchString, setSearchString] = useState("");
  const [memberList, setMemberList] = useState({});

  useEffect(() => {
    setUser(userId);
    setGuild(guildId);
  }, [guildId, userId]);

  useEffect(() => {
    // get list of members for parsing @mentions.
    if (guildId) {
      let result = backendCall.get(`/all_members?guild=${guildId}`)
        .then((result) => {
          let data = {}
          for (var key in result.data) {
            data[result.data[key].user_id] = result.data[key]
          }
          setMemberList(data)
        })
    }
  }, [guildId, setMemberList]);

  return (
    <>
      <ResponsiveDrawer>
        <GuildList setGuild={setGuild} activeGuildId={guild} />

        {guild &&
          <MemberList guildId={guild} activeUserId={user} setUser={setUser} />}
      </ResponsiveDrawer>

      <QuoteList
        guildId={guild}
        userId={user}
        memberList={memberList}
        searchString={searchString}
        setSearchString={setSearchString}
      />
    </>
  );
};

export default QuotePage;
