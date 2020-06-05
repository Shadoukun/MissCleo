import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { AuthProvider } from './context/Auth';
import { ThemeProvider } from 'styled-components';
import { CssBaseline, StylesProvider } from '@material-ui/core';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/styles';
import { theme, GlobalStyle } from './theme';

import IndexPage from './pages/IndexPage'
import GuildPage from './pages/GuildPage'
import { Login, Logout } from './pages/Login';

function App() {

  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyle />
          <div className="App">

            {/* TODO: Put something here */}

            <Router>
              <AuthProvider>
                <Switch>
                  <Route exact path="/" component={IndexPage} />
                  <Route path={`/:guild(\\d+)/`} component={GuildPage} />
                  <Route path="/login" component={Login} />
                  <Route path="/logout" component={Logout} />
                </Switch>
              </AuthProvider>
            </Router>
          </div>
        </ThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>

  );
}

export default App;
