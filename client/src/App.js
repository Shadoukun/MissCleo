import React, { useState } from 'react';
import './App.scss';
import QuotePage from './pages/Quotes'
import CommandsPage from './pages/Commands'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav } from 'react-bootstrap'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { LinkContainer } from 'react-router-bootstrap';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { useAuth, AuthContext, AuthProvider } from "./context/Auth";
import PrivateRoute from './PrivateRoute';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import styled from 'styled-components';

export const theme = {
  backgroundColor: "#2f3136",
  secondaryBackground: "#202225",
  primaryFontColor: "#e1e1e1"
}

const GlobalStyle = createGlobalStyle`
  html, body, .container-fluid {
    background: ${props => props.theme.backgroundColor};
    height: 100%;
    width: 100%;
  }
`


function App() {

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <AuthProvider>

          <div className="App">
            <CleoNavbar />

            <Switch>
              <Route path={`/quotes/:guildId?/:userId?`} component={QuotePage} />
              <Route path={'/commands'} component={CommandsPage} />
              <PrivateRoute path="/admin" component={Admin} />
              <Route path="/login" component={Login} />

            </Switch>
          </div>
        </AuthProvider>

      </Router>
    </ThemeProvider>
  );
}


const StyledNavbar = styled(Navbar)`
    background: ${props => props.theme.secondaryBackground} !important;
    position: sticky;
    top: 0;
    z-index: 100;

    .navbar-nav {
      flex-grow: 1;
    }

    .login-wrapper {
      margin-left: auto;
    }
  `

const CleoNavbar = () => {
  const { authToken } = useAuth()
  console.log(authToken)
  return (
    <StyledNavbar expand="lg" variant="dark">
      <Navbar.Brand href="#home">Miss Cleo</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <LinkContainer to="/quotes">
            <Nav.Link>Quotes</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/commands">
            <Nav.Link>Commands</Nav.Link>
          </LinkContainer>

          <div className="login-wrapper">
          {authToken ? (
            <LinkContainer to="/admin">
              <Nav.Link>Logout</Nav.Link>
            </LinkContainer>
          ) : (
              <LinkContainer to="/login">
                <Nav.Link>Login</Nav.Link>
              </LinkContainer>
            )
          }
          </div>
        </Nav>
      </Navbar.Collapse>
    </StyledNavbar>
  )

}

export default App;
