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

import Api from '../utils/ApiCaller'

import UserSource from './UserSource'
import { servicesUrl, coriolisUrl } from '../constants'
import type { Project, Role, RoleAssignment } from '../types/Project'
import type { User } from '../types/User'

class ProjectsSource {
  async getProjects(skipLog?: boolean): Promise<Project[]> {
    let response = await Api.send({
      url: servicesUrl.projects,
      skipLog,
    })
    if (response.data.projects) {
      let projects: Project[] = response.data.projects
      projects.sort((a, b) => a.name.localeCompare(b.name))
      return projects
    }
    return []
  }

  async getProjectDetails(projectId: string): Promise<Project> {
    let response = await Api.get(`${coriolisUrl}identity/projects/${projectId}`)
    return response.data.project
  }

  async getRoleAssignments(skipLog?: boolean): Promise<RoleAssignment[]> {
    let response = await Api.send({
      url: `${coriolisUrl}identity/role_assignments?include_names`,
      skipLog,
    })
    let assignments: RoleAssignment[] = response.data.role_assignments
    assignments.sort((a1, a2) => a1.role.name.localeCompare(a2.role.name))
    return assignments
  }

  async getUsers(projectId: string): Promise<User[]> {
    let assignments = await this.getRoleAssignments()
    const userIds: string[] = assignments
      .filter(a => a.scope.project && a.scope.project.id === projectId)
      .filter((a, i, arr) => arr.findIndex(e => a.user.id === e.user.id) === i)
      .map(a => a.user.id)
    let users: User[] = await Promise.all(userIds.map(async id => {
      let user: User = await UserSource.getUserInfo(id)
      return user
    }))
    users.sort((a, b) => a.name.localeCompare(b.name))
    return users
  }

  async removeUser(projectId: string, userId: string, roleIds: string[]): Promise<void> {
    await Promise.all(roleIds.map(async id => {
      await Api.send({
        url: `${coriolisUrl}identity/projects/${projectId}/users/${userId}/roles/${id}`,
        method: 'DELETE',
      })
    }))
  }

  async assignUser(projectId: string, userId: string, roleId: string): Promise<void> {
    await Api.send({
      url: `${coriolisUrl}identity/projects/${projectId}/users/${userId}/roles/${roleId}`,
      method: 'PUT',
    })
  }

  async getRoles(): Promise<Role[]> {
    let roles: Role[] = await UserSource.getRoles()
    return roles
  }

  async update(projectId: string, project: Project): Promise<Project> {
    let data = { project: {} }
    if (project.name != null) {
      data.project.name = project.name
    }
    if (project.description != null) {
      data.project.description = project.description
    }
    if (project.description != null) {
      data.project.enabled = project.enabled
    }

    let response = await Api.send({
      url: `${coriolisUrl}identity/projects/${projectId}`,
      method: 'PATCH',
      data,
    })
    return response.data.project
  }

  async delete(projectId: string): Promise<void> {
    await Api.send({
      url: `${coriolisUrl}identity/projects/${projectId}`,
      method: 'DELETE',
    })
  }

  async add(project: Project, userId: string): Promise<Project> {
    let data = { project: {} }

    data.project.name = project.name
    if (project.enabled != null) {
      data.project.enabled = project.enabled
    }
    if (project.description != null) {
      data.project.description = project.description
    }
    let response = await Api.send({
      url: `${coriolisUrl}identity/projects/`,
      method: 'POST',
      data,
    })
    let addedProject: Project = response.data.project
    let adminRoleId: string = await UserSource.getAdminRoleId()
    await UserSource.assignUserToProjectWithRole(userId, addedProject.id, adminRoleId)
    return addedProject
  }
}

export default new ProjectsSource()
