import React, { PropsWithChildren } from 'react';
import { Button as MuiButton, IconButton as MuiIconButton, ButtonProps } from '@material-ui/core'
import styled from 'styled-components';
import { Link, LinkProps } from 'react-router-dom';
import { Location, History, LocationDescriptorObject } from 'history';

export const Button = styled(MuiButton)<any>`
 &:hover {
    color: inherit;
    text-decoration: none;
 }

 &:focus {
      box-shadow: none;
      outline: none;
      text-decoration: none;
    }
`

export const IconButton = styled(MuiIconButton)<any>`
 &:hover {
    color: inherit;
    text-decoration: none;
 }

 &:focus {
      box-shadow: none;
      outline: none;
      text-decoration: none;
    }
`


type LinkButtonProps = ButtonProps & LinkProps<any> & {
   label: string
   location: Location<History.PoorMansUnknown>
}

export const LinkButton: React.FC<PropsWithChildren<LinkButtonProps>> = ({className, children, ...props}) => {
   // string | LocationDescriptorObject<any> | ((location: Location<any>) => History.LocationDescriptor<any>)
   const to_location = props.to as any

   const active = props.location.pathname === to_location.pathname ? "active" : ''

   return (
      <Button className={`${active} ${className}`} component={Link} {...props} >
         {props.label}
         {children}
      </Button>
   )
}
