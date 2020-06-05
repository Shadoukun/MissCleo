import React from 'react';
import { Switch, Route } from "react-router-dom";

import Navbar from '../components/Navbar';
import QuotePage from './Quotes'
import { ResponsesPage } from './Responses';
import CommandsPage from './Commands';
import ReactionsPage from './Reactions';

const GuildPage = () => {

  return (
    <React.Fragment>
      <Navbar />

      {/* TODO: Put something here */}

      <Switch>
        <Route path={`/:guild(\\d+)/quotes`} component={QuotePage} />
        <Route path={`/:guild(\\d+)/commands`} component={CommandsPage} />
        <Route path={`/:guild(\\d+)/responses`} component={ResponsesPage} />
        <Route path={`/:guild(\\d+)/reactions`} component={ReactionsPage} />
      </Switch>

    </React.Fragment>
  )
}

export default GuildPage;
