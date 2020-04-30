import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "./Auth";

function PrivateRoute({ component: Component, ...args }) {
  const { authToken } = useAuth();

  return (
    <Route
      {...args}
      render={props =>
        authToken ? (
          <Component {...props} />
        ) : (
            <Redirect to={{ pathname: "/login", state: { referer: props.location } }} />
          )
      }
    />
  );
}

export default PrivateRoute;
