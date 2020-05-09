import React from "react";
import { useAuth } from "../context/Auth";
import { Button } from 'react-bootstrap';

const Admin = (props) => {
  const { setAuthToken } = useAuth();

  const logOut = () => {
    setAuthToken('');
  }

  return (
    <div>
      <div>Admin Page</div>
      <Button onClick={logOut}>Log out</Button>
    </div>
  );
}

export default Admin;
