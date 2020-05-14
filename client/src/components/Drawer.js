import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';


import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import axios from 'axios';
import { theme } from '../theme';


export const drawerWidth = theme.drawerWidth;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    menuButton: {
        margin: 0,
        display: 'flex',
        color: theme.colors.primaryFontColor,
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        background: theme.colors.secondaryBackground,
        scrollbarWidth: "none",
        width: drawerWidth
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    closeMenuButton: {
        marginRight: 'auto',
        marginLeft: 0,
    },
}));


const ResponsiveDrawer = (props) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const classes = useStyles();

    const handleDrawerToggle = () => { setMobileOpen(!mobileOpen) }

    return (
        <nav className={classes.drawer}>
            {/* Desktop */}
            <Hidden smUp implementation="js">
                <Drawer
                    variant="temporary"
                    anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    classes={{ paper: classes.drawerPaper, }}
                    ModalProps={{ keepMounted: true, }} // Better open performance on mobile.
                >
                    <IconButton onClick={handleDrawerToggle} className={classes.closeMenuButton}>
                        <CloseIcon />
                    </IconButton>
                    {props.children}
                </Drawer>
            </Hidden>

            {/* Mobile */}
            <Hidden xsDown implementation="js">
                <Drawer
                    className={classes.drawer}
                    variant="permanent"
                    classes={{ paper: classes.drawerPaper, }}
                >
                    <div className={classes.toolbar} />
                    {props.children}
                </Drawer>
            </Hidden>

            <IconButton
                color="inherit"
                aria-label="Open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                className={classes.menuButton} >
                <MenuIcon />
            </IconButton>
        </nav>
    );
}

export default ResponsiveDrawer;
