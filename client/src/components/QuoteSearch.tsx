import React, { useState, useEffect } from 'react';
import { fade } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import Box from '@material-ui/core/Box';
import styled from 'styled-components';
import SearchIcon from '@material-ui/icons/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from './Button';

const SearchBox = styled(Box)`
${({ theme }) => `
  display: flex;
  flex-direction: row;
  margin-bottom: ${theme.spacing(2)}px;
  margin-left: auto;
  margin-right: ${theme.spacing(1)}px;

  ${theme.breakpoints.down('sm')} {
    flex-grow: 1;
    margin-left: 0;
    margin-right: 0;
  }
`}`;

const Search = styled.form<any>`
${({ theme }) => `
  position: relative;
  border-radius: 10px;
  transition: ${theme.transitions.create('background-color')};
  background-color: ${fade(theme.palette.common.white, 0.1)};


  margin-right: ${theme.spacing(2)};
  width: 100%;

  &:hover {
    background-color: ${fade(theme.palette.common.white, 0.15)};
  }

  ${theme.breakpoints.up('sm')} {
    margin-left: ${theme.spacing(3)};
    width: auto;
  }
`}`;

const SearchIconWrapper = styled.div`
${({ theme }) => `
  padding: ${theme.spacing(0, 2, 0, 1)};
  height: 100%;
  position: absolute;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`}`;

const SearchInput = styled<any>(InputBase).attrs(props => ({
  size: props.active ? ("30ch") : ("10ch"),
  background: props.active ? fade("#ffffff", 0.1) : "transparent"
}))`
${({ theme, ...props }) => `
  width: 100%;

  .MuiInputBase-root {
    color: inherit;
  }

  .MuiInputBase-input {
    padding: ${theme.spacing(1, 1, 1, 0)};
    padding-left: calc(1em + ${theme.spacing(3)}px);
    transition: ${theme.transitions.create('width')};
  }

  ${theme.breakpoints.up('sm')} {
    background: none;
    border-radius: 10px;


    .MuiInputBase-input {
      background-color: transparent;
      border-radius: 10px;
      width: ${props.size};
    }

    &.Mui-focused .MuiInputBase-input {
      width: 30ch;
    }
  }
`}`;

const RemoveButton = styled(IconButton)`
${({ theme }) => `
  height:35px;
  width: 32px;
  padding: 0;
  margin-right: ${theme.spacing(1)}px;
  font-size: initial;

  ${theme.breakpoints.up('sm')} {
    margin-left: auto;
  ]
`}`;


type QuoteSearchProps = {
  searchString: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onReset: () => void
};

const QuoteSearch: React.FC<QuoteSearchProps> = ({ searchString, onSubmit, onReset }) => {

  const [inputValue, setInputValue] = useState(searchString);
  const [active, setActive] = useState(false);

  // set search input value when searchString changes
  useEffect(() => {
    setInputValue(searchString)
    setTimeout(() => {
      setActive(!!searchString)
    }, 200)
  }, [searchString]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  };

  return (
    <SearchBox>
      {active &&
        <RemoveButton onClick={onReset}>
          <FontAwesomeIcon icon={faTimesCircle} />
        </RemoveButton>
      }
      <Search onSubmit={onSubmit} border={1} >
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>

        <SearchInput
          active={active}
          placeholder="Search…"
          inputProps={{ 'aria-label': 'search' }}
          value={inputValue}
          onChange={handleChange}
        />
      </Search>
    </SearchBox>
  );
};

export default QuoteSearch
