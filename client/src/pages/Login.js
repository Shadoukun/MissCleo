import React, { useState } from "react";
import { Redirect } from 'react-router-dom';
import { useAuth } from "../context/Auth";
import { backendCall } from "../api";
import { LoginForm } from '../components/Login'
import { Container } from '@material-ui/core'

const Login = (props) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isError, setIsError] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthToken } = useAuth();

  const handleSubmit = (event) => {
    event.preventDefault();
    backendCall.post("/auth/login", { userName, password })
      .then(result => {
        if (result.status === 200) {
          console.log(result)
          setAuthToken(result.data.access_token);
          setLoggedIn(true);
        } else {
          setIsError(true);
        }
      }).catch(e => {
        console.log(e)
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


export default Login
