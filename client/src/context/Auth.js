import React from 'react';
import { createContext, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';


export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = (props) => {
  const existingToken = localStorage.getItem("auth_token");
  const [authToken, setToken] = useState(existingToken)
  let history = useHistory();


  const setAuthToken = (data) => {
    localStorage.setItem("auth_token", data);
    setToken(data);
  }

  // axios request config for protected route.
  const requestconfig = {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : ''

    },
    validateStatus: (status) => {
      console.log(status)
      switch (status) {
        case 200:
          return true
        case 401:
          history.push('/login')
      }
    }
  }

  return (
    <AuthContext.Provider value={{ setAuthToken, authToken, requestconfig }} {...props} >
      {props.children}
    </AuthContext.Provider>

  )

}




