import React, { useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import { IconButton } from './Button';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import { useTheme } from '@material-ui/core/styles';
import styled from 'styled-components';


const DrawerNav = styled.div
  .attrs({ className: "DrawerNav" })`
${({ theme }) => `
  display: flex;

  ${theme.breakpoints.up('sm')} {
    width: ${theme.drawerWidth};
      flex-shrink: 0;
  }

`}`

const StyledDrawer = styled(Drawer)
  .attrs({ className: "StyledDrawer" })`
${({ theme }) => `

  ${theme.breakpoints.up('sm')} {
    width: ${theme.drawerWidth}px;
    flex-shrink: 0;
  }

  .MuiDrawer-paper {
    width: ${theme.drawerWidth}px;
    background: ${theme.colors.secondaryBackground};
    border: none;
    scrollbar-width: none;
    ::-webkit-scrollbar {
      width: 0px;
    }
  }

  .MuiBackdrop-root {
    opacity: 0.5 !important;
  }

`}`

const DrawerToolbar = styled.div
  .attrs({ className: "DrawerToolbar" })`
${({ theme }) => ({
    ...theme.mixins.toolbar
  })}
`

const DrawerMenuButton = styled(IconButton)
  .attrs({ className: "DrawerMenuButton" })`
${({ theme }) => `
  display: flex;
  margin: 0;
  margin-left: ${theme.spacing(2)}px;
  margin-top: ${theme.spacing(1)}px;
  color: ${theme.colors.primaryFontColor};
  border-radius: ${theme.shape.borderRadius}px;

  ${theme.breakpoints.up('sm')} {
    display: none;
  }

`}`

const CloseMenuButton = styled(DrawerMenuButton)
  .attrs({ className: "DrawerCloseMenuButton" })`
${({ theme }) => `
  margin-right: 0;
  margin-left: auto;

`}`


const ResponsiveDrawer = (props) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const handleDrawerToggle = () => { setMobileOpen(!mobileOpen) }

  return (
    <DrawerNav>
      {/* Desktop */}
      <Hidden smUp implementation="js">
        <StyledDrawer
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true, }} // Better open performance on mobile.
        >
          <CloseMenuButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </CloseMenuButton>
          {props.children}
        </StyledDrawer>
      </Hidden>

      {/* Mobile */}
      <Hidden xsDown implementation="js">
        <StyledDrawer
          variant="permanent"
        >
          <DrawerToolbar />
          {props.children}
        </StyledDrawer>
      </Hidden>

      <DrawerMenuButton
        className="DrawerMenuButton"
        color="inherit"
        aria-label="Open drawer"
        edge="start"
        onClick={handleDrawerToggle}
      >
        <MenuIcon />
      </DrawerMenuButton>
    </DrawerNav>
  );
}

export default ResponsiveDrawer;
