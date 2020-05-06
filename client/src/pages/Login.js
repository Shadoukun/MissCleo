import React, { useState } from "react";
import { Redirect, useHistory } from 'react-router-dom';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useAuth } from "../context/Auth";

const Login = (props) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isError, setIsError] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthToken } = useAuth();

  const history = useHistory().goBack()
  const referer = history || '/'

  const postLogin = () => {
    axios.post("/auth/login", {
      userName,
      password
    }).then(result => {
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
        <Form>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="username"
              placeholder="Username"
              onChange={e => { setUserName(e.target.value); }}
            />
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              onChange={e => { setPassword(e.target.value); }}
            />
          </Form.Group>
          <Button onClick={postLogin}>Submit</Button>
        </Form>
        {isError && "The username or password provided were incorrect!"}
      </div>
    )
  } else {
    return <Redirect to={referer} />;
  }
}

export default Login;
