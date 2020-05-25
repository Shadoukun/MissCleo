import React, { useState } from "react";
import { Redirect } from 'react-router-dom';
import { useAuth } from "../context/Auth";
import { backendCall } from "../utilities";
import { LoginForm } from '../components/Login'
import { Container } from '@material-ui/core'

export const Login = (props) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isError, setIsError] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthToken } = useAuth();

  const handleSubmit = (event) => {
    event.preventDefault();
    backendCall.post("/auth/login", { userName: userName, password: password })
      .then(result => {
        console.log(result)
        if (result.status === 200) {
          setAuthToken(result.data.access_token);
          setLoggedIn(true);
        } else {
          setIsError(true);
        }
      }).catch(e => {
        setIsError(true);
      });
  }

  if (!isLoggedIn) {
    return (
      <Container maxWidth="xs">
        <LoginForm
          setUserName={setUserName}
          setPassword={setPassword}
          handleSubmit={handleSubmit}
        />
        {isError && "The username or password provided were incorrect!"}
      </Container>
    )
  } else {
    return <Redirect to='/' />;
  }
}

export const Logout = () => {
  const { setAuthToken } = useAuth();
  setAuthToken('');

  return <Redirect to='/' />;

}
