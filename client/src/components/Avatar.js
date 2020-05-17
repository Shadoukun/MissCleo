import React from 'react';
import Avatar from '@material-ui/core/Avatar';


export const DiscordAvatar = ({ src, ...props}) => (
    <Avatar src={src}>
        <Avatar src='/discord_icon.png' />
    </Avatar>
)
