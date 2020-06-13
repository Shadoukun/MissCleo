import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Link,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@material-ui/core';
import { DiscordAvatar } from './Avatar';
import styled from 'styled-components';

const SidebarLink = styled(Link) <any>`
${({ theme }) => `
  color: ${theme.colors.primaryFontColor};

  &:hover {
    color: inherit;
    text-decoration: none;
  }

  .sidebar-member-avatar {
    min-width: auto;
    margin-right: ${theme.spacing(2)}px;

    .MuiAvatar-root {
      height: 32px;
      width: 32px;
    }
  }

  &.active .MuiListItem-button::after {
    content: " ";
    white-space: pre;
    background: white;
    position: absolute;
    left: 0;
    height: 50px;
  }

  .MuiListItemText-primary {
    line-height: 1.2;
  }

`}`

interface SidebarEntryProps extends React.HTMLProps<HTMLAnchorElement> {
  to: string,
  name: string,
  icon: string,
  activeClass: string,
  textProps?: {}
}

const SidebarEntry = ({ to, name, icon, activeClass, textProps }: SidebarEntryProps) => (
  <SidebarLink className={activeClass} component={RouterLink} to={to} underline="none">
    <ListItem button>
      <ListItemAvatar className="sidebar-member-avatar">
        <DiscordAvatar src={icon} />
      </ListItemAvatar>
      <ListItemText primary={name} {...textProps} />
    </ListItem>
  </SidebarLink>
)

export default SidebarEntry
