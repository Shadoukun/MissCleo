import React from 'react';
import { Route } from 'react-router-dom';

type ContextRouteProps = {
  provider: any, // context provider
  component: any // Route component
}

const ContextRoute = ({ provider: Provider, component: Component, ...props }: ContextRouteProps) => {

  return (
    <Route {...props}>
      <Provider>
        <Component />
      </Provider>
    </Route>
  );
};

export default ContextRoute;
