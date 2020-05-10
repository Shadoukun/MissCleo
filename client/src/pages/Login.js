import React, { useState } from "react";
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useAuth } from "../context/Auth";
import { backendCall } from "../api";

const Login = (props) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isError, setIsError] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthToken } = useAuth();


  const postLogin = () => {
    backendCall.post("/auth/login", { userName, password})
    .then(result => {
      if (result.status === 200) {
        console.log(result)
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
      <div>
        <LoginForm setUserName={setUserName} setPassword={setPassword} postLogin={postLogin} />
        {isError && "The username or password provided were incorrect!"}
      </div>
    )
  } else {
    return <Redirect to='/' />;
  }
}


const LoginForm = ({ setUserName, setPassword, postLogin }) => (
  <Form>
    <Form.Group controlId="loginUserName">
      <Form.Label>Username</Form.Label>
      <Form.Control
        type="username"
        placeholder="Username"
        onChange={e => { setUserName(e.target.value); }}
      />
    </Form.Group>

    <Form.Group controlId="loginPassword">
      <Form.Label>Password</Form.Label>
      <Form.Control
        type="password"
        placeholder="Password"
        onChange={e => { setPassword(e.target.value); }}
      />
    </Form.Group>
    <Button onClick={postLogin}>Submit</Button>
  </Form>
)

export default Login;
