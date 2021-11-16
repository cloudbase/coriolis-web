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

import Fonts from './ui/Fonts'
import NotificationsModule from './modules/NotificationsModule'
import LoginPage from './smart/LoginPage'
import ReplicasPage from './smart/ReplicasPage'
import MessagePage from './smart/MessagePage'
import ReplicaDetailsPage from './smart/ReplicaDetailsPage'
import MigrationsPage from './smart/MigrationsPage'
import MigrationDetailsPage from './smart/MigrationDetailsPage'
import EndpointsPage from './smart/EndpointsPage'
import EndpointDetailsPage from './smart/EndpointDetailsPage'
import WizardPage from './smart/WizardPage'
import userStore from '../stores/UserStore'
import AssessmentsPage from './smart/AssessmentsPage'
import AssessmentDetailsPage from './smart/AssessmentDetailsPage'
import UsersPage from './smart/UsersPage'
import UserDetailsPage from './smart/UserDetailsPage'
import ProjectsPage from './smart/ProjectsPage'
import ProjectDetailsPage from './smart/ProjectDetailsPage'
import DashboardPage from './smart/DashboardPage'
import LogsPage from './smart/LogsPage'
import LogStreamPage from './smart/LogStreamPage'

import Tooltip from './ui/Tooltip/Tooltip'

import { navigationMenu } from '../constants'
import configLoader from '../utils/Config'
import MinionPoolsPage from './smart/MinionPoolsPage/MinionPoolsPage'
import MinionPoolDetailsPage from './smart/MinionPoolDetailsPage/MinionPoolDetailsPage'
import { ThemePalette, ThemeProps } from './Theme'

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
    color: ${ThemePalette.black};
    font-family: Rubik;
    font-size: 14px;
    font-weight: ${ThemeProps.fontWeights.regular};
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
            {renderRoute('/replicas', ReplicasPage, true)}
            {renderRoute('/replicas/:id', ReplicaDetailsPage, true)}
            {renderRoute('/replicas/:id/:page', ReplicaDetailsPage)}
            {renderRoute('/migrations', MigrationsPage, true)}
            {renderRoute('/migrations/:id', MigrationDetailsPage, true)}
            {renderRoute('/migrations/:id/:page', MigrationDetailsPage)}
            {renderRoute('/endpoints', EndpointsPage, true)}
            {renderRoute('/endpoints/:id', EndpointDetailsPage)}
            {renderRoute('/minion-pools', MinionPoolsPage, true)}
            {renderRoute('/minion-pools/:id', MinionPoolDetailsPage, true)}
            {renderRoute('/minion-pools/:id/:page', MinionPoolDetailsPage)}
            {renderRoute('/wizard/:type', WizardPage)}
            {renderOptionalRoute('planning', AssessmentsPage)}
            {renderOptionalRoute('planning', AssessmentDetailsPage, '/assessment/:info')}
            {renderOptionalRoute('users', UsersPage, undefined, true)}
            {renderOptionalRoute('users', UserDetailsPage, '/users/:id')}
            {renderOptionalRoute('projects', ProjectsPage, undefined, true)}
            {renderOptionalRoute('projects', ProjectDetailsPage, '/projects/:id')}
            {renderOptionalRoute('logging', LogsPage)}
            {renderRoute('/streamlog', LogStreamPage)}
            <Route component={MessagePage} />
          </Switch>
        </Router>
        <NotificationsModule />
        <Tooltip />
      </Wrapper>
    )
  }
}

export default hot(App)
