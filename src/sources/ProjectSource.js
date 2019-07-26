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
  static getProjects(skipLog?: boolean): Promise<Project[]> {
    return Api.send({
      url: servicesUrl.projects,
      skipLog,
    }).then((response) => {
      if (response.data.projects) {
        let projects: Project[] = response.data.projects
        projects.sort((a, b) => a.name.localeCompare(b.name))
        return projects
      }
      return []
    })
  }

  static getProjectDetails(projectId: string): Promise<Project> {
    return Api.get(`${coriolisUrl}identity/projects/${projectId}`).then(response => {
      return response.data.project
    })
  }

  static getRoleAssignments(skipLog?: boolean): Promise<RoleAssignment[]> {
    return Api.send({
      url: `${coriolisUrl}identity/role_assignments?include_names`,
      skipLog,
    }).then(response => {
      let assignments: RoleAssignment[] = response.data.role_assignments
      assignments.sort((a1, a2) => a1.role.name.localeCompare(a2.role.name))
      return assignments
    })
  }

  static getUsers(projectId: string): Promise<User[]> {
    return this.getRoleAssignments().then(assignments => {
      const userIds: string[] = assignments
        .filter(a => a.scope.project.id === projectId)
        .filter((a, i, arr) => arr.findIndex(e => a.user.id === e.user.id) === i)
        .map(a => a.user.id)
      return Promise.all(userIds.map(id => {
        return UserSource.getUserInfo(id)
      })).then((users: User[]) => {
        users.sort((a, b) => a.name.localeCompare(b.name))
        return users
      })
    })
  }

  static removeUser(projectId: string, userId: string, roleIds: string[]): Promise<void> {
    return Promise.all(roleIds.map(id => {
      return Api.send({
        url: `${coriolisUrl}identity/projects/${projectId}/users/${userId}/roles/${id}`,
        method: 'DELETE',
      })
    })).then(() => { })
  }

  static assignUser(projectId: string, userId: string, roleId: string): Promise<void> {
    return Api.send({
      url: `${coriolisUrl}identity/projects/${projectId}/users/${userId}/roles/${roleId}`,
      method: 'PUT',
    }).then(() => { })
  }

  static getRoles(): Promise<Role[]> {
    return UserSource.getRoles()
  }

  static update(projectId: string, project: Project): Promise<Project> {
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

    return Api.send({
      url: `${coriolisUrl}identity/projects/${projectId}`,
      method: 'PATCH',
      data,
    }).then(response => response.data.project)
  }

  static delete(projectId: string): Promise<void> {
    return Api.send({
      url: `${coriolisUrl}identity/projects/${projectId}`,
      method: 'DELETE',
    }).then(() => { })
  }

  static add(project: Project, userId: string): Promise<Project> {
    let data = { project: {} }

    data.project.name = project.name
    if (project.enabled != null) {
      data.project.enabled = project.enabled
    }
    if (project.description != null) {
      data.project.description = project.description
    }
    let addedProject: Project
    return Api.send({
      url: `${coriolisUrl}identity/projects/`,
      method: 'POST',
      data,
    }).then(response => {
      addedProject = response.data.project
      return UserSource.getAdminRoleId()
    }).then(adminRoleId => {
      return UserSource.assignUserToProjectWithRole(userId, addedProject.id, adminRoleId)
    }).then(() => {
      return addedProject
    })
  }
}

export default ProjectsSource
