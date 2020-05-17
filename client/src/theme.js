import { createMuiTheme } from '@material-ui/core/styles';
import { createGlobalStyle } from 'styled-components'


export const theme = createMuiTheme({
  colors: {
    backgroundColor: "#2f3136",
    secondaryBackground: "#202225",
    primaryFontColor: "#e1e1e1",

  },
  drawerWidth: 240,
  palette: {
    type: 'dark',
  },
});


export const GlobalStyle = createGlobalStyle`
  html, body {
    background: ${theme.colors.backgroundColor};
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .fade {
    opacity: 0;
    transition: opacity 200ms linear;
  }

  .show {
    opacity: 1;
  }


  .backdrop.fade.show {
    opacity: 0.5;
  }

  .pagination {
    display: flex;
    padding-left: 0;
    list-style: none;
  }

  .page-link {
    position: relative;
    display: block;
    color: #0d6efd;
    text-decoration: none;
    background-color: #fff;
    border: 1px solid #dee2e6;
  }

  .page-link:hover {
    z-index: 2;
    color: #024dbc;
    background-color: #e9ecef;
    border-color: #dee2e6;
  }

  .page-link:focus {
    z-index: 3;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
  }

  .page-item:not(:first-child) .page-link {
    margin-left: -1px;
  }

  .page-item.active .page-link {
    z-index: 3;
    color: #fff;
    background-color: #0d6efd;
    border-color: #0d6efd;
  }

  .page-item.disabled .page-link {
    color: #6c757d;
    pointer-events: none;
    background-color: #fff;
    border-color: #dee2e6;
  }

  .page-link {
    padding: 0.375rem 0.75rem;
  }

  .page-item:first-child .page-link {
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
  }

  .page-item:last-child .page-link {
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
`
