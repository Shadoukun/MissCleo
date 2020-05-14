import React from 'react';
import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import { AuthProvider } from './context/Auth';
import PrivateRoute from './PrivateRoute';
import Navbar from './components/Navbar';
import Admin from './pages/Admin';
import Login from './pages/Login';
import CommandsPage from './pages/Commands';
import QuotePage from './pages/Quotes'
import { createMuiTheme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import { Box, CssBaseline, StylesProvider } from '@material-ui/core';
import { createGlobalStyle } from 'styled-components'
import { ThemeProvider as MuiThemeProvider } from '@material-ui/styles';
import { theme as customTheme } from './theme';

// export const theme = {
//   backgroundColor: "#2f3136",
//   secondaryBackground: "#202225",
//   primaryFontColor: "#e1e1e1"
// }

const GlobalStyle = createGlobalStyle`
  html, body {
    background: #2f3136;
    height: 100%;
    width: 100%;
  }
`

// const useStyles = makeStyles({
//   root: {
//     background: "#2f3136",
//     height: "100%",
//     width: "100%",
//   },
// })


function App() {

  return (
    <StylesProvider injectFirst>
    <MuiThemeProvider theme={customTheme}>
    <ThemeProvider theme={customTheme}>
    <Box>
      <CssBaseline />
      <GlobalStyle />
      <Router>
        <AuthProvider>
          <Navbar />
          <Switch>
            <Route path={`/quotes/:guildId?/:userId?`} component={QuotePage} />
            <Route path={'/commands'} component={CommandsPage} />
            <PrivateRoute path="/admin" component={Admin} />
            <Route path="/login" component={Login} />
          </Switch>
        </AuthProvider>
      </Router>
    </Box>
    </ThemeProvider>
    </MuiThemeProvider>
    </StylesProvider>

  );
}

export default App;
