import React, { useState, useContext } from 'react';
import { Typography, Box } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import { QuotesContext } from '../context/Quote';
import { GuildList, MemberList } from '../components/QuoteSidebarList';
import QuoteList from '../components/QuoteList';
import { QuoteEntry } from '../components/QuoteEntry';
import { Search, SearchIconWrapper, SearchInput } from '../components/QuoteSearch'
import ReactPaginate from 'react-paginate';
import ResponsiveDrawer from '../components/Drawer'


const QuotePage = (props) => {
  const context = useContext(QuotesContext);
  const [searchContent, setSearchContent] = useState("");

  const handlePageClick = (data) => {
    context.setCurrentPage(data.selected + 1)
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  const searchSubmit = (event) => {
    event.preventDefault();
    context.setSearchString(searchContent)
  }

  return (
    <>
      <ResponsiveDrawer>
        <GuildList
          setGuild={context.setGuild}
          activeGuildId={context.guild}
        />

        {context.guild &&
          <MemberList
            guildId={context.guild}
            activeUserId={context.user}
            setUser={context.setUser}
          />
        }
      </ResponsiveDrawer>

      {/* <QuoteList /> */}

      <QuoteList>
        <Box className="quote-list-header" display="flex">

          {context.searchString &&
            <Typography>
              Search: {context.searchString}
            </Typography>
          }

          <Search onSubmit={searchSubmit} border={1} >
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <SearchInput
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchContent}
              onChange={e => { setSearchContent(e.target.value) }}
            />
          </Search>
        </Box>

        {context.quoteList.map((quote, i) =>
          <QuoteEntry key={i} quote={quote} />
        )}

        {!!context.quoteList.length &&
          <ReactPaginate className="pagination"
            containerClassName="pagination"
            breakClassName="page-item"
            breakLabel={<button className="page-link">...</button>}
            previousLabel="<"
            nextLabel=">"
            pageCount={context.pageCount}
            forcePage={context.currentPage - 1}
            pageClassName="page-item"
            previousClassName="page-item"
            nextClassName="page-item"
            pageLinkClassName="page-link"
            previousLinkClassName="page-link"
            nextLinkClassName="page-link"
            activeClassName="active"
            onPageChange={handlePageClick}
          />
        }
      </QuoteList>
    </>
  );
};

export default QuotePage;
