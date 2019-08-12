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

import cookie from 'js-cookie'

import Api from '../utils/ApiCaller'
import { servicesUrl, coriolisUrl } from '../constants'
import configLoader from '../utils/Config'
import type { Credentials, User } from '../types/User'
import type { Role, Project, RoleAssignment } from '../types/Project'
import utils from '../utils/ObjectUtils'

class UserModel {
  static parseUserData(data: any) {
    let newData = {
      id: data.token.user.id,
      name: data.token.user.name,
      email: data.token.user.email,
      project: data.token.project,
    }

    return newData
  }
}

class UserSource {
  saveDomainName(domainName: string) {
    localStorage.setItem('userDomainName', domainName)
  }

  getDomainName(): string {
    return localStorage.getItem('userDomainName') || configLoader.config.defaultUserDomain
  }

  async login(userData: Credentials): Promise<any> {
    let auth = {
      auth: {
        identity: {
          methods: ['password'],
          password: {
            user: {
              name: userData.name,
              domain: { name: userData.domain },
              password: userData.password,
            },
          },
        },
        scope: 'unscoped',
      },
    }

    Api.setDefaultHeader('X-Auth-Token', null)

    let response = await Api.send({
      url: servicesUrl.identity,
      method: 'POST',
      data: auth,
    })
    let token = response.headers ? response.headers['X-Subject-Token'] || response.headers['x-subject-token'] : ''
    Api.setDefaultHeader('X-Auth-Token', token)
    cookie.set('unscopedToken', token, { expires: 30 })
    return response.data
  }

  async loginScoped(projectId: string, skipCookie?: boolean): Promise<User> {
    let useProjectId = skipCookie ? projectId : cookie.get('projectId') || projectId
    let token = cookie.get('unscopedToken')

    let auth = {
      auth: {
        identity: {
          methods: ['token'],
          token: {
            id: token,
          },
        },
        scope: {
          project: {
            id: useProjectId,
          },
        },
      },
    }

    Api.setDefaultHeader('X-Auth-Token', null)

    try {
      let response = await Api.send({
        url: servicesUrl.identity,
        method: 'POST',
        data: auth,
      })
      let token = response.headers ? response.headers['X-Subject-Token'] || response.headers['x-subject-token'] : ''
      let data: User = UserModel.parseUserData(response.data)
      data = { ...data, token }
      cookie.set('token', data.token, { expires: 30 })
      cookie.set('projectId', data.project.id, { expires: 30 })
      Api.setDefaultHeader('X-Auth-Token', data.token)

      return data
    } catch (err) {
      if (!skipCookie) {
        let user: User = await this.loginScoped(projectId, true)
        return user
      }
      throw err
    }
  }

  async tokenLogin(): Promise<User> {
    let token = cookie.get('token')
    let projectId = cookie.get('projectId')
    if (token) {
      Api.setDefaultHeader('X-Auth-Token', token)
    }

    if (!token || !projectId) {
      return Promise.reject()
    }

    try {
      let response = await Api.send({
        url: servicesUrl.identity,
        headers: { 'X-Subject-Token': token },
      })
      let data = UserModel.parseUserData(response.data)
      data = { ...data, token }
      return data
    } catch (err) {
      cookie.remove('token')
      Api.setDefaultHeader('X-Auth-Token', null)
      throw err
    }
  }

  async switchProject(): Promise<void> {
    let token = cookie.get('unscopedToken')
    if (token) {
      cookie.remove('projectId')
      return
    }
    throw new Error()
  }

  async logout(): Promise<void> {
    let token = cookie.get('token')
    let clear = () => {
      cookie.remove('token')
      window.location.href = '/'
      Api.setDefaultHeader('X-Auth-Token', null)
    }

    try {
      await Api.send({
        url: servicesUrl.identity,
        method: 'DELETE',
        headers: { 'X-Subject-Token': token || '' },
      })
    } catch (err) {
      throw err
    } finally {
      clear()
    }
  }

  async getUserInfo(userId: string): Promise<User> {
    let response = await Api.get(`${servicesUrl.users}/${userId}`)
    return response.data.user
  }

  async getAllUsers(skipLog?: boolean): Promise<User[]> {
    let response = await Api.send({ url: `${servicesUrl.users}`, skipLog })
    let users: User[] = response.data.users
    await utils.waitFor(() => Boolean(configLoader.config))
    users = users.filter(u => !configLoader.config.hiddenUsers.find(hu => hu === u.name))
      .sort((u1, u2) => u1.name.localeCompare(u2.name))
    return users
  }

  async update(userId: string, user: User, oldUser: ?User): Promise<User> {
    const data = { user: {} }
    let oldData = oldUser || {}

    if (user.email || oldData.email) {
      data.user.email = user.email
    }
    if (user.description || oldData.description) {
      data.user.description = user.description
    }
    if (user.enabled != null) {
      data.user.enabled = user.enabled
    }
    if (user.name) {
      data.user.name = user.name
    }
    if (user.password) {
      data.user.password = user.password
    }
    if (user.project_id || oldData.project_id) {
      data.user.project_id = user.project_id
    }

    let response = await Api.send({
      url: `${servicesUrl.users}/${userId}`,
      method: 'PATCH',
      data,
    })
    let updatedUser: User = response.data.user
    if (updatedUser.extra) {
      updatedUser = {
        ...updatedUser,
        ...updatedUser.extra,
      }
    }
    // if project id was updated, assign him to that project, if his not already assigned
    if (data.user.project_id) {
      let projects: Project[] = await this.getProjects(updatedUser.id)
      if (projects.find(p => p.id === data.user.project_id)) {
        return updatedUser
      }

      await this.assignUserToProject(updatedUser.id, updatedUser.project_id || 'undefined')
      return updatedUser
    }

    return updatedUser
  }

  async add(user: User): Promise<User> {
    let data = { user: {} }
    data.user.name = user.name
    data.user.password = user.password || ''
    data.user.enabled = user.enabled == null ? true : user.enabled

    if (user.email) {
      data.user.email = user.email
    }
    if (user.description) {
      data.user.description = user.description
    }
    if (user.project_id) {
      data.user.project_id = user.project_id
    }

    let response = await Api.send({
      url: `${servicesUrl.users}`,
      method: 'POST',
      data,
    })
    let addedUser: User = response.data.user
    if (addedUser.extra) {
      addedUser = {
        ...addedUser,
        ...addedUser.extra,
      }
    }
    // If the user has a project id set, assign him to that project with admin role
    if (addedUser.project_id) {
      await this.assignUserToProject(addedUser.id, addedUser.project_id || 'undefined')
      return addedUser
    }
    return addedUser
  }

  async delete(userId: string): Promise<void> {
    await Api.send({
      url: `${coriolisUrl}identity/users/${userId}`,
      method: 'DELETE',
    })
  }

  async assignUserToProject(userId: string, projectId: string): Promise<void> {
    let roleId: string = await this.getMemberRoleId()
    await this.assignUserToProjectWithRole(userId, projectId, roleId)
  }

  async assignUserToProjectWithRole(userId: string, projectId: string, roleId: string): Promise<void> {
    await Api.send({
      url: `${coriolisUrl}identity/projects/${projectId}/users/${userId}/roles/${roleId}`,
      method: 'PUT',
    })
  }

  async getMemberRoleId(): Promise<string> {
    let roles: { id: string, name: string }[] = await this.getRoles()
    const role = roles.find(r => r.name === '_member_')
    const roleId = role ? role.id : ''
    return roleId
  }

  async getAdminRoleId(): Promise<string> {
    let roles: { id: string, name: string }[] = await this.getRoles()
    const role = roles.find(r => r.name === 'admin')
    const roleId = role ? role.id : ''
    return roleId
  }

  async getRoles(): Promise<Role[]> {
    let response = await Api.get(`${coriolisUrl}identity/roles`)
    let roles: Role[] = response.data.roles
    roles.sort((r1, r2) => r1.name.localeCompare(r2.name))
    return roles
  }

  async getProjects(userId: string): Promise<Project[]> {
    let response = await Api.get(`${coriolisUrl}identity/role_assignments?include_names`)
    let assignments: RoleAssignment[] = response.data.role_assignments
    let projects: $Shape<Project>[] = assignments
      .filter(a => a.user.id === userId)
      .filter((a, i, arr) => arr.findIndex(e => e.scope.project.id === a.scope.project.id) === i)
      .map(a => a.scope.project)

    return projects
  }

  async isAdmin(userId: string): Promise<boolean> {
    let response = await Api.send({
      url: `${coriolisUrl}identity/role_assignments?include_names`,
      quietError: true,
    })
    let roleAssignments: RoleAssignment[] = response.data.role_assignments
    return roleAssignments.filter(a => a.user.id === userId).filter(a => a.role.name === 'admin').length > 0
  }
}

export default new UserSource()
