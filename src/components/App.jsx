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

// @flow

import React from 'react'
import { Switch, Route } from 'react-router-dom'
import styled, { injectGlobal } from 'styled-components'

import Fonts from './atoms/Fonts'
import Notifications from './organisms/Notifications'
import LoginPage from './pages/LoginPage'
import ReplicasPage from './pages/ReplicasPage'
import NotFoundPage from './pages/NotFoundPage'
import ReplicaDetailsPage from './pages/ReplicaDetailsPage'
import MigrationsPage from './pages/MigrationsPage'
import MigrationDetailsPage from './pages/MigrationDetailsPage'
import EndpointsPage from './pages/EndpointsPage'
import EndpointDetailsPage from './pages/EndpointDetailsPage'
import WizardPage from './pages/WizardPage'
import userStore from '../stores/UserStore'
import AssessmentsPage from './pages/AssessmentsPage'
import AssessmentDetailsPage from './pages/AssessmentDetailsPage'
import UsersPage from './pages/UsersPage'
import UserDetailsPage from './pages/UserDetailsPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailsPage from './pages/ProjectDetailsPage'

import { navigationMenu } from '../config'
import Palette from './styleUtils/Palette'
import StyleProps from './styleUtils/StyleProps'

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
    min-width: 1240px;
  }
`
const Wrapper = styled.div``

class App extends React.Component<{}> {
  componentWillMount() {
    userStore.tokenLogin()
  }

  render() {
    let renderOptionalPage = (name: string, component: any, path?: string, exact?: boolean) => {
      const isAdmin = userStore.loggedUser ? userStore.loggedUser.isAdmin : true
      // $FlowIgnore
      if (navigationMenu.find(m => m.value === name && !m.disabled && (!m.requiresAdmin || isAdmin))) {
        return <Route path={`${path || `/${name}`}`} component={component} exact={exact} />
      }
      return null
    }

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
          {renderOptionalPage('planning', AssessmentsPage)}
          {renderOptionalPage('planning', AssessmentDetailsPage, '/assessment/:info')}
          {renderOptionalPage('users', UsersPage)}
          {renderOptionalPage('users', UserDetailsPage, '/user/:id', true)}
          {renderOptionalPage('projects', ProjectsPage)}
          {renderOptionalPage('projects', ProjectDetailsPage, '/project/:id', true)}
          <Route component={NotFoundPage} />
        </Switch>
        <Notifications />
      </Wrapper>
    )
  }
}

export default App
