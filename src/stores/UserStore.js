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
import UserSource from '../sources/UserSource'
import ProjectStore from './ProjectStore'
import NotificationStore from '../stores/NotificationStore'

/**
 * This is the authentication / authorization flow:
 * 1. Post username and password unscoped login. Set unscoped token in cookies.
 * 2. Post unscoped token with project id. Set scoped token and project id in cookies.
 * 3. Get token login on subsequent app reloads to retrieve the user info.
 * 
 * After token expiration, the app is redirected to login page.
 */
class UserStore {
  @observable user: ?User = null
  @observable loading: boolean = false
  @observable loginFailedResponse: any = null

  @action login(creds: Credentials): Promise<void> {
    this.loading = true
    this.user = null
    this.loginFailedResponse = null

    return UserSource.login(creds).then(() => {
      return this.loginScoped()
    }).then((user: User) => {
      this.loading = false
      NotificationStore.notify('Signed in', 'success')
      this.user = user
      this.getUserInfo(user)
    }).catch((reason) => {
      this.loading = false
      this.loginFailedResponse = reason
    })
  }

  @action loginScoped(projectId?: string): Promise<User> {
    return new Promise((resolve) => {
      const sourceLoginScoped = () => {
        UserSource.loginScoped(projectId || ProjectStore.projects[0].id).then((user: User) => {
          this.user = { ...user, scoped: true }
          resolve(user)
        })
      }
      if (ProjectStore.projects && ProjectStore.projects.length) {
        sourceLoginScoped()
      } else {
        ProjectStore.getProjects().then(() => {
          sourceLoginScoped()
        })
      }
    })
  }

  @action getUserInfo(user: User): Promise<void> {
    return UserSource.getUserInfo(user).then((userData: User) => {
      this.user = { ...this.user, ...userData }
    }).catch(reason => {
      console.error('Error while getting user data', reason)
      NotificationStore.notify('Error while getting user data', 'error')
    })
  }

  @action tokenLogin(): Promise<void> {
    this.user = null
    this.loading = true

    return UserSource.tokenLogin().then(user => {
      this.loading = false
      this.user = { ...this.user, ...user }
      NotificationStore.notify('Signed in', 'success')
      this.getUserInfo(user)
    }).catch(() => {
      this.loading = false
    })
  }

  @action switchProject(projectId: string): Promise<void> {
    NotificationStore.notify('Switching projects')
    return new Promise((resolve, reject) => {
      UserSource.switchProject().then(() => {
        return this.loginScoped(projectId)
      }).then(() => {
        resolve()
      }).catch(reason => {
        console.error('Error switching projects', reason)
        NotificationStore.notify('Error switching projects')
        this.logout()
        reject()
      })
    })
  }

  @action logout(): Promise<void> {
    return UserSource.logout().catch(reason => {
      console.log('Error logging out', reason)
      NotificationStore.notify('Error logging out')
    })
  }
}

export default new UserStore()
