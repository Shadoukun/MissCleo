import React from 'react';
import styled from 'styled-components';
import { Nav, Dropdown, Button } from 'react-bootstrap';
import { lighten, darken } from 'polished';



export const QuoteMain = styled.div`
  padding-top: 1em;
`

export const QuoteSideBar = styled.div`
    position: sticky;
    top: 3.5rem !important;
    height: calc(100vh - 3.5rem) !important;
    flex: 0 1 240px;
    overflow-y: scroll;
    scrollbar-width: none;
    color: gray;
    height: 100%;
    background: ${p => p.theme.secondaryBackground}
`

export const QuoteSideBarSection = styled.div`
  margin-bottom: 20px;

  h1 {
    padding: 1em;
    color: white;
    text-align:left;
    font-size: 1.25em;
  }

  .nav {
    display: flex;
    flex-direction: column !important;

    .quote-avatar {
      height: 40px;
      width: 40px;
    }

    .avatar {
      border-radius: 100px;
      width:40px;
      height: 40px;
    }

    .name {
      margin-left: 1em;
    }
  }
`

export const QuoteSideBarNavLink = styled(Nav.Link)`
  display:flex;
  align-items: center;
  color: gray;
  font-weight: bold;

  &:active, &:focus{
    outline: none;
    }

  &.active {
    color: white !important;
    background: gray !important;
  }

`

export const QuoteCard = styled.div`
  border-radius: 20px !important;
  margin-bottom: .5em;
  display: flex;
  background: #36393f;
  color: ${props => props.theme.primaryFontColor};
  box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.8);
  padding: 1em;

  .quote-header {

    display: flex;
    width: 100%;
    padding: 0;
    border: none;
    background: transparent;
    align-items: center;

    img {
      height: 40px;
      width: 40px;
      margin-right: 1em !important;
      border-radius: 100px !important;
    }

    .wrapper {
        display:flex;
        align-items: center;
    }

    .name {
        height: auto;
        font-weight: bold;
        margin-right: .5em;
    }

    .timestamp {
        font-size: 80%;
    }

  }

  .quote-body {
    display: flex;
    padding: .5em 1em .5em 3.5em;
    text-align: left !important;
  }

`

export const PaginationWrapper = styled.div`
    padding-top: 1em;
    padding-bottom: 2em;
    display: inline-flex !important;

    .page-item {
      color: white;

      .page-link {
        color: white;
        background: ${props => props.theme.backgroundColor};

        &:active, &:focus, &:hover {
          box-shadow: none !important;
        }
      }

      &.active .page-link {
          border: none;
          background: #474a51;
      }
    }

    .pagination .page-link {
        background: none;
        border: 1px solid #202225;


    }

`

export const QuoteDropdown = styled(Dropdown)`
  margin-left: auto;

  button {
    color: ${props => darken(0.2, props.theme.primaryFontColor)};
    background-color: transparent !important;
    border: none !important;

    &:active, &:focus {
      border: none !important;
      box-shadow: none !important;
    }

    &:focus {
      color: ${props => darken(0.2, props.theme.primaryFontColor)} !important;
    }
  }

  .quote_dropdown_menu {
    background: ${props => props.theme.secondaryBackground};
    color: ${props => props.theme.primaryFontColor} !important;
    padding: 0;
  }

  .dropdown-item {
    color: ${props => props.theme.primaryFontColor};
    font-weight: bold;
    padding: 0.5rem 1.5rem;


    &:hover {
      background: ${props => lighten(0.05, props.theme.secondaryBackground)};
    }

  }

`

export const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <Button
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
  </Button>
));
