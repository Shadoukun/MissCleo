import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from "../Button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/Auth';
import { backendCall } from '../../utilities';

import CommandForm from './CommandForm';

// Modal for Commands/Reactions/Responses.
const CommandModal = ({update, ...props}) => {
  const [id,] = useState(props.entry.id)
  const [name, setName] = useState(props.entry.name)
  const [description, setDescription] = useState(props.entry.description)
  const [trigger, setTrigger] = useState(props.entry.trigger || props.entry.command)
  const [response, setResponse] = useState(props.entry.response)
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
      <div className="modalHeader">
        <div className="modalTitle">
          <h1>
            {props.edit ? (
            (props.entry.command && "!" + props.entry.command || props.entry.name || props.entry.trigger)
            ) : (
              "New " + props.type
            )}
            </h1>
        </div>
        <Button onClick={props.hideModal}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </div>

      <div className="modalBody">
        <CommandForm
          type={props.type}
          edit
          handleSubmit={handleSubmit}
          handleRemove={handleRemove}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          trigger={trigger}
          setTrigger={setTrigger}
          response={response}
          setResponse={setResponse}
          useRegex={useRegex}
          setUseReges={setUseRegex}
          multiResponse={multiResponse}
          setMultiResponse={setMultiResponse}
          hideName={props.hideName}
          hideRegex={props.hideRegex}
          hideMultiResponse={props.hideMultiResponse}
        />
      </div>
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
