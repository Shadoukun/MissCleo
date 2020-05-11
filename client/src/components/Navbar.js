import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import styled from 'styled-components';
import { useAuth } from "../context/Auth";


const StyledNavbar = styled(Navbar)`
    background: ${props => props.theme.secondaryBackground} !important;
    position: sticky;
    top: 0;
    z-index: 100;

    .navbar-nav {
      flex-grow: 1;
    }
`

const LoginButtons = styled.div`
  margin-left: auto;
`
export const CleoNavbar = () => {
  const { authToken } = useAuth()

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

          <LoginButtons>
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
          </LoginButtons>

        </Nav>
      </Navbar.Collapse>
    </StyledNavbar>
  )
}

export default CleoNavbar
