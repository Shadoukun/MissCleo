import React from 'react';
import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from './context/Auth';
import CleoNavbar from './components/Navbar';
import Admin from './pages/Admin';
import Login from './pages/Login';
import CommandsPage from './pages/Commands';
import QuotePage from './pages/Quotes'


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

export default App;
