import React, { useEffect, createContext, useContext, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import QuotePage from './Quotes'
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
import { AuthContext } from "./Auth";
import PrivateRoute from './PrivateRoute';

function App() {
  const existingToken = localStorage.getItem("auth_token");
  const [authToken, setAuthToken] = useState(existingToken);

  const setToken = (data) => {
    localStorage.setItem("auth_token", data);
    setAuthToken(data);
  }

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken: setToken }}>
      <Router>
        <div className="App">  
          <Navbar bg="dark" expand="lg" variant="dark">
            <Navbar.Brand href="#home">Miss Cleo</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                <LinkContainer to="/quotes">
                  <Nav.Link>Quotes</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/macros">
                  <Nav.Link>Macros</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/admin">
                  <Nav.Link>Admin</Nav.Link>
                </LinkContainer>
              </Nav>
            </Navbar.Collapse>
          </Navbar>

          <Switch>
            <Route path={`/quotes/:guildId?/:userId?`} component={QuotePage} />
            <PrivateRoute path="/admin" component={Admin} />
            <Route path="/login" component={Login} />

          </Switch>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
