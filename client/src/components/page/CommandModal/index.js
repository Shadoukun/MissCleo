

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from "../../Button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../context/Auth';
import { backendCall } from '../../../utilities';

import { ModalForm } from '../../Modal';
import { Box, Divider } from '@material-ui/core';

import * as controls from './controls'
import CooldownControl from './cooldown'



const ModalHeader = ({ type, edit, name, trigger, hideModal }) => {

  let title

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


const ModalFooter = ({ edit, handleRemove }) => (
  <div className="modalFooter">
    {edit &&
      <Button className="Remove" onClick={handleRemove}>
        Delete
      </Button>
    }

    <Button type="submit">Save</Button>
  </div>
)


// Modal for Commands/Reactions/Responses.
export const CommandModal = ({ update, entry, ...props }) => {
  const [form, setForm] = useState({
    id: entry.id,
    name: entry.name,
    description: entry.description,
    trigger: entry.command || entry.trigger,
    response: entry.response || entry.reaction,
    useRegex: Boolean(entry.use_regex),
    multiResponse: Boolean(entry.multi_response),
    cooldown: entry.cooldown || false,
    cooldownType: entry.cooldown_bucket || 2,
    cooldownDuration: entry.cooldown_per || 0,
    multiplier: entry.cooldown_multiplier || 1
  })

  const { requestconfig } = useAuth();

  // Handles editing/adding an entry.
  const handleSubmit = (event) => {
    event.preventDefault();
    backendCall.post(
      props.submitURL,
      {
        id: form.id,
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
  const handleRemove = (event) => {
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
              onChange={e => { setForm({ ...form, name: e.target.value }) }}
            />}

          <controls.TriggerControl
            type={props.type}
            trigger={form.trigger}
            onChange={e => { setForm({ ...form, trigger: e.target.value }) }}
          />

          {!props.hideRegex &&
            <controls.RegexControl
              toggle={form.useRegex}
              onToggle={() => { setForm({ ...form, useRegex: !form.useRegex }) }}
            />}

          <controls.ResponseControl
            response={form.response}
            onChange={e => { setForm({ ...form, response: e.target.value }) }}
          />

          {!props.hideMultiResponse &&
            <controls.MultiResponseControl
              toggle={form.multiResponse}
              onToggle={() => { setForm({ ...form, multiResponse: !form.multiResponse }) }}
            />}

          <controls.DescriptionControl
            description={form.description}
            onChange={e => { setForm({ ...form, description: e.target.value }) }}
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

CommandModal.defaultProps = {
  entry: {
    name: "",
    description: "",
    useRegex: false,
    multi_response: false,
  },

  hideName: false,
  hideRegex: false,
  hideMultiResponse: false,
}

CommandModal.propTypes = {
  // Modal type
  type: PropTypes.oneOf(['Command', 'Response', 'Trigger']).isRequired,

  // entry data
  entry: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    trigger: PropTypes.string,
    command: PropTypes.string,
    response: PropTypes.string.isRequired,
    use_regex: PropTypes.bool,
    multi_response: PropTypes.bool
  }),

  // API endpoint URLs
  submitURL: PropTypes.string.isRequired,
  removeURL: PropTypes.string,

  // render filter props.
  hideName: PropTypes.bool,
  hideRegex: PropTypes.bool,
  hideMultiResponse: PropTypes.bool,

  update: PropTypes.number.isRequired,
  setUpdate: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,


}

export default CommandModal
