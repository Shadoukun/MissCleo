import React from 'react';

import { Input, FormLabel } from '../../Form'
import { ModalFormControl } from '../../Modal';
import { Switch, Box, Typography, } from '@material-ui/core';
import styled from 'styled-components';

const ToggleBox = styled(Box)`
${({ theme }) => `
  display: flex;
  flex-direction: row;
  padding: ${theme.spacing(1, 0, 1, 0)};

  p {
    margin-right: auto;
  }
`}`

export const NameControl = (props) => (
  <ModalFormControl>
    <FormLabel>Name</FormLabel>
    <Input
      id="name"
      value={props.name}
      onChange={props.onChange}
    />
  </ModalFormControl>
)

export const TriggerControl = (props) => (
  <ModalFormControl>
    <FormLabel>{props.type === "Command" ? "Command" : "Trigger"}</FormLabel>
    <Input
      id="trigger"
      value={props.trigger}
      onChange={props.onChange}
    />
  </ModalFormControl>
)

export const RegexControl = (props) => (
  <ToggleBox>
    <Typography>Regex</Typography>
    <Switch
      checked={props.toggle}
      onChange={props.onToggle}
      name="regex"
      color="primary"
    />
  </ToggleBox>
)

export const ResponseControl = (props) => (
  <ModalFormControl>
    <FormLabel>Response</FormLabel>
    <Input
      id="response"
      multiline
      rows={3}
      rowsMax={6}
      value={props.response}
      onChange={props.onChange}
    />
  </ModalFormControl>
)

export const MultiResponseControl = (props) => (
  <ToggleBox>
    <Typography>Random Response</Typography>
    <Switch
      checked={props.toggle}
      onChange={props.onToggle}
      name="regex"
      color="primary"
    />
  </ToggleBox>
)

export const DescriptionControl = (props) => (
  <ModalFormControl>
    <FormLabel>Description</FormLabel>
    <Input
      id="description"
      value={props.description}
      onChange={props.onChange}
    />
  </ModalFormControl>

)
