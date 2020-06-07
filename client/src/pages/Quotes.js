import React, { useEffect, useState } from 'react';
import { Typography, Box, LinearProgress } from '@material-ui/core';
import { MemberList } from '../components/QuoteSidebarList';
import QuoteList from '../components/QuoteList';
import { QuoteEntry } from '../components/QuoteEntry';
import QuoteSearch from '../components/QuoteSearch'
import ReactPaginate from 'react-paginate';
import ResponsiveDrawer from '../components/Drawer'
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { backendCall, usePrevious } from '../utilities';
import Fade from '@material-ui/core/Fade';
import styled from 'styled-components';


const StyledProgress = styled(LinearProgress)`
${({ theme }) => `
  background-color: unset;

  .MuiLinearProgress-barColorPrimary {
    background-color: ${theme.colors.primaryFontColor};
  }
`}`

const QuotePage = (props) => {
  const history = useHistory();
  const location = useLocation();
  let lastlocation = usePrevious(location);
  const [skipLocationCheck, setSkipLocationCheck] = useState(false)

  const query = new URLSearchParams(location.search);
  const [guild, _] = useState(useParams().guild);
  const user = query.get("user");
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(1);

  const [memberList, setMemberList] = useState({});
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [quoteList, setQuoteList] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [displaySearch, setDisplaySearch] = useState("")

  const url = "/quotes";

  // scroll to top on rerender.
  useEffect(() => {
    window.scrollTo(
      { top: 0,
        left: 0,
        behavior: 'smooth'
      })
  })

  // fetch member list.
  useEffect(() => {
    backendCall.get(`/all_members?guild=${guild}`)
      .then((result) => {
        let data = [{}]
        for (var key in result.data) {
          data[result.data[key].user_id] = result.data[key]
        }
        setMemberList(data)
      })
  }, [])

  // force update when location is updated even if the route is the same.
  // Allows Navbar button to reset page and search on subsequent clicks.
  useEffect(() => {

    // reset locationcheck and skip.
    if (skipLocationCheck) {
      setSkipLocationCheck(false)
      return
    }

    if (lastlocation === undefined) {
      return
    }

    if (location.key !== lastlocation.key && location.pathname === lastlocation.pathname) {
      setCurrentPage(1)
      setSearchString("")
    }
    setForceUpdate(u => u + 1)
  }, [location])

  // reset search when the user changes.
  // triggers next useEffect
  useEffect(() => {
    setSearchString("")
  }, [user]);

  // reset page when search is set.
  useEffect(() => {
    setCurrentPage(1)
    setDisplaySearch("")
    // route won't change when pushing to history,
    // skip location check to avoid reset.
    setSkipLocationCheck(true)
    history.push({
      pathname: location.pathname,
      key: location.key,
      search: ""
    })
  }, [searchString])

  // fetch quote list.
  useEffect(() => {
    (async () => {
      setLoading(true)
      let params = []
      if (guild) { params.push(`guild=${guild}`) }
      if (user && !searchString) { params.push(`user=${user}`) }
      if (searchString) { params.push(`search=${encodeURIComponent(searchString)}`) }
      if (currentPage) { params.push(`page=${currentPage}`) }

      let result = await backendCall.get(url + `?${params.join('&')}`)

      setQuoteList(result.data.quotes)
      setPageCount(result.data.pages)
      setTimeout(() => {
        setLoading(false)
      }, 250)

      searchString && setDisplaySearch(searchString)
    })()
  }, [forceUpdate, currentPage, searchString])

  return (
    <>
      <Box style={{ display: loading ? "block" : "none" }}>
        <StyledProgress color="primary" variant="query" />
      </Box>
      <ResponsiveDrawer>
        {guild &&
          <MemberList
            guildId={guild}
            userId={user}
          />
        }
      </ResponsiveDrawer>

      <QuoteList>

        <Fade in={!loading} out={loading}>
          <Box>
            <Box className="quote-list-header" display="flex">
              {displaySearch &&
                // hide before loading finishes to avoid displaying prematurely
                <Typography>
                  Search: {displaySearch}
                </Typography>
              }

              {guild &&
                <QuoteSearch
                  searchString={searchString}
                  setSearchString={setSearchString}
                />
              }
            </Box>



            {quoteList.map((quote, i) =>
              <QuoteEntry
                key={i}
                quote={quote}
                memberList={memberList}
              />
            )}


            <Box display="flex" m={"auto"}>
              <ReactPaginate className="pagination"
                containerClassName="pagination"
                breakClassName="page-item"
                breakLabel={<button className="page-link">...</button>}
                previousLabel="<"
                nextLabel=">"
                pageCount={pageCount}
                forcePage={currentPage - 1}
                pageClassName="page-item"
                previousClassName="page-item"
                nextClassName="page-item"
                pageLinkClassName="page-link"
                previousLinkClassName="page-link"
                nextLinkClassName="page-link"
                activeClassName="active"
                onPageChange={(data) => setCurrentPage(data.selected + 1)}
              />
            </Box>
          </Box>
        </Fade>
      </QuoteList>
    </>
  );
};

export default QuotePage;
