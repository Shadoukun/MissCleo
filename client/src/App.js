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
import { AuthContext } from "./context/Auth";
import PrivateRoute from './PrivateRoute';
import { createGlobalStyle, ThemeProvider  } from 'styled-components';
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

  .ReactModal__Overlay {
    opacity: 0;
    transition: opacity 200ms ease-in-out;
}

.ReactModal__Overlay--after-open{
    opacity: 1;
}

.ReactModal__Overlay--before-close{
    opacity: 0;
    
}
`

const CleoNavbar = styled(Navbar)`
    background: ${props => props.theme.secondaryBackground} !important;
    position: sticky;
    top: 0;
    z-index: 100;
  `


function App() {
  const existingToken = localStorage.getItem("auth_token");
  const [authToken, setAuthToken] = useState(existingToken);


  const setToken = (data) => {
    localStorage.setItem("auth_token", data);
    setAuthToken(data);
  }

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken: setToken }}>
    <ThemeProvider theme={theme}>
    <GlobalStyle />
      <Router>
        <div className="App">  
          <CleoNavbar expand="lg" variant="dark">
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
                <LinkContainer to="/admin">
                  <Nav.Link>Admin</Nav.Link>
                </LinkContainer>
              </Nav>
            </Navbar.Collapse>
          </CleoNavbar>

          <Switch>
            <Route path={`/quotes/:guildId?/:userId?`} component={QuotePage} />
            <Route path={'/commands'} component={CommandsPage} />
            <PrivateRoute path="/admin" component={Admin} />
            <Route path="/login" component={Login} />

          </Switch>
        </div>
      </Router>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;
