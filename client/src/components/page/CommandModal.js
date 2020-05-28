import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from "../Button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/Auth';
import { backendCall } from '../../utilities';

import { Input, FormLabel } from '../Form'
import { ModalForm, ModalFormControl } from '../Modal';
import { FormControlLabel, Switch, Box } from '@material-ui/core';

const NameControl = (props) => (
  <ModalFormControl>
    <FormLabel>Name</FormLabel>
    <Input
      id="name"
      value={props.name}
      onChange={props.onChange}
    />
  </ModalFormControl>
)

const TriggerControl = (props) => (
  <ModalFormControl>
    <FormLabel>{props.type}</FormLabel>
    <Input
      id="trigger"
      value={props.trigger}
      onChange={props.onChange}
    />
  </ModalFormControl>
)

const RegexControl = (props) => (
  <FormControlLabel
    control={
      <Switch
        checked={props.toggle}
        onChange={props.onToggle}
        name="regex"
        color="primary"
      />
    }
    label="Regex"
  />
)

const ResponseControl = (props) => (
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

const MultiResponseControl = (props) => (
  <FormControlLabel
    control={
      <Switch
        checked={props.toggle}
        onChange={props.onToggle}
        name="regex"
        color="primary"
      />
    }
    label="Random Response"
  />
)

const DescriptionControl = (props) => (
  <ModalFormControl>
    <FormLabel>Description</FormLabel>
    <Input
      id="description"
      value={props.description}
      onChange={props.onChange}
    />
  </ModalFormControl>

)

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
const CommandModal = ({ update, ...props }) => {
  const [id,] = useState(props.entry.id)
  const [name, setName] = useState(props.entry.name)
  const [description, setDescription] = useState(props.entry.description)
  const [trigger, setTrigger] = useState(props.entry.trigger || props.entry.command)
  const [response, setResponse] = useState(props.entry.response || props.entry.reaction)
  const [useRegex, setUseRegex] = useState(Boolean(props.entry.use_regex))
  const [multiResponse, setMultiResponse] = useState(Boolean(props.entry.multi_response))

  const { requestconfig } = useAuth();

  // Handles editing/adding an entry.
  const handleSubmit = (event) => {
    event.preventDefault();
    backendCall.post(
      props.submitURL,
      {
        id: id,
        name: name,
        description: description,
        trigger: trigger,
        response: response,
        use_regex: useRegex,
        multi_response: multiResponse,
      },
      requestconfig
    );

    props.setUpdate(() => ++props.update)
    props.hideModal()
  }

  // Handles removing an entry.
  const handleRemove = (event) => {
    event.preventDefault();
    backendCall.post(
      props.removeURL,
      { id: id },
      requestconfig
    );

    props.setUpdate(() => ++props.update)
    props.hideModal()
  }

  return (
    <>
      <ModalHeader
        type={props.type}
        edit={props.edit}
        name={name}
        trigger={trigger}
        hideModal={props.hideModal}
      />

      <Box className="modalBody">
        <ModalForm onSubmit={handleSubmit} autoComplete="off">

          {!props.hideName &&
            <NameControl
              name={name}
              onChange={e => { setName(e.target.value) }}
            />}

          <TriggerControl
            type={props.type}
            trigger={trigger}
            onChange={e => { setTrigger(e.target.value) }}
          />

          {!props.hideRegex &&
            <RegexControl
              toggle={useRegex}
              onToggle={() => { setUseRegex(!useRegex) }}
            />}

          <ResponseControl
            response={response}
            onChange={e => { setResponse(e.target.value) }}
          />

          {!props.hideMultiResponse &&
            <MultiResponseControl
              toggle={multiResponse}
              onToggle={() => { setMultiResponse(!multiResponse) }}
            />}

          <DescriptionControl
            description={description}
            onChange={e => { setDescription(e.target.value) }}
          />

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
