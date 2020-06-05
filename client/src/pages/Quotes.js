import React, { useEffect, useState } from 'react';
import { Typography, Box } from '@material-ui/core';
import { MemberList } from '../components/QuoteSidebarList';
import QuoteList from '../components/QuoteList';
import { QuoteEntry } from '../components/QuoteEntry';
import QuoteSearch from '../components/QuoteSearch'
import ReactPaginate from 'react-paginate';
import ResponsiveDrawer from '../components/Drawer'
import { useParams, useLocation } from 'react-router-dom';
import { backendCall } from '../utilities';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const QuotePage = (props) => {
  const query = useQuery();
  const { guild } = useParams();
  const user = query.get("user")

  const [searchString, setSearchString] = useState("");
  const [memberList, setMemberList] = useState({});
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [quoteList, setQuoteList] = useState([]);

  const url = "/quotes"

  // Set current page when guild/user changes
  useEffect(() => {
    setCurrentPage(1)
    setSearchString("")
  }, [guild, user]);

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
    (async () => {
      let params = []

      if (guild) { params.push(`guild=${guild}`) }
      if (user && !searchString) { params.push(`user=${user}`) }
      if (searchString) { params.push(`search=${encodeURIComponent(searchString)}`) }
      if (currentPage) { params.push(`page=${currentPage}`) }

      let result = await backendCall.get(url + `?${params.join('&')}`)
      setQuoteList(result.data.quotes)
      setPageCount(result.data.pages)
    })();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [guild, user, searchString, currentPage])

  return (
    <>
      <ResponsiveDrawer>
        {guild &&
          <MemberList
            guildId={guild}
            userId={user}
          />
        }
      </ResponsiveDrawer>

      <QuoteList>
        <Box className="quote-list-header" display="flex">
          {searchString &&
            <Typography>
              Search: {searchString}
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

        {!!quoteList.length &&
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
        }
      </QuoteList>
    </>
  );
};

export default QuotePage;
