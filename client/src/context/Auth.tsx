import React from 'react';
import { createContext, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';

type AuthContextProps = {
  authToken: string | null
  setAuthToken: React.Dispatch<string>
  requestconfig: {}
}

type ProviderProps = {
  children: JSX.Element[] | JSX.Element
}

export const AuthContext = createContext<Partial<AuthContextProps>>({});

export const AuthProvider = (props: ProviderProps) => {
  const existingToken = localStorage.getItem("auth_token");
  const [authToken, setToken] = useState(existingToken)
  let history = useHistory();


  const setAuthToken = (data: string) => {
    localStorage.setItem("auth_token", data);
    setToken(data);
  }

  // axios request config for protected route.
  const requestconfig = {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : ''

    },
    validateStatus: (status: number) => {
      switch (status) {
        case 200:
          return true
        default:
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

export function useAuth() {
  return useContext(AuthContext);
}





