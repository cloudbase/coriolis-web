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

import cookie from 'js-cookie'

import Api from '../utils/ApiCaller'
import configLoader from '../utils/Config'
import type { Credentials, User } from '../@types/User'
import type { Role, Project, RoleAssignment } from '../@types/Project'
import utils from '../utils/ObjectUtils'

class UserModel {
  static parseUserData(data: any) {
    const newData = {
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
    const auth = {
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

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.keystone}/auth/tokens`,
      method: 'POST',
      data: auth,
    })
    const token = response.headers ? response.headers['X-Subject-Token'] || response.headers['x-subject-token'] : ''
    Api.setDefaultHeader('X-Auth-Token', token)
    cookie.set('unscopedToken', token, { expires: 30 })
    return response.data
  }

  async loginScoped(projectId: string, skipCookie?: boolean): Promise<User> {
    const useProjectId = skipCookie ? projectId : cookie.get('projectId') || projectId
    const token = cookie.get('unscopedToken')

    const auth = {
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
      const response = await Api.send({
        url: `${configLoader.config.servicesUrls.keystone}/auth/tokens`,
        method: 'POST',
        data: auth,
      })
      const subjectToken = response.headers ? response.headers['X-Subject-Token'] || response.headers['x-subject-token'] : ''
      let data: User = UserModel.parseUserData(response.data)
      data = { ...data, token: subjectToken }
      cookie.set('token', data.token || '', { expires: 30 })
      cookie.set('projectId', data.project.id, { expires: 30 })
      Api.setDefaultHeader('X-Auth-Token', data.token || '')

      return data
    } catch (err) {
      if (!skipCookie) {
        const user: User = await this.loginScoped(projectId, true)
        return user
      }
      throw err
    }
  }

  async tokenLogin(): Promise<User> {
    const token = cookie.get('token') || ''
    if (token) {
      Api.setDefaultHeader('X-Auth-Token', token)
    }

    try {
      const response = await Api.send({
        url: `${configLoader.config.servicesUrls.keystone}/auth/tokens`,
        headers: { 'X-Subject-Token': token },
      })
      let data: User = UserModel.parseUserData(response.data)
      data = { ...data, token }
      return data
    } catch (err) {
      cookie.remove('token')
      Api.setDefaultHeader('X-Auth-Token', null)
      throw err
    }
  }

  async switchProject(): Promise<void> {
    const token = cookie.get('unscopedToken')
    if (token) {
      cookie.remove('projectId')
      return
    }
    throw new Error()
  }

  async logout(): Promise<void> {
    const token = cookie.get('token')
    const clear = () => {
      cookie.remove('token')
      window.location.href = '/login'
      Api.setDefaultHeader('X-Auth-Token', null)
    }

    try {
      await Api.send({
        url: `${configLoader.config.servicesUrls.keystone}/auth/tokens`,
        method: 'DELETE',
        headers: { 'X-Subject-Token': token || '' },
      })
    } finally {
      clear()
    }
  }

  async getUserInfo(userId: string): Promise<User> {
    const response = await Api.get(`${configLoader.config.servicesUrls.keystone}/users/${userId}`)
    return response.data.user
  }

  async getAllUsers(skipLog?: boolean, quietError?: boolean): Promise<User[]> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.keystone}/users`,
      skipLog,
      quietError,
    })
    let users: User[] = response.data.users
    await utils.waitFor(() => Boolean(configLoader.config))
    users = users.filter(u => !configLoader.config.hiddenUsers.find(hu => hu === u.name))
      .sort((u1, u2) => u1.name.localeCompare(u2.name))
    return users
  }

  async update(userId: string, user: Partial<User>, oldUser: User | null): Promise<User> {
    const data: any = { user: {} }
    const oldData: any = oldUser || {}

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

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.keystone}/users/${userId}`,
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
      const projects: Project[] = await this.getProjects(updatedUser.id)
      if (projects.find(p => p.id === data.user.project_id)) {
        return updatedUser
      }

      await this.assignUserToProject(updatedUser.id, updatedUser.project_id || 'undefined')
      return updatedUser
    }

    return updatedUser
  }

  async add(user: User): Promise<User> {
    const data: any = { user: {} }
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

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.keystone}/users`,
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
      url: `${configLoader.config.servicesUrls.keystone}/users/${userId}`,
      method: 'DELETE',
    })
  }

  async assignUserToProject(userId: string, projectId: string): Promise<void> {
    const roleId: string = await this.getMemberRoleId()
    await this.assignUserToProjectWithRole(userId, projectId, roleId)
  }

  async assignUserToProjectWithRole(userId: string, projectId: string, roleId: string): Promise<void> {
    await Api.send({
      url: `${configLoader.config.servicesUrls.keystone}/projects/${projectId}/users/${userId}/roles/${roleId}`,
      method: 'PUT',
    })
  }

  async getMemberRoleId(): Promise<string> {
    const roles: { id: string, name: string }[] = await this.getRoles()
    const role = roles.find(r => r.name === '_member_')
    const roleId = role ? role.id : ''
    return roleId
  }

  async getAdminRoleId(): Promise<string> {
    const roles: { id: string, name: string }[] = await this.getRoles()
    const role = roles.find(r => r.name.toLowerCase() === configLoader.config.adminRoleName)
    const roleId = role ? role.id : ''
    return roleId
  }

  async getRoles(): Promise<Role[]> {
    const response = await Api.get(`${configLoader.config.servicesUrls.keystone}/roles`)
    const roles: Role[] = response.data.roles
    roles.sort((r1, r2) => r1.name.localeCompare(r2.name))
    return roles
  }

  async getProjects(userId: string): Promise<Project[]> {
    const response = await Api.get(`${configLoader.config.servicesUrls.keystone}/role_assignments?include_names`)
    const assignments: RoleAssignment[] = response.data.role_assignments
    const projects: Project[] = assignments
      .filter(a => a.user.id === userId)
      .filter((a, i, arr) => arr
        .findIndex(e => e.scope.project
          && a.scope.project && e.scope.project.id === a.scope.project.id) === i)
      .map(a => a.scope.project)
      .filter(utils.notEmpty)

    return projects
  }

  async isAdmin(userId: string): Promise<boolean> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.keystone}/role_assignments?include_names`,
      quietError: true,
    })

    const roleAssignments: RoleAssignment[] = response.data.role_assignments
    return roleAssignments
      .filter(a => a && a.user && a.user.id === userId)
      .filter(a => a && a.role && a.role.name
        && a.role.name.toLowerCase() === configLoader.config.adminRoleName)
      .length > 0
  }
}

export default new UserSource()
