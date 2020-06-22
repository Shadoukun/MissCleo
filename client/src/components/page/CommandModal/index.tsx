import React, { useState, ChangeEvent, FormEvent, MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Box, Divider } from '@material-ui/core';

import { Dict } from '../../../types'
import { useAuth } from '../../../context/Auth';
import { backendCall } from '../../../utilities';
import { Button } from "../../Button"
import { ModalForm } from '../../Modal';

import * as controls from './controls'
import CooldownControl from './cooldown'
import UserFilterInput from './user-filter'
import RoleFilterInput from './role-filter';


// data for an entry from the database.
export type Entry = Dict & {
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
  role_filter: string[]

  cooldown: boolean
  cooldown_bucket: number
  cooldown_rate: number
  cooldown_per: number
  cooldown_multiplier: number
}

const EntryDefault: Dict & Partial<Entry> = {
  use_regex: false,
  multi_response: false,
  user_filter: [],
  role_filter: [],
  cooldown: false,
  cooldown_bucket: 2,
  cooldown_rate: 1,
  cooldown_per: 0,
  cooldown_multiplier: 1,
}

type ModalHeaderProps = Partial<CommandModalProps> & {
  name: string
  trigger: string
}

const ModalHeader: React.FC<ModalHeaderProps> =  ({ type, edit, name, trigger, hideModal }) => {

  if (type === "Command") { name = `!${trigger}` }

  let title: string = edit ? (name || trigger) : (`New ${type}`)

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
  entry: Entry,

  type: string,
  edit?: boolean,
  hideName: boolean,
  hideRegex: boolean,
  hideMultiResponse: boolean,

  submitURL: string,
  removeURL: string,
  update: number,
  setUpdate: React.Dispatch<any>,
  hideModal: () => void
}

// Modal for Commands/Reactions/Responses.
export const CommandModal: React.FC<CommandModalProps> = ({ entry, ...props }) => {
  const [form, setForm] = useState<Entry>({
    ...EntryDefault,
    ...entry
  })

  const { requestconfig } = useAuth();

  // Handles editing/adding an entry.
  const handleSubmit = (event: FormEvent<HTMLElement>) => {
    event.preventDefault();

    backendCall.post(
      props.submitURL,
      form,
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
              toggle={form.use_regex}
              onToggle={() => { setForm({ ...form, use_regex: !form.use_regex }) }}
            />}

          <controls.ResponseControl
            response={form.response}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setForm({ ...form, response: e.target.value }) }}
          />

          {!props.hideMultiResponse &&
            <controls.MultiResponseControl
              toggle={form.multi_response}
              onToggle={() => { setForm({ ...form, multi_response: !form.multi_response }) }}
            />}

          <controls.DescriptionControl
            description={form.description}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setForm({ ...form, description: e.target.value }) }}
          />

          <Box mt={2} mb={2}><Divider /></Box>

          <Box className="user-filter-box">
            <UserFilterInput
              userFilter={form.user_filter}
              setUserFilter={(newValue: string[]) => setForm({ ...form, user_filter: newValue })}
            />
          </Box>

          <Box className="role-filter-box">
            <RoleFilterInput
              roleFilter={form.role_filter}
              setRoleFilter={(newValue: string[]) => setForm({ ...form, role_filter: newValue })}
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
  edit: boolean | undefined,
  handleRemove: (e: MouseEvent<HTMLButtonElement>) => void
}

const ModalFooter = ({ edit, handleRemove }: ModalFooterProps) => (
  <Box className="modalFooter">
    {edit &&
      <Button className="Remove" onClick={handleRemove}>
        Delete
      </Button>
    }

    <Button style={{ marginLeft: "auto"}} type="submit">Save</Button>
  </Box>
)


export default CommandModal
