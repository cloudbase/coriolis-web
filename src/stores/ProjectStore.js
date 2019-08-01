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
import type { Project, RoleAssignment, Role } from '../types/Project'
import type { User } from '../types/User'

import ProjectSource from '../sources/ProjectSource'
import userStore from '../stores/UserStore'

class ProjectStore {
  @observable projects: Project[] = []
  @observable loading: boolean = false
  @observable roleAssignments: RoleAssignment[] = []
  @observable roles: Role[] = []
  @observable projectDetails: ?Project = null
  @observable users: User[] = []
  @observable usersLoading: boolean = false
  @observable updating: boolean = false

  @action getProjects(options?: { showLoading?: boolean, skipLog?: boolean }): Promise<void> {
    if (options && options.showLoading) this.loading = true
    return ProjectSource.getProjects(options && options.skipLog).then((projects: Project[]) => {
      this.loading = false
      this.projects = projects
    }).catch(() => {
      this.loading = false
    })
  }

  @action getRoleAssignments(options?: { skipLog?: boolean }): Promise<void> {
    return ProjectSource.getRoleAssignments(options && options.skipLog).then((assignments: RoleAssignment[]) => {
      this.roleAssignments = assignments
    })
  }

  @action getRoles(): Promise<void> {
    return ProjectSource.getRoles().then((roles: Role[]) => {
      this.roles = roles
    })
  }

  @action getProjectDetails(projectId: string): Promise<void> {
    this.loading = true
    return ProjectSource.getProjectDetails(projectId).then((project: Project) => {
      this.projectDetails = project
      this.loading = false
    }).catch(() => {
      this.loading = false
    })
  }

  @action getUsers(projectId: string, showLoading?: boolean): Promise<void> {
    if (showLoading) this.usersLoading = true
    return ProjectSource.getUsers(projectId).then((users: User[]) => {
      this.usersLoading = false
      this.users = users
    }).catch(() => {
      this.usersLoading = false
    })
  }

  @action clearProjectDetails() {
    this.projectDetails = null
    this.users = []
  }

  @action removeUser(projectId: string, userId: string, roleIds: string[]): Promise<void> {
    return ProjectSource.removeUser(projectId, userId, roleIds).then(() => {
      this.users = this.users.filter(u => u.id !== userId)
    })
  }

  @action assignUserRole(projectId: string, userId: string, roleId: string): Promise<void> {
    return ProjectSource.assignUser(projectId, userId, roleId)
  }

  @action removeUserRole(projectId: string, userId: string, roleId: string): Promise<void> {
    return ProjectSource.removeUser(projectId, userId, [roleId])
  }

  @action update(projectId: string, project: Project): Promise<void> {
    this.updating = true
    return ProjectSource.update(projectId, project).then((project: Project) => {
      this.projectDetails = project
      this.updating = false
    }).catch(() => {
      this.updating = false
    })
  }

  @action delete(projectId: string): Promise<void> {
    return ProjectSource.delete(projectId)
  }

  @action add(project: Project): Promise<void> {
    this.updating = true
    let userId = userStore.loggedUser ? userStore.loggedUser.id : 'undefined'
    return ProjectSource.add(project, userId).then((addedProject: Project) => {
      if (!this.projects.find(p => p.id === addedProject.id)) {
        let projects = this.projects
        projects = [
          ...projects,
          addedProject,
        ]
        projects.sort((a, b) => a.name.localeCompare(b.name))
        this.projects = [...projects]
      }
      this.updating = false
    }).catch(() => {
      this.updating = false
    })
  }
}

export default new ProjectStore()
