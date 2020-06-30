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

import { hot } from 'react-hot-loader/root'
import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'
import { observe } from 'mobx'

import Fonts from './atoms/Fonts'
import Notifications from './organisms/Notifications'
import LoginPage from './pages/LoginPage'
import ReplicasPage from './pages/ReplicasPage'
import MessagePage from './pages/MessagePage'
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
import DashboardPage from './pages/DashboardPage'
import LogsPage from './pages/LogsPage'
import LogStreamPage from './pages/LogStreamPage'

import Tooltip from './atoms/Tooltip/Tooltip'

import { navigationMenu } from '../constants'
import Palette from './styleUtils/Palette'
import StyleProps from './styleUtils/StyleProps'
import configLoader from '../utils/Config'

const GlobalStyle = createGlobalStyle`
 ${Fonts}
  html, body, main {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
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

const Wrapper = styled.div<any>`
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  > div:first-child {
    height: 100%;
  }
`

type State = {
  isConfigReady: boolean,
}

class App extends React.Component<{}, State> {
  state = {
    isConfigReady: false,
  }

  awaitingRefresh: boolean = false

  async componentDidMount() {
    observe(userStore, 'loggedUser', () => {
      this.setState({})
    })
    await configLoader.load()
    userStore.tokenLogin()
    this.setState({ isConfigReady: true })
  }

  render() {
    if (!this.state.isConfigReady) {
      return null
    }

    const renderMessagePage = (options: {
      path: string,
      exact?: boolean,
      title: string,
      subtitle: string,
      showAuthAnimation?: boolean,
      showDenied?: boolean,
    }) => (
      <Route
        path={options.path}
        exact={options.exact}
        render={() => (
          <MessagePage
            title={options.title}
            subtitle={options.subtitle}
            showAuthAnimation={options.showAuthAnimation}
            showDenied={options.showDenied}
          />
        )}
      />
    )

    const renderRoute = (path: string, component: any, exact?: boolean) => {
      if (!userStore.loggedUser) {
        return renderMessagePage({
          path,
          exact,
          title: 'Authenticating...',
          subtitle: 'Please wait while authenticating user.',
          showAuthAnimation: true,
        })
      }
      return <Route path={path} component={component} exact={exact} />
    }

    const renderOptionalRoute = (name: string, component: any, path?: string, exact?: boolean) => {
      if (configLoader.config.disabledPages.find(p => p === name)) {
        return null
      }
      const actualPath = `${path || `/${name}`}`
      const requiresAdmin = Boolean(navigationMenu.find(n => n.value === name && n.requiresAdmin))
      if (!requiresAdmin) {
        return renderRoute(actualPath, component, exact)
      }
      if (!userStore.loggedUser || userStore.loggedUser.isAdmin == null) {
        return renderMessagePage({
          path: actualPath,
          exact,
          title: 'Checking permissions...',
          subtitle: 'Please wait while checking user\'s permissions.',
          showAuthAnimation: true,
        })
      }
      if (userStore.loggedUser && userStore.loggedUser.isAdmin === false) {
        return renderMessagePage({
          path: actualPath,
          exact,
          title: 'User doesn\'t have permissions to view this page',
          subtitle: 'Please login in with an administrator acount to view this page.',
          showDenied: true,
        })
      }
      if (userStore.loggedUser && userStore.loggedUser.isAdmin) {
        return <Route path={actualPath} exact={exact} component={component} />
      }
      return null
    }

    return (
      <Wrapper>
        <GlobalStyle />
        <Router>
          <Switch>
            {renderRoute('/', DashboardPage, true)}
            <Route path="/login" component={LoginPage} />
            {renderRoute('/dashboard', DashboardPage)}
            {renderRoute('/replicas', ReplicasPage)}
            {renderRoute('/replica/:id', ReplicaDetailsPage, true)}
            {renderRoute('/replica/:page/:id', ReplicaDetailsPage)}
            {renderRoute('/migrations', MigrationsPage)}
            {renderRoute('/migration/:id', MigrationDetailsPage, true)}
            {renderRoute('/migration/:page/:id', MigrationDetailsPage)}
            {renderRoute('/endpoints', EndpointsPage)}
            {renderRoute('/endpoint/:id', EndpointDetailsPage)}
            {renderRoute('/wizard/:type', WizardPage)}
            {renderOptionalRoute('planning', AssessmentsPage)}
            {renderOptionalRoute('planning', AssessmentDetailsPage, '/assessment/:info')}
            {renderOptionalRoute('users', UsersPage)}
            {renderOptionalRoute('users', UserDetailsPage, '/user/:id', true)}
            {renderOptionalRoute('projects', ProjectsPage)}
            {renderOptionalRoute('projects', ProjectDetailsPage, '/project/:id', true)}
            {renderOptionalRoute('logging', LogsPage)}
            {renderRoute('/streamlog', LogStreamPage)}
            <Route component={MessagePage} />
          </Switch>
        </Router>
        <Notifications />
        <Tooltip />
      </Wrapper>
    )
  }
}

export default hot(App)
