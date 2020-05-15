import React from 'react'
import { Input, FormLabel, FormControl } from './Form'
import { Button } from './Button'
import styled from 'styled-components';

const LoginFormStyle = styled.div`
${({theme}) => `
  background: ${theme.colors.secondaryBackground};
  padding: 20px;
  margin-top: 25%;


  form {
    display:flex;
    flex-direction: column;
    text-align: left;
  }

  .loginFooter {
    margin-top: 10px;
    padding: 5px;
    padding-bottom: 0;
    display: flex;

    button {
      background: ${theme.colors.backgroundColor};
      margin-left: auto;
    }
  }
`}`

export const LoginForm = ({ setUserName, setPassword, handleSubmit }) => (
  <LoginFormStyle>
    <div className="loginHeader"></div>
    <form onSubmit={handleSubmit}>
      <FormControl>
        <FormLabel>Username</FormLabel>
        <Input
          type="username"
          id="userName"
          onChange={e => { setUserName(e.target.value); }}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          id="password"
          onChange={e => { setPassword(e.target.value); }}
        />
      </FormControl>
      <div className="loginFooter">
        <Button type="submit" onClick={handleSubmit}>
          Login
      </Button>
      </div>
    </form>
  </LoginFormStyle>
)
