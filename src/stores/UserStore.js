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

import { observable, action } from 'mobx'
import type { User, Credentials } from '../types/User'
import type { Project } from '../types/Project'
import UserSource from '../sources/UserSource'
import projectStore from './ProjectStore'
import notificationStore from '../stores/NotificationStore'
import DomUtils from '../utils/DomUtils'

/**
 * This is the authentication / authorization flow:
 * 1. Post username and password unscoped login. Set unscoped token in cookies.
 * 2. Get user details with unscoped token to see if he has project id
 * 3. Post unscoped token with project id (either from his details or from cookies). Set scoped token and project id in cookies.
 * 4. Get token login on subsequent app reloads to retrieve the user info.
 *
 * After token expiration, the app is redirected to login page.
 */
class UserStore {
  @observable loggedUser: ?User = null
  @observable users: User[] = []
  @observable loading: boolean = false
  @observable loginFailedResponse: any = null
  @observable userDetails: ?User = null
  @observable userDetailsLoading: boolean = false
  @observable updating: boolean = false
  @observable loggedIn: boolean = false
  @observable projects: Project[] = []
  @observable allUsersLoading: boolean = false

  get domainName(): string {
    return UserSource.getDomainName()
  }

  saveDomainName(domainName: string) {
    UserSource.saveDomainName(domainName)
  }

  @action login(creds: Credentials): Promise<void> {
    this.loading = true
    this.loggedUser = null
    this.loginFailedResponse = null

    return UserSource.login(creds).then((auth: any) => {
      this.saveDomainName(creds.domain)

      this.loggedUser = { id: auth.token.user.id, email: '', name: '', project: { id: '', name: '' } }
      return this.getLoggedUserInfo()
    }).then(() => {
      return this.loginScoped(this.loggedUser ? this.loggedUser.project_id : '', true)
    }).then(() => {
      return this.isAdmin()
    }).then(() => {
      this.loading = false
      this.loggedIn = true
      notificationStore.alert('Signed in', 'success')
    }).catch((reason) => {
      this.loading = false
      this.loginFailedResponse = reason
    })
  }

  @action loginScoped(projectId?: string, skipProjectCookie?: boolean): Promise<User> {
    return projectStore.getProjects().then(() => {
      let projects = projectStore.projects.filter(p => p.enabled)
      if (projects.length === 0) {
        return Promise.reject({ status: 500, message: 'There are no projects assigned to user.' })
      }

      let project = projects.find(p => p.id === projectId)
      let id = (project && project.id) || projects[0].id
      return UserSource.loginScoped(id, Boolean(id && skipProjectCookie))
    }).then((user: User) => {
      if (!this.loggedUser) {
        return Promise.reject('No Logged in user')
      }
      this.loggedUser.scoped = true
      this.loggedUser.project = user.project
      return this.loggedUser
    })
  }

  @action getLoggedUserInfo(): Promise<void> {
    if (!this.loggedUser) {
      return Promise.reject('No logged-in user')
    }

    return UserSource.getUserInfo(this.loggedUser.id).then((userData: User) => {
      this.loggedUser = { ...this.loggedUser, ...userData, isAdmin: false }
    })
  }

  @action tokenLogin(): Promise<void> {
    this.loggedUser = null
    this.loading = true

    return UserSource.tokenLogin().then(user => {
      this.loggedUser = { ...this.loggedUser, ...user }
      notificationStore.alert('Signed in', 'success')
      return this.getLoggedUserInfo()
    }).then(() => {
      return this.isAdmin()
    }).then(() => {
      this.loading = false
      this.loggedIn = true
    }).catch(() => {
      this.loading = false
    })
  }

  @action switchProject(projectId: string): Promise<void> {
    return UserSource.switchProject().then(() => {
      return this.loginScoped(projectId)
    }).then(() => {
      return this.isAdmin()
    }).catch(reason => {
      console.error('Error switching projects', reason)
      notificationStore.alert('Error switching projects')
      this.logout()
    })
  }

  @action logout(): Promise<void> {
    this.loggedIn = false

    return UserSource.logout().catch(reason => {
      console.log('Error logging out', reason)
      notificationStore.alert('Error logging out')
    })
  }

  @action getAllUsers(showLoading?: boolean): Promise<void> {
    if (showLoading) this.allUsersLoading = true

    return UserSource.getAllUsers().then(users => {
      this.users = users
      this.allUsersLoading = false
    }).catch(() => {
      this.allUsersLoading = false
    })
  }

  @action getUserInfo(userId: string): Promise<void> {
    this.userDetailsLoading = true

    return UserSource.getUserInfo(userId).then(user => {
      this.userDetails = user
      this.userDetailsLoading = false
    }).catch(() => {
      this.userDetailsLoading = false
    })
  }

  @action isAdmin(): Promise<void> {
    if (!this.loggedUser) {
      return Promise.resolve()
    }
    this.loggedUser.isAdmin = false
    return UserSource.isAdmin(this.loggedUser.id).then(isAdmin => {
      if (this.loggedUser) {
        this.loggedUser.isAdmin = isAdmin
      }
    }).catch(() => {
      if (window.location.href.indexOf(`${DomUtils.urlHashPrefix}project`) > -1 || window.location.href.indexOf(`${DomUtils.urlHashPrefix}user`) > -1) {
        window.location.href = `${DomUtils.urlHashPrefix}`
      }
    })
  }

  @action clearUserDetails() {
    this.userDetailsLoading = false
    this.userDetails = null
  }

  @action update(userId: string, user: User): Promise<void> {
    this.updating = true

    return UserSource.update(userId, user, this.userDetails).then((user: User) => {
      this.userDetails = user
      this.updating = false
      if (this.loggedUser && this.loggedUser.id === userId) {
        this.loggedUser.name = user.name
      }
    }).catch(() => {
      this.updating = false
    })
  }

  @action assignUserToProject(userId: string, projectId: string): Promise<void> {
    this.updating = true

    return UserSource.assignUserToProject(userId, projectId).then(() => {
      this.updating = false
    }).catch(() => { this.updating = false })
  }

  @action assignUserToProjectWithRole(userId: string, projectId: string, roleId: string): Promise<void> {
    return UserSource.assignUserToProjectWithRole(userId, projectId, roleId)
  }

  @action add(user: User): Promise<?User> {
    this.updating = true

    return UserSource.add(user).then((user: User) => {
      if (!this.users.find(u => u.id === user.id)) {
        this.users = [
          ...this.users,
          user,
        ]
        this.users.sort((a, b) => a.name.localeCompare(b.name))
      }
      this.updating = false
      return user
    }).catch((ex) => {
      console.error(ex)
      this.updating = false
      return null
    })
  }

  @action delete(userId: string): Promise<void> {
    return UserSource.delete(userId).then(() => {
      this.users = this.users.filter(u => u.id === userId)
    })
  }

  @action getProjects(userId: string): Promise<void> {
    return UserSource.getProjects(userId).then((projects: Project[]) => {
      this.projects = projects
    })
  }

  @action clearProjects() {
    this.projects = []
  }
}

export default new UserStore()
