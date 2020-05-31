import React, { useState, useEffect } from 'react';

import { Input } from '../../Form'
import { Switch, Box, Select, MenuItem, Typography } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import styled from 'styled-components';


const CooldownFormControl = styled(FormControl)`
  display: flex;
  flex-direction: row;
  width: 100%;
`

const CooldownSelect = styled(Select)`
  flex-grow: 1;
  text-align: center;
`

const CooldownMenuItem = styled(MenuItem)`
  justify-content: center;
`

const CooldownDurationInput = styled(Input)`
${({ theme }) => `
  width: 8ch;
  margin-right: ${theme.spacing(1)}px;
  text-align: right;

  input {
      text-align: right;
    }
`}`

const CooldownBox = styled(Box)`
  display: flex;
  width: 30%;
`

export const CooldownToggle = (props) => (
  <Box display="flex">
    <Typography style={{ marginRight: "auto" }}>Cooldown</Typography>
    <Switch
      checked={props.toggle}
      onChange={props.onToggle}
      name="cooldown"
      color="primary"
    />
  </Box>
)


export const CooldownDurationSelect = ({ duration, setDuration, type, setType, ...props }) => {
  const [displayDuration, setDisplayDuration] = useState(duration / type || 0)
  const [error, setError] = useState(false)

  // list of duration multipliers.
  // duration = n * type.value
  const durationTypeMap = [
    {
      value: 1,
      label: "Seconds"
    },
    {
      value: 60,
      label: "Minutes"
    },
    {
      value: 3600,
      label: "Hours"
    },
    {
      value: 86400,
      label: "Days"
    }
  ]

  useEffect(() => {
    setDuration(displayDuration * type)
  }, [displayDuration, type])

  const isValid = (value) => value.match(/^(\d{1,2}\.?(\d{1,2})?|)$/) ? true : false

  const handleChange = (event) => {
    if (isValid(event.target.value)) {
      setDisplayDuration(event.target.value)
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <CooldownBox>
      <CooldownDurationInput
        id="duration-Input"
        value={displayDuration}
        error={error}
        onChange={handleChange}
      />

      <CooldownSelect
        labelId="duration-type-select-label"
        id="duration-type-select"
        value={type}
        onChange={setType}
      >
        {durationTypeMap.map((type, i) =>
          <CooldownMenuItem
            key={i}
            value={type.value}
          >
            {type.label}
          </CooldownMenuItem>
        )}
      </CooldownSelect>
    </CooldownBox>
  )
}

export const CooldownTypeSelect = (props) => {
  // list of cooldown types mapped to BucketType values
  const cooldownTypeMap = [
    {
      value: 2,
      label: "Server"
    },
    {
      value: 1,
      label: "User"
    }
  ]

  return (
    <CooldownBox>
      <CooldownSelect
        labelId="cooldown-type-select-label"
        id="cooldown-type-select"
        value={props.type}
        onChange={props.setType}
      >
        {cooldownTypeMap.map((ctype, i) =>
          <CooldownMenuItem
            ListItemClasses="cooldownListItem"
            key={i}
            value={ctype.value}
          >
            {ctype.label}
          </CooldownMenuItem>
        )}
      </CooldownSelect>
    </CooldownBox>
  )
}


export const CooldownControl = ({ form, setForm, ...props }) => {
  return (
    <>
      <CooldownToggle
        toggle={form.cooldown}
        onToggle={() => { setForm({ ...form, cooldown: !form.cooldown }) }}
      />

      {form.cooldown &&
        <Box pl={1} pr={1}>
          <CooldownFormControl>
            <Typography style={{ marginRight: "auto" }}>Duration:</Typography>
            <CooldownDurationSelect
              duration={form.cooldownDuration}
              setDuration={(v) => { setForm({ ...form, cooldownDuration: v }) }}
              type={form.multiplier}
              setType={(e) => { setForm({ ...form, multiplier: e.target.value }) }}
            />
          </CooldownFormControl>

          <CooldownFormControl>
            <Typography style={{ marginRight: "auto" }}>Cooldown Type:</Typography>
            <CooldownTypeSelect
              type={form.cooldownType}
              setType={(e) => { setForm({ ...form, cooldownType: e.target.value }) }}
            />
          </CooldownFormControl>
        </Box>
      }
    </>
  )
}

export default CooldownControl
