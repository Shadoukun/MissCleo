import React, { useState } from 'react';
import { fade } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import styled from 'styled-components';
import SearchIcon from '@material-ui/icons/Search';


const Search = styled.form`
${({ theme }) => `
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
${({ theme }) => `
  padding: ${theme.spacing(0, 2, 0, 1)};
  height: 100%;
  position: absolute;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;

`}`


const SearchInput = styled(InputBase)`
${({ theme }) => `
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


const QuoteSearch = ({ searchString, onSubmit}) => {
  const [searchContent, setSearchContent] = useState("");

  const searchSubmit = (event) => {
    event.preventDefault();
    onSubmit(searchContent)
  }

  return (
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
  )
}

export default QuoteSearch
