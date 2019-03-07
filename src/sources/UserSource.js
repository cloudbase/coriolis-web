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
import { servicesUrl, coriolisUrl, defaultUserDomain } from '../config'
import type { Credentials, User } from '../types/User'
import type { Role, Project, RoleAssignment } from '../types/Project'

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
  static saveDomainName(domainName: string) {
    localStorage.setItem('userDomainName', domainName)
  }

  static getDomainName(): string {
    return localStorage.getItem('userDomainName') || defaultUserDomain
  }

  static login(userData: Credentials): Promise<User> {
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

    return Api.send({
      url: servicesUrl.identity,
      method: 'POST',
      data: auth,
    }).then(response => {
      let token = response.headers ? response.headers['X-Subject-Token'] || response.headers['x-subject-token'] : ''
      Api.setDefaultHeader('X-Auth-Token', token)
      cookie.set('unscopedToken', token, { expires: 30 })
      return response.data
    })
  }

  static loginScoped(projectId: string, skipCookie?: boolean): Promise<User> {
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

    return Api.send({
      url: servicesUrl.identity,
      method: 'POST',
      data: auth,
    }).then(response => {
      let token = response.headers ? response.headers['X-Subject-Token'] || response.headers['x-subject-token'] : ''
      let data = UserModel.parseUserData(response.data)
      data = { ...data, token }
      cookie.set('token', data.token, { expires: 30 })
      cookie.set('projectId', data.project.id, { expires: 30 })
      Api.setDefaultHeader('X-Auth-Token', data.token)

      return data
    }).catch(response => {
      if (!skipCookie) {
        return UserSource.loginScoped(projectId, true)
      }
      return Promise.reject(response)
    })
  }

  static tokenLogin(): Promise<User> {
    let token = cookie.get('token')
    let projectId = cookie.get('projectId')
    if (token) {
      Api.setDefaultHeader('X-Auth-Token', token)
    }

    if (!token || !projectId) {
      return Promise.reject()
    }

    return Api.send({
      url: servicesUrl.identity,
      headers: { 'X-Subject-Token': token },
    }).then(response => {
      let data = UserModel.parseUserData(response.data)
      data = { ...data, token }
      return data
    }).catch(() => {
      cookie.remove('token')
      Api.setDefaultHeader('X-Auth-Token', null)
      return Promise.reject()
    })
  }

  static switchProject(): Promise<void> {
    let token = cookie.get('unscopedToken')
    if (token) {
      cookie.remove('projectId')
      return Promise.resolve()
    }
    return Promise.reject()
  }

  static logout(): Promise<void> {
    let token = cookie.get('token')
    let clear = () => {
      cookie.remove('token')
      window.location.href = '/'
      Api.setDefaultHeader('X-Auth-Token', null)
    }

    return Api.send({
      url: servicesUrl.identity,
      method: 'DELETE',
      headers: { 'X-Subject-Token': token || '' },
    }).then(() => {
      clear()
    }).catch(() => {
      clear()
      return Promise.reject()
    })
  }

  static getUserInfo(userId: string): Promise<User> {
    return Api.get(`${servicesUrl.users}/${userId}`).then(response => response.data.user)
  }

  static getAllUsers(): Promise<User[]> {
    return Api.get(`${servicesUrl.users}`)
      .then(response => response.data.users.sort((u1, u2) => u1.name.localeCompare(u2.name)))
  }

  static update(userId: string, user: User, oldUser: ?User): Promise<User> {
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
    let updatedUser: User

    return Api.send({
      url: `${servicesUrl.users}/${userId}`,
      method: 'PATCH',
      data,
    }).then(response => {
      updatedUser = response.data.user
      if (updatedUser.extra) {
        updatedUser = {
          ...updatedUser,
          ...updatedUser.extra,
        }
      }
      return updatedUser
    }).then(() => {
      // if project id was updated, assign him to that project, if his not already assigned
      if (data.user.project_id) {
        return this.getProjects(updatedUser.id).then((projects: Project[]) => {
          if (projects.find(p => p.id === data.user.project_id)) {
            return updatedUser
          }

          return this.assignUserToProject(updatedUser.id, updatedUser.project_id || 'undefined').then(() => {
            return updatedUser
          })
        })
      }

      return updatedUser
    })
  }

  static add(user: User): Promise<User> {
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
    let addedUser: User
    return Api.send({
      url: `${servicesUrl.users}`,
      method: 'POST',
      data,
    }).then(response => {
      addedUser = response.data.user
      if (addedUser.extra) {
        addedUser = {
          ...addedUser,
          ...addedUser.extra,
        }
      }
      return addedUser
    }).then(() => {
      // If the user has a project id set, assign him to that project with admin role
      if (addedUser.project_id) {
        return this.assignUserToProject(addedUser.id, addedUser.project_id || 'undefined').then(() => {
          return addedUser
        })
      }
      return addedUser
    })
  }

  static delete(userId: string): Promise<void> {
    return Api.send({
      url: `${coriolisUrl}identity/users/${userId}`,
      method: 'DELETE',
    }).then(() => { })
  }

  static assignUserToProject(userId: string, projectId: string): Promise<void> {
    return this.getMemberRoleId().then((roleId: string) => {
      return this.assignUserToProjectWithRole(userId, projectId, roleId)
    })
  }

  static assignUserToProjectWithRole(userId: string, projectId: string, roleId: string): Promise<void> {
    return Api.send({
      url: `${coriolisUrl}identity/projects/${projectId}/users/${userId}/roles/${roleId}`,
      method: 'PUT',
    }).then(() => { })
  }

  static getMemberRoleId(): Promise<string> {
    return this.getRoles().then((roles: { id: string, name: string }[]) => {
      const role = roles.find(r => r.name === '_member_')
      const roleId = role ? role.id : ''
      return roleId
    })
  }

  static getAdminRoleId(): Promise<string> {
    return this.getRoles().then((roles: { id: string, name: string }[]) => {
      const role = roles.find(r => r.name === 'admin')
      const roleId = role ? role.id : ''
      return roleId
    })
  }

  static getRoles(): Promise<Role[]> {
    return Api.get(`${coriolisUrl}identity/roles`).then(response => {
      let roles: Role[] = response.data.roles
      roles.sort((r1, r2) => r1.name.localeCompare(r2.name))
      return roles
    })
  }

  static getProjects(userId: string): Promise<Project[]> {
    return Api.get(`${coriolisUrl}identity/role_assignments?include_names`).then(response => {
      let assignments: RoleAssignment[] = response.data.role_assignments
      let projects: $Shape<Project>[] = assignments
        .filter(a => a.user.id === userId)
        .filter((a, i, arr) => arr.findIndex(e => e.scope.project.id === a.scope.project.id) === i)
        .map(a => a.scope.project)

      return projects
    })
  }

  static isAdmin(userId: string): Promise<boolean> {
    return Api.send({
      url: `${coriolisUrl}identity/role_assignments?include_names`,
      quietError: true,
    }).then(response => {
      let roleAssignments: RoleAssignment[] = response.data.role_assignments
      return roleAssignments.filter(a => a.user.id === userId).filter(a => a.role.name === 'admin').length > 0
    })
  }
}

export default UserSource
