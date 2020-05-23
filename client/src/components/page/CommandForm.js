import React from 'react';
import { Input, FormLabel } from '../Form'
import { Button } from "../Button"
import { ModalForm, ModalFormControl } from '../Modal';
import { FormControlLabel, Switch } from '@material-ui/core';
import PropTypes from 'prop-types';


export const CommandForm = (props) => (
  <ModalForm onSubmit={props.handleSubmit} autoComplete="off">

    {!props.hideName &&
      <ModalFormControl>
        <FormLabel>Name</FormLabel>
        <Input
          id="name"
          value={props.name}
          onChange={props.handleNameChange}
        />
      </ModalFormControl>
    }

    <ModalFormControl>
      <FormLabel>{props.type === 'Command' ? 'Command' : 'Trigger'}</FormLabel>
      <Input
        id="trigger"
        value={props.trigger}
        onChange={props.handleTriggerChange}
      />
    </ModalFormControl>

    {!props.hideRegex &&
      <FormControlLabel
        control={
          <Switch
            checked={props.useRegex}
            onChange={props.toggleRegex}
            name="regex"
            color="primary"
          />
        }
        label="Regex"
      />
    }

    <ModalFormControl>
      <FormLabel>Response</FormLabel>
      <Input
        id="response"
        multiline
        rows={3}
        rowsMax={6}
        value={props.response}
        onChange={props.handleResponseChange}
      />
    </ModalFormControl>

    {!props.hideMultiResponse &&
      <FormControlLabel
        control={
          <Switch
            checked={props.multiResponse}
            onChange={props.toggleMultiResponse}
            name="regex"
            color="primary"
          />
        }
        label="Random Response"
      />
    }

    <ModalFormControl>
      <FormLabel>Description</FormLabel>
      <Input
        id="description"
        value={props.description}
        onChange={props.handleDescriptionChange}
      />

      <div className="modalFooter">
        {props.edit &&
          <Button className="Remove" onClick={props.handleRemove}>
            Delete
            </Button>
        }
        <Button type="submit">
          Save
          </Button>
      </div>
    </ModalFormControl>
  </ModalForm>
)

CommandForm.defaultProps = {
  type: "Command",
}

CommandForm.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  trigger: PropTypes.string,
  response: PropTypes.string,
  useRegex: PropTypes.bool,
  multiResponse: PropTypes.bool,

  // handler functions
  handleSubmit: PropTypes.func,
  handleRemove: PropTypes.func,
  handleNameChange: PropTypes.func,
  handleDescriptionChange: PropTypes.func,
  handleTriggerChange: PropTypes.func,
  handleResponseChange: PropTypes.func,
  toggleRegex: PropTypes.func,
  toggleMultiResponse: PropTypes.func,

  // props that effect rendering
  edit: PropTypes.bool,
  hideName: PropTypes.bool,
  hideRegex: PropTypes.bool,
  hideMultiResponse: PropTypes.bool,
}


export default CommandForm
