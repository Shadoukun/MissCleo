import React from 'react';
import './App.scss';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import { AuthProvider } from './context/Auth';
import PrivateRoute from './PrivateRoute';
import Navbar from './components/Navbar';
import Admin from './pages/Admin';
import { Login, Logout } from './pages/Login';
import CommandsPage from './pages/Commands';
import QuotePage from './pages/Quotes'
import { ThemeProvider } from 'styled-components';
import { CssBaseline, StylesProvider } from '@material-ui/core';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/styles';
import { theme, GlobalStyle } from './theme';


function App() {

  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyle />
          <div className="App">
            <Router>
              <AuthProvider>
                <Navbar />

                <Switch>
                  <Route path={`/quotes/:guildId?/:userId?`} component={QuotePage} />
                  <Route path={'/commands'} component={CommandsPage} />
                  <PrivateRoute path="/admin" component={Admin} />
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
