import React from 'react';
import { Button, IconButton } from './Button';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/Auth";
import styled from 'styled-components';

const StyledAppBar = styled(AppBar)`
${({ theme }) => `
  background-color: ${theme.colors.secondaryBackground};
  z-index: ${theme.zIndex.drawer + 1};

  .navWrapper {
    margin-right: auto;
  }

  .active {
    color: white;
  }
`}`

const NavTitle = styled(Typography)`
  font-size: 20px;
  margin-right: 20px;
`


const LoginButton = styled(IconButton)`
  border-radius: 5px;
  margin-right: 0;

  p {
    font-size: 14px;
    font-weight: bold;
  }

  svg {
    margin-right: 5px;
  }
`

const Navbar = (props) => {
  const location = useLocation();
  const { authToken } = useAuth();


  const isActive = (value) => (location.pathname.startsWith(value) ? "active" : '')

  return (
    <StyledAppBar className="Navbar" position="sticky" elevation={0}>
      <Toolbar>
        <NavTitle className="navTitle" type="title" color="inherit">MissCleo</NavTitle>

        <Box className="navWrapper">
          <Button className={isActive('/quotes')} component={RouterLink} to="/quotes">
            Quotes
        </Button>
          <Button className={isActive('/commands')} component={RouterLink} to="/commands">
            Commands
        </Button>
        </Box>

        <LoginBar isLoggedIn={authToken} />
      </Toolbar>
    </StyledAppBar>
  )
}

const LoginBar = ({ isLoggedIn }) => (
  <div className="login">
    {!isLoggedIn ? (
      <LoginButton component={RouterLink} to="/login">
        <AccountCircle />
        <Typography>
          Login
          </Typography>
      </LoginButton>
    ) : (
        <LoginButton component={RouterLink} to="/logout">
          <AccountCircle />
          <Typography>
            Logout
          </Typography>
        </LoginButton>
      )
    }
  </div>
)

// const StyledNavbar = styled(Navbar)`
//     background: ${props => props.theme.secondaryBackground} !important;
//     position: sticky;
//     top: 0;
//     z-index: 100;

//     .navbar-nav {
//       flex-grow: 1;
//     }
// `

// const LoginButtons = styled.div`
//   margin-left: auto;
// `
// export const CleoNavbar = () => {
//   const { authToken } = useAuth()

//   return (
//     <StyledNavbar expand="lg" variant="dark">
//       <Navbar.Brand href="#home">Miss Cleo</Navbar.Brand>
//       <Navbar.Toggle aria-controls="basic-navbar-nav" />
//       <Navbar.Collapse id="basic-navbar-nav">
//         <Nav className="mr-auto">

//           <LinkContainer to="/quotes">
//             <Nav.Link>Quotes</Nav.Link>
//           </LinkContainer>

//           <LinkContainer to="/commands">
//             <Nav.Link>Commands</Nav.Link>
//           </LinkContainer>

//           <LoginButtons>
//             {authToken ? (
//               <LinkContainer to="/admin">
//                 <Nav.Link>Logout</Nav.Link>
//               </LinkContainer>
//             ) : (
//               <LinkContainer to="/login">
//                 <Nav.Link>Login</Nav.Link>
//               </LinkContainer>
//               )
//             }
//           </LoginButtons>

//         </Nav>
//       </Navbar.Collapse>
//     </StyledNavbar>
//   )
// }

export default Navbar
