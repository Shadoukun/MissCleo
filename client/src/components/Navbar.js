import React from 'react';
import { Link as RouterLink, useLocation, useRouteMatch } from "react-router-dom";
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { Button, IconButton, LinkButton } from './Button';
import { useAuth } from "../context/Auth";
import styled from 'styled-components';

const StyledAppBar = styled(AppBar)`
${({ theme }) => `
  background-color: ${theme.colors.secondaryBackground};
  z-index: ${theme.zIndex.drawer + 1};

  ${theme.breakpoints.down('xs')} {
    position: relative;
    margin-bottom: 36px;

  .nav-wrapper {
    margin-right: auto;

    ${theme.breakpoints.down('xs')} {
    display: flex;
    justify-content: space-around;
    position: absolute;
    top: 56px;
    width: 100%;
    margin-left: ${theme.spacing(-2)}px;
    padding-left: ${theme.spacing(2)}px;
    padding-right: ${theme.spacing(2)}px;

    background-color: ${theme.colors.secondaryBackground};
    }
  }

  .active {
    color: white;
  }
`}`

const NavTitle = styled(Typography)`
${({ theme }) => `
  font-size: 24px;
  margin-right: ${theme.spacing(3)}px;

  ${theme.breakpoints.down('xs')} {
    font-size: 20px;
  }
`}`

const LoginButtonStyled = styled(IconButton)`
${({ theme }) => `
  border-radius: ${theme.shape.borderRadius}px;
  margin-left: auto;
  text-transform: capitalize;

  p {

    font-size: 14px;
    font-weight: bold;
  }

  svg {
    margin-right: ${theme.spacing(0.5)}px;
  }
`}`

const NavButton = styled(LinkButton)`
${({ theme }) => `
    padding: ${theme.spacing(1, 1, 1, 1)};
    font-size: 14px;
    font-weight: bold;

    &.active::after {
      content: " ";
      white-space: pre;
      background: ${theme.colors.primaryFontColor};
      position: absolute;
      bottom: 4px;
      width: 5px;
      height: 5px;
      border-radius: 100%;
    }

    ${theme.breakpoints.down('xs')} {
      font-size: 12px;
    }
`}`


const Navbar = (props) => {
  const location = useLocation();
  const { authToken } = useAuth();
  let { url } = useRouteMatch();

  return (
    <StyledAppBar className="Navbar" position="sticky" elevation={0}>
      <Toolbar>
        <NavTitle className="navTitle" type="title" color="inherit">MissCleo</NavTitle>

        <Box className="nav-wrapper">
          <NavButton to={{ pathname: `${url}/quotes`, state: { navPressed: true } }} label="Quotes" location={location} />
          <NavButton to={{ pathname: `${url}/commands`, state: { navPressed: true } }} label="Commands" location={location} />
          <NavButton to={{ pathname: `${url}/responses`, state: { navPressed: true } }} label="Responses" location={location} />
          <NavButton to={{ pathname: `${url}/reactions`, state: { navPressed: true } }} label="Reactions" location={location} />
        </Box>

        <LoginBar isLoggedIn={authToken} />
      </Toolbar>
    </StyledAppBar>
  )
}

const LoginBar = ({ isLoggedIn }) => {
  return (
    <Box className="login" style={{ marginLeft: "auto" }}>
      {!isLoggedIn ? (
        <LoginButton type="login" />
      ) : (
          <LoginButton type="logout" />
        )}
    </Box>
  )
}

const LoginButton = (props) => (
  <LoginButtonStyled component={RouterLink} to={`/${props.type}`}>
    <AccountCircle />
    <Typography>
      {props.type}
    </Typography>
  </LoginButtonStyled>
)

export default Navbar
