import React, { useState, useEffect, Dispatch, ChangeEvent } from 'react';

import { Input } from '../../Form'
import { Switch, Box, Select, MenuItem, Typography } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import styled from 'styled-components';
import { ToggleProps } from './controls'
import { EntryFormData } from './index'

const CooldownFormControl = styled(FormControl)`
${({theme}) => `
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 40px;

`}`

const CooldownSelect = styled(Select) <any>`
${({ theme }) => `
flex-grow: 1;

.MuiSelect-root {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.MuiSelect-select {
  padding: 0;
}
`}`

const CooldownMenuItem = styled(MenuItem) <any>`
  justify-content: center;
`

const CooldownDurationInput = styled(Input) <any>`
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

const CooldownContainer = styled(Box)`
${({theme}) => `
  padding: ${theme.spacing(2, 1, 1, 1)};

  ${CooldownFormControl}:first-child {
    margin-bottom: ${theme.spacing(1)}px;
  }

`}`

export const CooldownToggle = (props: ToggleProps) => (
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


type CooldownControlProps = {
  form: EntryFormData
  setForm: Dispatch<any>
}

export const CooldownControl = ({ form, setForm, ...props }: CooldownControlProps) => {
  return (
    <>
      <CooldownToggle
        toggle={form.cooldown}
        onToggle={() => { setForm({ ...form, cooldown: !form.cooldown }) }}
      />

      {form.cooldown &&
        <CooldownContainer>
          <CooldownFormControl>

            <Typography style={{ marginRight: "auto" }}>Duration:</Typography>
            <CooldownDurationSelect
              duration={form.cooldownDuration}
              setDuration={(v) => { setForm({ ...form, cooldownDuration: v }) }}
              type={form.multiplier}
              setType={(e: ChangeEvent<HTMLSelectElement>) => { setForm({ ...form, multiplier: Number(e.target.value) }) }}
            />
          </CooldownFormControl>

          <CooldownFormControl>
            <Typography style={{ marginRight: "auto" }}>Cooldown Type:</Typography>
            <CooldownTypeSelect
              type={form.cooldownType}
              setType={(e: ChangeEvent<HTMLSelectElement>) => { setForm({ ...form, cooldownType: Number(e.target.value) }) }}
            />
          </CooldownFormControl>
      </CooldownContainer>
      }
    </>
  )
}


type DurationSelectProps = {
  duration: number
  setDuration: Dispatch<number>
  type: number
  setType: (e: ChangeEvent<HTMLSelectElement>) => void
}

export const CooldownDurationSelect = ({ duration, setDuration, type, setType, ...props }: DurationSelectProps) => {
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

  const isValid = (value: string) => value.match(/^(\d{1,2}\.?(\d{1,2})?|)$/) ? true : false

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isValid(event.target.value)) {
      setDisplayDuration(Number(event.target.value))
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
        variant="filled"
        onChange={setType}
        disableUnderline
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


type TypeSelectProps = {
  type: number
  setType: (e: ChangeEvent<HTMLSelectElement>) => void
}

export const CooldownTypeSelect = (props: TypeSelectProps) => {
  // list of cooldown types mapped to BucketType values
  type TypeMapProps = {
    value: number
    label: string
  }
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
        variant="filled"
        value={props.type}
        onChange={props.setType}
        disableUnderline
      >
        {cooldownTypeMap.map((ctype: any, i) =>
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

export default CooldownControl
