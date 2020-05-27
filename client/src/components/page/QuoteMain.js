import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { lighten, darken } from 'polished';
import styled from 'styled-components';
import { fade } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import { Typography } from '@material-ui/core';

import { backendCall } from '../../utilities';

import { QuoteEntry } from './QuoteEntry';


const QuoteListStyled = styled.div`
${({ theme }) => `
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  padding: ${theme.spacing(2)}px;
  color: ${theme.colors.primaryFontColor};

  ${theme.breakpoints.up('sm')} {
    margin-left: ${theme.drawerWidth}px;
  }

  .pagination {
    padding-top: 1em;
    padding-bottom: 2em;
    display: inline-flex !important;
    margin: auto;

    .page-item {
      color: white;

        .page-link {
          color: white;
          background: ${theme.colors.backgroundColor};
          border: 1px solid ${theme.colors.secondaryBackground};

          &:active, &:focus, &:hover {
            box-shadow: none !important;
          }
        }

      &.active .page-link {
          color: ${ darken(0.05, theme.colors.primaryFontColor)};
          background: ${ lighten(0.1, theme.colors.backgroundColor)};
      }
    }

    &.active {
      border:
      background: #474a51;
    }
  }
`}`

const QuoteListHeader = styled.div`
${({theme}) => `
  display: flex;
`}`

const Search = styled.form`
${({theme}) => `
  position: relative;
  border-radius: ${theme.shape.borderRadius}px;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  transition: ${theme.transitions.create('background-color')};

  margin-right: ${theme.spacing(2)};
  margin-left: auto;
  margin-bottom: ${theme.spacing(2)}px;
  width: 100%;

  &:hover {
    background-color: ${fade(theme.palette.common.white, 0.1)};
  }

  ${theme.breakpoints.up('sm')} {
    margin-left: ${theme.spacing(3)};
    width: auto;
  }
`}`

const SearchIconWrapper = styled.div`
${({theme}) => `
  padding: ${theme.spacing(0, 2, 0, 1)};
  height: 100%;
  position: absolute;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;

`}`


const SearchInput = styled(InputBase)`
${({theme}) => `
  background-color: ${fade(theme.palette.common.white, 0.1)};
  width: 100%;

  .MuiInputBase-root {
    color: inherit;
  }

  .MuiInputBase-input {
    padding: ${theme.spacing(1, 1, 1, 0)};
    padding-left: calc(1em + ${theme.spacing(3)}px);
    transition: ${theme.transitions.create('width')};
    width: 10ch;
  }

  ${theme.breakpoints.up('sm')} {
    background: none;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;

    .MuiInputBase-input {
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
      width: 0;
    }

    &.Mui-focused .MuiInputBase-input {
      background-color: ${fade(theme.palette.common.white, 0.1)};
      width: 20ch;
    }
  }
`}`

export const QuoteList = ({ guildId, userId, setUser, searchString, setSearchString }) => {

  const [quoteList, setQuoteList] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchContent, setSearchContent] = useState("")

  const url = "/quotes"

  // reset currentPage when userId changes.
  useEffect(() => {
    setCurrentPage(1)
  }, [guildId, userId])

  useEffect(() => {
    (async () => {
      let params = []

      if (guildId) { params.push(`guild=${guildId}`) }
      if (userId && !searchString) { params.push(`user=${userId}`) }
      if (searchString) {params.push(`search=${encodeURIComponent(searchString)}`)}
      if (currentPage) { params.push(`page=${currentPage}`) }

      let result = await backendCall.get(url + `?${params.join('&')}`)
      setQuoteList(result.data.quotes)
      setPageCount(result.data.pages)
    })()
  }, [guildId, userId, searchString, currentPage])

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1)
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  const searchSubmit = (event) => {
    event.preventDefault();
    setSearchString(searchContent)
  }


  return (
    <QuoteListStyled>
      <QuoteListHeader>

       {searchString &&
        <Typography>
          Search: {searchString}
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
            onChange={e => {setSearchContent(e.target.value)}}
          />
        </Search>
      </QuoteListHeader>

      {quoteList.map((quote, i) =>
        <QuoteEntry key={i} quote={quote} />
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
          onPageChange={handlePageClick}
        />
      }
    </QuoteListStyled>
  )
}


