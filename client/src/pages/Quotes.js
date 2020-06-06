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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const QuotePage = (props) => {
  const history = useHistory();
  const location = useLocation();
  const lastlocation = usePrevious(location);
  const query = new URLSearchParams(location.search);
  const { guild } = useParams();
  const user = query.get("user");

  const [searchString, setSearchString] = useState("");
  const [memberList, setMemberList] = useState({});
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [quoteList, setQuoteList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(1);
  const url = "/quotes";


  useEffect(() => {
    if (lastlocation === undefined) {
      return
    }

    if (location.key != lastlocation.key && location.pathname === lastlocation.pathname) {
      setCurrentPage(1)
      setSearchString("")
      setUpdate(update + 1)
    }
  }, [location])

  // Set current page when guild/user changes
  useEffect(() => {
    setCurrentPage(1)
    setSearchString("")
    setUpdate(update + 1)
  }, [guild, user]);

  const setSearch = (value) => {
    setSearchString(value)
    setUpdate(update + 1)
  }

  const setPage = (value) => {
    setCurrentPage(value)
    setUpdate(update + 1)
  }

  // repopulate memberList when guildId changes.
  useEffect(() => {
    if (guild) {
      backendCall.get(`/all_members?guild=${guild}`)
        .then((result) => {
          let data = [{}]
          for (var key in result.data) {
            data[result.data[key].user_id] = result.data[key]
          }
          setMemberList(data)
        })
    }
  }, [guild])

  // populate quote list.
  useEffect(() => {
    setLoading(true)
    let params = []
    if (guild) { params.push(`guild=${guild}`) }
    if (user && !searchString) { params.push(`user=${user}`) }
    if (searchString) { params.push(`search=${encodeURIComponent(searchString)}`) }
    if (currentPage) { params.push(`page=${currentPage}`) }

    backendCall.get(url + `?${params.join('&')}`)
      .then((result) => {
        setQuoteList(result.data.quotes)
        setPageCount(result.data.pages)

        setTimeout(() => {
          setLoading(false)
        }, 250)
      })
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [update])

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
              {searchString &&
                <Typography>
                  Search: {searchString}
                </Typography>
              }

              {guild &&
                <QuoteSearch
                  searchString={searchString}
                  setSearchString={setSearch}
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
              onPageChange={(data) => setPage(data.selected + 1)}
              />
            </Box>
          </Box>
        </Fade>
      </QuoteList>
    </>
  );
};

export default QuotePage;
