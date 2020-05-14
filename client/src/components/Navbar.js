import React from 'react';
import { useAuth } from "../context/Auth";

import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';


import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { withStyles } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouterLink,
  useLocation
} from "react-router-dom";
import { theme } from '../theme';

const useStyles = makeStyles({
  appbar: {
    backgroundColor: theme.colors.secondaryBackground,
    zIndex: theme.zIndex.drawer + 1,
  },
  title: {
    marginRight: 20,
  },
  flex: {
    marginRight: 'auto'
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  active: {
    color: 'white'
  }
})

const Navbar = (props) => {
  const classes = useStyles()
  const location = useLocation();

  const isActive = (value) => (location.pathname.startsWith(value) ? classes.active : '')

  return (
    <AppBar className={classes.appbar} position="sticky" elevation={0}>
      <Toolbar>
        <Typography className={classes.title} type="title" color="inherit">MissCleo</Typography>

        <Box className={classes.flex}>
          <Button className={isActive('/quotes')} component={RouterLink} to="/quotes">
            Quotes
        </Button>
          <Button className={isActive('/commands')} component={RouterLink} to="/commands">
            Commands
        </Button>
        </Box>

        <div>
          <IconButton onClick={props.login}>
            <AccountCircle />
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  )
}

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
