import React, { useState } from 'react';
import { fade } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import Box from '@material-ui/core/Box';
import styled from 'styled-components';
import SearchIcon from '@material-ui/icons/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from './Button';


const Search = styled.form`
${({ theme }) => `
  position: relative;
  border-radius: ${theme.shape.borderRadius}px;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  transition: ${theme.transitions.create('background-color')};

  margin-right: ${theme.spacing(2)};
  margin-left: auto;
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


const SearchInput = styled(InputBase).attrs(props => ({
  size: props.active ? ("20ch") : (0),
  background: props.active ? fade("#ffffff", 0.1) : "transparent"
}))`
${({ theme, ...props }) => `
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
      background-color: ${props.background};
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
      width: ${props.size};
    }

    &.Mui-focused .MuiInputBase-input {
      background-color: ${fade(theme.palette.common.white, 0.1)};
      width: 20ch;
    }
  }
`}`

const RemoveButton = styled(IconButton)`
${({theme}) => `
  height:35px;
  width: 32px;
  padding: 0;
  margin-right: ${theme.spacing(1)}px;
  font-size: initial;
`}`


const QuoteSearch = ({ searchString, onSubmit, resetPage }) => {
  const [searchContent, setSearchContent] = useState("");
  const [active, setActive] = useState(false);


  const searchSubmit = (event) => {
    event.preventDefault();
    onSubmit(searchContent)
    setTimeout(() => {
      setActive(true)
    }, 100)
  }

  const searchReset = () => {
    setSearchContent("")
    setActive(false)
    resetPage()
  }

  return (
    <Box mb={2} display="flex" flexDirection="row">
      {active &&
        <RemoveButton onClick={searchReset}>
          <FontAwesomeIcon icon={faTimesCircle} />
        </RemoveButton>
      }
      <Search onSubmit={searchSubmit} border={1} >
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>

        <SearchInput
          active={active}
          placeholder="Search…"
          inputProps={{ 'aria-label': 'search' }}
          value={searchContent}
          onChange={e => { setSearchContent(e.target.value) }}
          />
      </Search>
    </Box>
  )
}

export default QuoteSearch
