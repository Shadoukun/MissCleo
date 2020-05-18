import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { lighten, darken } from 'polished';
import styled from 'styled-components';

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



export const QuoteList = ({ guildId, userId }) => {

  const [quoteList, setQuoteList] = useState([]);
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const url = "/quotes"

  // reset currentPage when userId changes.
  useEffect(() => {
    setCurrentPage(1)
  }, [guildId, userId])

  useEffect(() => {
    (async () => {
      let params = []

      if (guildId) { params.push(`guild=${guildId}`) }
      if (userId) { params.push(`user=${userId}`) }
      if (currentPage) { params.push(`page=${currentPage}`) }

      let result = await backendCall.get(url + `?${params.join('&')}`)
      setQuoteList(result.data.quotes)
      setPageCount(result.data.pages)
    })()
  }, [guildId, userId, currentPage])

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1)
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  return (
    <QuoteListStyled>
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


