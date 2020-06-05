

import React, { useState, ChangeEvent, FormEvent, MouseEvent } from 'react';
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

// base type for retrieved Command/Response/Reaction entries.
type Entry = {
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
  cooldown: boolean
  cooldown_bucket: number
  cooldown_per: number
  cooldown_multiplier: number
}

// interface CommandEntry extends EntryBase {
//   command: string
//   response: string

//   trigger: never
//   reaction: never
// }

// interface ResponseEntry extends EntryBase {
//   trigger: string
//   response: string

//   command: never
// }

// interface ReactionEntry extends EntryBase {
//   trigger: string
//   reaction: string

//   command: never
//   response: never
// }

// type Entry = CommandEntry | ResponseEntry | ReactionEntry


export type EntryFormData = {
  id: string
  guild_id: string
  name: string
  description: string
  trigger: string
  response: string
  useRegex: boolean
  multiResponse: boolean
  cooldown: boolean
  cooldownType: number
  cooldownDuration: number
  multiplier: number
}

const EntryFormDefault = {
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
  cooldownDuration: 0,
  multiplier: 1,
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
    cooldown: entry.cooldown || false,
    cooldownType: entry.cooldown_bucket || 2,
    cooldownDuration: entry.cooldown_per || 0,
    multiplier: entry.cooldown_multiplier || 1
  })

  const { requestconfig } = useAuth();

  // Handles editing/adding an entry.
  const handleSubmit = (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    backendCall.post(
      props.submitURL,
      {
        id: form.id,
        guild_id: form.guild_id,
        name: form.name,
        description: form.description,
        trigger: form.trigger,
        response: form.response,
        use_regex: form.useRegex,
        multi_response: form.multiResponse,
        cooldown: form.cooldown,
        cooldown_rate: 1,
        cooldown_per: form.cooldownDuration,
        cooldown_bucket: form.cooldownType,
        cooldown_multiplier: form.multiplier
      },
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

          <Box>
            <CooldownControl
              form={form}
              setForm={setForm}
            />
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
