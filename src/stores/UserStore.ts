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

import { observable, action, runInAction } from 'mobx'
import type { User, Credentials } from '../@types/User'
import type { Project } from '../@types/Project'
import UserSource from '../sources/UserSource'
import projectStore from './ProjectStore'
import notificationStore from './NotificationStore'

/**
 * This is the authentication / authorization flow:
 * 1. Post username and password unscoped login. Set unscoped token in cookies.
 * 2. Get user details with unscoped token to see if he has project id
 * 3. Post unscoped token with project id
 * (either from his details or from cookies). Set scoped token and project id in cookies.
 * 4. Get token login on subsequent app reloads to retrieve the user info.
 *
 * After token expiration, the app is redirected to login page.
 */
class UserStore {
  @observable loggedUser: User | null = null

  @observable users: User[] = []

  @observable loading: boolean = false

  @observable loginFailedResponse: any = null

  @observable userDetails: User | null = null

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

  @action async login(creds: Credentials): Promise<void> {
    this.loading = true
    this.loggedUser = null
    this.loginFailedResponse = null

    try {
      const auth = await UserSource.login(creds)
      this.saveDomainName(creds.domain)
      this.loggedUser = {
        id: auth.token.user.id, email: '', name: '', project: { id: '', name: '' },
      }
      await this.getLoggedUserInfo()
      await this.loginScoped(this.loggedUser ? this.loggedUser.project_id : '', true)
      await this.isAdmin()
      runInAction(() => { this.loggedIn = true })
      notificationStore.alert('Signed in', 'success')
    } catch (err) {
      runInAction(() => { this.loginFailedResponse = err })
    } finally {
      runInAction(() => { this.loading = false })
    }
  }

  async loginScoped(projectId?: string, skipProjectCookie?: boolean): Promise<User> {
    await projectStore.getProjects()
    const projects = projectStore.projects.filter(p => p.enabled)
    if (projects.length === 0) {
      return Promise.reject({ status: 500, message: 'There are no projects assigned to user.' })
    }

    const project = projects.find(p => p.id === projectId)
    const id = (project && project.id) || projects[0].id
    const user: User = await UserSource.loginScoped(id, Boolean(id && skipProjectCookie))
    runInAction(() => {
      if (!this.loggedUser) {
        throw new Error('No Logged in user')
      }
      this.loggedUser.scoped = true
      this.loggedUser.project = user.project
    })
    if (!this.loggedUser) {
      throw new Error('No Logged in user')
    }
    return this.loggedUser
  }

  async getLoggedUserInfo(): Promise<void> {
    if (!this.loggedUser) {
      throw new Error('No logged-in user')
    }

    const userData: User = await UserSource.getUserInfo(this.loggedUser.id)
    runInAction(() => { this.loggedUser = { ...this.loggedUser, ...userData, isAdmin: null } })
  }

  @action async tokenLogin(): Promise<void> {
    this.loggedUser = null
    this.loading = true

    try {
      const user = await UserSource.tokenLogin()
      runInAction(() => { this.loggedUser = { ...this.loggedUser, ...user } })
      notificationStore.alert('Signed in', 'success')
      await this.getLoggedUserInfo()
      await this.isAdmin()
      runInAction(() => { this.loggedIn = true })
    } finally {
      runInAction(() => { this.loading = false })
    }
  }

  async switchProject(projectId: string): Promise<void> {
    try {
      await UserSource.switchProject()
      await this.loginScoped(projectId)
      await this.isAdmin()
    } catch (err) {
      console.error('Error switching projects', err)
      notificationStore.alert('Error switching projects')
      this.logout()
    }
  }

  @action async logout(): Promise<void> {
    this.loggedIn = false

    try {
      await UserSource.logout()
    } catch (err) {
      console.log('Error logging out', err)
      notificationStore.alert('Error logging out')
    }
  }

  @action async getAllUsers(options?: {
    showLoading?: boolean,
    skipLog?: boolean,
    quietError?: boolean,
  }): Promise<void> {
    if (options?.showLoading) this.allUsersLoading = true

    try {
      const users = await UserSource.getAllUsers(options?.skipLog, options?.quietError)
      runInAction(() => { this.users = users })
    } catch (err) {
      if (err.data?.error?.code !== 403) {
        throw err
      }
    } finally {
      runInAction(() => { this.allUsersLoading = false })
    }
  }

  @action async getUserInfo(userId: string): Promise<void> {
    this.userDetailsLoading = true

    try {
      const user = await UserSource.getUserInfo(userId)
      runInAction(() => { this.userDetails = user })
    } finally {
      runInAction(() => { this.userDetailsLoading = false })
    }
  }

  @action async isAdmin(): Promise<void> {
    if (!this.loggedUser) {
      return
    }
    this.loggedUser = { ...this.loggedUser, isAdmin: null }
    try {
      const isAdmin = await UserSource.isAdmin(this.loggedUser.id)
      runInAction(() => {
        if (this.loggedUser) {
          this.loggedUser = { ...this.loggedUser, isAdmin }
        }
      })
    } catch (err) {
      runInAction(() => {
        if (this.loggedUser) {
          this.loggedUser = { ...this.loggedUser, isAdmin: false }
        }
      })
    }
  }

  @action clearUserDetails() {
    this.userDetailsLoading = false
    this.userDetails = null
  }

  @action async update(userId: string, user: Partial<User>): Promise<void> {
    this.updating = true

    try {
      const updatedUser: User = await UserSource.update(userId, user, this.userDetails)
      runInAction(() => {
        this.userDetails = updatedUser
        if (this.loggedUser && this.loggedUser.id === userId) {
          this.loggedUser.name = user.name || ''
        }
      })
    } finally {
      runInAction(() => { this.updating = false })
    }
  }

  @action async assignUserToProject(userId: string, projectId: string): Promise<void> {
    this.updating = true

    try {
      await UserSource.assignUserToProject(userId, projectId)
    } finally {
      runInAction(() => { this.updating = false })
    }
  }

  async assignUserToProjectWithRole(
    userId: string, projectId: string, roleId: string,
  ): Promise<void> {
    await UserSource.assignUserToProjectWithRole(userId, projectId, roleId)
  }

  @action async add(user: User): Promise<User | null> {
    this.updating = true

    try {
      const addedUser: User = await UserSource.add(user)
      if (this.users.find(u => u.id === addedUser.id)) {
        return null
      }
      runInAction(() => {
        this.users = [
          ...this.users,
          addedUser,
        ]
        this.users.sort((a, b) => a.name.localeCompare(b.name))
      })
      return addedUser
    } catch (err) {
      console.error(err)
      return null
    } finally {
      runInAction(() => { this.updating = false })
    }
  }

  async delete(userId: string): Promise<void> {
    await UserSource.delete(userId)
    runInAction(() => {
      this.users = this.users.filter(u => u.id === userId)
    })
  }

  async getProjects(userId: string): Promise<void> {
    const projects: Project[] = await UserSource.getProjects(userId)
    runInAction(() => { this.projects = projects })
  }

  @action clearProjects() {
    this.projects = []
  }
}

export default new UserStore()
