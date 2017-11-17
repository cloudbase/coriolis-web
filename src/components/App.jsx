/*
Copyright (C) 2017  Cloudbase Solutions SRL
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import React from 'react'
import { Switch, Route } from 'react-router-dom'
import styled, { injectGlobal } from 'styled-components'

import {
  LoginPage,
  Fonts,
  Notifications,
  NotFoundPage,
  ReplicasPage,
  ReplicaDetailsPage,
  MigrationsPage,
  MigrationDetailsPage,
  EndpointsPage,
  EndpointDetailsPage,
  WizardPage,
} from 'components'

import Palette from './styleUtils/Palette'
import StyleProps from './styleUtils/StyleProps'
import UserActions from '../actions/UserActions'

injectGlobal`
  ${Fonts}
  body {
    margin: 0;
    color: ${Palette.black};
    font-family: Rubik;
    font-size: 14px;
    font-weight: ${StyleProps.fontWeights.regular};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`
const Wrapper = styled.div``

class App extends React.Component {
  componentWillMount() {
    UserActions.tokenLogin()
  }

  render() {
    return (
      <Wrapper>
        <Switch>
          <Route path="/" component={LoginPage} exact />
          <Route path="/login" component={LoginPage} />
          <Route path="/replicas" component={ReplicasPage} />
          <Route path="/replica/:id" component={ReplicaDetailsPage} exact />
          <Route path="/replica/:page/:id" component={ReplicaDetailsPage} />
          <Route path="/migrations" component={MigrationsPage} />
          <Route path="/migration/:id" component={MigrationDetailsPage} exact />
          <Route path="/migration/:page/:id" component={MigrationDetailsPage} />
          <Route path="/endpoints" component={EndpointsPage} />
          <Route path="/endpoint/:id" component={EndpointDetailsPage} />
          <Route path="/wizard/:type" component={WizardPage} />
          <Route component={NotFoundPage} />
        </Switch>
        <Notifications />
      </Wrapper>
    )
  }
}

export default App
