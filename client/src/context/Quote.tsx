import React, { useState, useEffect, Dispatch } from 'react'
import { useParams } from 'react-router-dom';
import { backendCall } from '../utilities';


type ContextProps = {
  guild: string,
  user: string,
  searchString: string,
  memberList: object,
  pageCount: number,
  currentPage: number,
  quoteList: Array<any>
  setGuild: Dispatch<string>,
  setUser: Dispatch<string>,
  setSearchString: Dispatch<string>,
  setMemberList: Dispatch<object>,
  setPageCount: Dispatch<number>,
  setCurrentPage: Dispatch<number>,
  setQuoteList: Dispatch<any>
}

type ProviderProps = {
  children: JSX.Element[] | JSX.Element
}

export const QuotesContext = React.createContext<Partial<ContextProps>>({});

export const QuotesProvider = (props: ProviderProps) => {
  const { guildId, userId } = useParams();

  const [guild, setGuild] = useState(guildId);
  const [user, setUser] = useState(userId);
  const [searchString, setSearchString] = useState("");
  const [memberList, setMemberList] = useState({});
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [quoteList, setQuoteList] = useState([]);

  const url = "/quotes"

  // update guild/user/page when route changes.
  useEffect(() => {
    setUser(userId);
    setGuild(guildId);
    setCurrentPage(1)
  }, [guildId, userId]);


  // repopulate memberList when guildId changes.
  useEffect(() => {
    if (guildId) {
      backendCall.get(`/all_members?guild=${guildId}`)
        .then((result) => {
          let data = [{}]
          for (var key in result.data) {
            data[result.data[key].user_id] = result.data[key]
          }
          setMemberList(data)
        })
    }
  }, [guildId, setMemberList])


  // populate quote list.
  useEffect(() => {
    (async () => {
      let params = []

      if (guild) { params.push(`guild=${guild}`) }
      if (user && !searchString) { params.push(`user=${user}`) }
      if (searchString) { params.push(`search=${encodeURIComponent(searchString)}`) }
      if (currentPage) { params.push(`page=${currentPage}`) }

      let result = await backendCall.get(url + `?${params.join('&')}`)
      setQuoteList(result.data.quotes)
      setPageCount(result.data.pages)
    })()
  }, [guild, user, searchString, currentPage])


  return (
    <QuotesContext.Provider value={{
      guild,
      user,
      searchString,
      memberList,
      currentPage,
      pageCount,
      quoteList,
      setGuild,
      setUser,
      setSearchString,
      setMemberList,
      setCurrentPage,
      setPageCount,
      setQuoteList
    }}>
      {props.children}
    </QuotesContext.Provider>
  )
}
