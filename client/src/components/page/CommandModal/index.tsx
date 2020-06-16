import React, { useState, ChangeEvent, FormEvent, MouseEvent, useEffect } from 'react';
import { Button } from "../../Button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../context/Auth';
import { backendCall } from '../../../utilities';

import { ModalForm } from '../../Modal';
import { Box, Divider } from '@material-ui/core';

import * as controls from './controls'
import CooldownControl from './cooldown'
import { useParams } from 'react-router-dom';
import VirtualizedUserFilterInput from './user-filter'
import { Dict } from '../../../types'

// type for retrieved Command/Response/Reaction entries.
type Entry = Dict & {
  id: string
  name: string
  guild_id: string
  description: string
  command: string
  trigger: string
  response: string
  reaction: never
  use_regex: boolean
  multi_response: boolean
  user_filter: string[]
  cooldown: boolean
  cooldown_bucket: number
  cooldown_rate: number
  cooldown_per: number
  cooldown_multiplier: number
}


export type EntryFormData = Dict & {
  id: string
  guild_id: string
  name: string
  description: string
  trigger: string
  response: string
  useRegex: boolean
  multiResponse: boolean
  userFilter: string[]
  cooldown: boolean
  cooldownType: number
  cooldownRate: number
  cooldownDuration: number
  multiplier: number
}

const EntryFormDefault: Dict = {
  id: null,
  name: null,
  guild_id: null,
  description: null,
  trigger: null,
  response: null,
  useRegex: false,
  multiResponse: false,
  cooldown: false,
  cooldownType: 2,
  cooldownRate: 1,
  cooldownDuration: 0,
  multiplier: 1,
}

const entryMap: Dict = {
  id: "id",
  guild_id: "guild_id",
  name: "name",
  description: "description",
  trigger: "trigger",
  response: "response",
  useRegex: "use_regex",
  multiResponse: "multi_response",
  userFilter: "user_filter",
  cooldown: "cooldown",
  cooldownType: "cooldown_bucket",
  cooldownRate: "cooldown_rate",
  cooldownDuration: "cooldown_per",
  multiplier: "cooldown_multiplier"
}


type ModalHeaderProps = {
  type: string,
  edit: boolean,
  name: string
  trigger: string
  hideModal: () => void
}

const ModalHeader = ({ type, edit, name, trigger, hideModal }: ModalHeaderProps) => {

  let title: string

  if (type === "Command") {
    name = `!${trigger}`
  }

  if (!edit) {
    title = `New ${type}`
  } else {
    title = name || trigger
  }

  return (
    <div className="modalHeader">
      <div className="modalTitle">
        <h1>{title}</h1>
      </div>
      <Button onClick={hideModal}>
        <FontAwesomeIcon icon={faTimes} />
      </Button>
    </div>
  )
}

type CommandModalProps = {
  type: string,
  edit: boolean,
  update: number,
  entry: Entry,
  submitURL: string,
  removeURL: string,
  hideName: boolean,
  hideRegex: boolean,
  hideMultiResponse: boolean,
  setUpdate: React.Dispatch<any>,
  hideModal: () => void
}

// Modal for Commands/Reactions/Responses.
export const CommandModal = ({ entry, ...props }: CommandModalProps) => {
  const { guild } = useParams();
  const [form, setForm] = useState<EntryFormData>({
    ...EntryFormDefault,
    id: entry.id,
    guild_id: entry.guild_id || guild,
    name: entry.name,
    description: entry.description,
    trigger: entry.command || entry.trigger,
    response: entry.response || entry.reaction,
    useRegex: entry.use_regex,
    multiResponse: entry.multi_response,
    userFilter: entry.user_filter || [],
    cooldown: entry.cooldown || false,
    cooldownType: entry.cooldown_bucket || 2,
    cooldownRate: entry.cooldown_rate || 1,
    cooldownDuration: entry.cooldown_per || 0,
    multiplier: entry.cooldown_multiplier || 1
  })

  const { requestconfig } = useAuth();

  // Handles editing/adding an entry.
  const handleSubmit = (event: FormEvent<HTMLElement>) => {
    event.preventDefault();

    // map data from `form` to back to backend-friendly keys.
    let entryData = Object.keys(form).reduce((data: any, key) => {
      data[entryMap[key]] = form[key]
      return data
    }, {})

    backendCall.post(
      props.submitURL,
      entryData,
      requestconfig
    ).then(() => {
      props.setUpdate(() => ++props.update)
      props.hideModal()
    });
  }

  // Handles removing an entry.
  const handleRemove = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    backendCall.post(
      props.removeURL,
      { id: form.id },
      requestconfig
    ).then(() => {
      props.setUpdate(() => ++props.update)
      props.hideModal()
    });
  }

  return (
    <>
      <ModalHeader
        type={props.type}
        edit={props.edit}
        name={form.name}
        trigger={form.trigger}
        hideModal={props.hideModal}
      />

      <Box className="modalBody">
        <ModalForm onSubmit={handleSubmit} autoComplete="off">

          {!props.hideName &&
            <controls.NameControl
              name={form.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => { setForm({ ...form, name: e.target.value }) }}
            />}

          <controls.TriggerControl
            type={props.type}
            trigger={form.trigger}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setForm({ ...form, trigger: e.target.value }) }}
          />

          {!props.hideRegex &&
            <controls.RegexControl
              toggle={form.useRegex}
              onToggle={() => { setForm({ ...form, useRegex: !form.useRegex }) }}
            />}

          <controls.ResponseControl
            response={form.response}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setForm({ ...form, response: e.target.value }) }}
          />

          {!props.hideMultiResponse &&
            <controls.MultiResponseControl
              toggle={form.multiResponse}
              onToggle={() => { setForm({ ...form, multiResponse: !form.multiResponse }) }}
            />}

          <controls.DescriptionControl
            description={form.description}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setForm({ ...form, description: e.target.value }) }}
          />

          <Box mt={2} mb={2}><Divider /></Box>

          <Box className="user-filter-box">
            <VirtualizedUserFilterInput
              userFilter={form.userFilter}
              setUserFilter={(newValue: string[]) => setForm({ ...form, userFilter: newValue })}
            />
          </Box>

          <Box mt={2} mb={2}><Divider /></Box>

          <Box className="cooldown-box">
            <CooldownControl form={form} setForm={setForm} />
          </Box>
          <ModalFooter edit={props.edit} handleRemove={handleRemove} />
        </ModalForm>
      </Box>
    </>
  )
}

type ModalFooterProps = {
  edit: boolean,
  handleRemove: (e: MouseEvent<HTMLButtonElement>) => void
}

const ModalFooter = ({ edit, handleRemove }: ModalFooterProps) => (
  <div className="modalFooter">
    {edit &&
      <Button className="Remove" onClick={handleRemove}>
        Delete
      </Button>
    }

    <Button type="submit">Save</Button>
  </div>
)


export default CommandModal
