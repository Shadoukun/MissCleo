import React, { ChangeEvent } from 'react';

import { Input, FormLabel } from '../../Form'
import { ModalFormControl } from '../../Modal';
import { Switch, Box, Typography, } from '@material-ui/core';
import styled from 'styled-components';


export type ToggleProps = {
  toggle: boolean
  onToggle: () => void
}

type NameProps = {
  name: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

type TriggerProps = {
  type: string
  trigger: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

type ResponseProps = {
  response: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

type DescriptionProps = {
  description: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}


const ToggleBox = styled(Box)`
${({ theme }) => `
  display: flex;
  flex-direction: row;
  padding: ${theme.spacing(1, 0, 1, 0)};

  p {
    margin-right: auto;
  }
`}`


export const NameControl = (props: NameProps) => (
  <ModalFormControl>
    <FormLabel>Name</FormLabel>
    <Input
      id="name"
      value={props.name}
      onChange={props.onChange}
    />
  </ModalFormControl>
)

export const TriggerControl = (props: TriggerProps) => (
  <ModalFormControl>
    <FormLabel>{props.type === "Command" ? "Command" : "Trigger"}</FormLabel>
    <Input
      id="trigger"
      value={props.trigger}
      onChange={props.onChange}
    />
  </ModalFormControl>
)

export const RegexControl = (props: ToggleProps) => (
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

export const ResponseControl = (props: ResponseProps) => (
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

export const MultiResponseControl = (props: ToggleProps) => (
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

export const DescriptionControl = (props: DescriptionProps) => (
  <ModalFormControl>
    <FormLabel>Description</FormLabel>
    <Input
      id="description"
      value={props.description}
      onChange={props.onChange}
    />
  </ModalFormControl>

)
