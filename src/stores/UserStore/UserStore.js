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


import Reflux from 'reflux';
import UserActions from '../../actions/UserActions';
import ConnectionsActions from '../../actions/ConnectionsActions'
import Location from '../../core/Location';
import Api from '../../components/ApiCaller';
import cookie from 'react-cookie';
import { servicesUrl } from '../../config'

class UserStore extends Reflux.Store
{
  user = {
    id: null,
    name: "Pat Bentar",
    email: "pat.bentar@coriolis.ui",
    created: new Date(),
    project: {},
    roles: [],
    projects: null,
    token: null,
    settings: {
      notifications: true
    }
  }


  constructor() {
    super()
    this.listenables = UserActions

    this.state = {
      currentUser: this.user,
      loadingState: false
    }

    let token = cookie.load('token')
    let projectId = cookie.load('projectId')
    if (token && projectId) {
      UserActions.tokenLogin(token, projectId)
    }
  }

  onLogin() {
    Api.setDefaultHeader('X-Auth-Token', null)
    this.setState({ loadingState: true })
  }

  onLoginSuccess(response) {
    let token = response.headers['X-Subject-Token']
    Api.setDefaultHeader('X-Auth-Token', token)
    cookie.save('unscopedToken', token, { path: "/" })

    UserActions.getScopedProjects(response => {
      if (response.data.projects) {
        let projectId = cookie.load('projectId')
        if (!projectId) {
          projectId = response.data.projects[0].id
        }
        UserActions.loginScope(token, projectId)
      } else {
        // TODO: Error case no scoped projects
      }
    })
  }

  onLoginScopeSuccess(response) {
    this.setState({ loadingState: false })

    let currentUser = this.state.currentUser
    currentUser.id = response.data.token.user.id
    currentUser.name = response.data.token.user.name
    currentUser.token = response.headers['X-Subject-Token']
    currentUser.project = response.data.token.project

    cookie.save('token', currentUser.token, { path: "/" })
    cookie.save('projectId', currentUser.project.id, { path: "/" })
    Api.setDefaultHeader('X-Auth-Token', currentUser.token)

    this.setState({currentUser: currentUser})

    ConnectionsActions.loadProviders()
    ConnectionsActions.loadConnections()

    if (window.location.pathname == "/" || window.location.pathname == "/login") {
      Location.push('/replicas');
    }

    UserActions.getScopedProjects()
  }

  onLoginScopeFailed(token) {
    // In case the scoping the project id from cookie didn't work, fallback to first project in list
    UserActions.loginScope(token, this.state.currentUser.projects[0].id, false)
  }

  onLoginFailed(response) {
    this.setState({ loadingState: false })
  }

  onLogout() {
    Api.sendAjaxRequest({
      url: servicesUrl.identity,
      method: "DELETE",
      headers: { 'X-Subject-Token': this.state.currentUser.token }
    })
    .then(() => {
      cookie.remove('token');
      window.location.href = "/"

    })
    .catch(() => {
      cookie.remove('token');
      window.location.href = "/"
    })

    Api.resetHeaders()
  }

  onTokenLoginFailed() {
    cookie.remove('token');
    cookie.remove('projectId');
    Api.resetHeaders()
    Location.push('/login');
  }

  onLogoutSuccess(response) {
    cookie.remove('token');
    cookie.remove('projectId');
    Location.push('/login');
  }

  onSetCurrentUser(userId) {
    this.state.users.forEach(user => {
      if (user.id == userId) {
        this.setState({ currentUser: user })
      }
    }, this)
  }

  onSwitchProject(projectId) {
    console.log("onSwitchProject", projectId)
    if (projectId) {
      let token = cookie.load('unscopedToken')
      Api.setDefaultHeader('X-Auth-Token', null)
      UserActions.loginScope(token, projectId)
    }
  }

  onGetScopedProjectsCompleted(response) {
    let currentUser = this.state.currentUser
    currentUser.projects = response.data.projects

    this.setState({ currentUser: currentUser })
  }

  onFederateToken(token) {
    Api.setDefaultHeader('X-Auth-Token', token)
    cookie.save('unscopedToken', token, { path: "/" })
    UserActions.getScopedProjects(response => {
      if (response.data.projects) {
        UserActions.loginScope(token, response.data.projects[0].id)
      } else {
        // TODO: Error case no scoped projects
      }
    })
  }
}

UserStore.id = "userStore"

export default UserStore;
