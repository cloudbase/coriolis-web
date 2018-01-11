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

import alt from '../alt'

import UserSource from '../sources/UserSource'
import ProjectActions from './ProjectActions'
import ProjectStore from '../stores/ProjectStore'
import NotificationActions from './NotificationActions'

class UserActions {
  login(data) {
    UserSource.login(data).then(this.loginSuccess, this.loginFailed)
    return data
  }

  loginSuccess() {
    this.loginScoped()
    return true
  }

  loginFailed(response) {
    return response || true
  }

  loginScoped(projectId) {
    let projectStore = ProjectStore.getState()
    if (projectStore.projects && projectStore.projects.length) {
      UserSource.loginScoped(projectId || projectStore.projects[0].id)
        .then(this.loginScopedSuccess, this.loginScopedFailed)
    } else {
      ProjectActions.getProjects().promise.then(() => {
        UserSource.loginScoped(projectId || ProjectStore.getState().projects[0].id)
          .then(this.loginScopedSuccess, this.loginScopedFailed)
      })
    }
    return projectId || true
  }

  loginScopedSuccess(response) {
    this.getUserInfo(response)
    NotificationActions.notify('Signed in', 'success')
    return response || true
  }

  loginScopedFailed(response) {
    return response || true
  }

  tokenLogin() {
    UserSource.tokenLogin().then(this.tokenLoginSuccess, this.tokenLoginFailed)
    return true
  }

  tokenLoginSuccess(response) {
    NotificationActions.notify('Signed in', 'success')
    this.getUserInfo(response)
    return response || true
  }

  tokenLoginFailed(response) {
    return response || true
  }

  switchProject(projectId) {
    NotificationActions.notify('Switching projects')
    UserSource.switchProject().then(
      () => { this.switchProjectSuccess(projectId) },
      response => { this.switchProjectFailed(response) }
    )
    return projectId || true
  }

  switchProjectSuccess(projectId) {
    this.loginScoped(projectId)
    return projectId || true
  }

  switchProjectFailed(response) {
    this.logout()
    return response || true
  }

  logout() {
    UserSource.logout().then(() => { this.logoutSuccess() }, () => { this.logoutFailed() })
    return true
  }

  logoutSuccess() {
    return true
  }

  logoutFailed() {
    return true
  }

  getUserInfo(user) {
    UserSource.getUserInfo(user).then(
      response => { this.getUserInfoSuccess(response) },
      response => { this.getUserInfoFailed(response) }
    )
    return user || true
  }

  getUserInfoSuccess(response) {
    return response || true
  }

  getUserInfoFailed(response) {
    return response || true
  }
}

export default alt.createActions(UserActions)
