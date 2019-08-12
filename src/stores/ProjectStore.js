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

import { observable, action, runInAction } from 'mobx'
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

  @action async getProjects(options?: { showLoading?: boolean, skipLog?: boolean }) {
    if (options && options.showLoading) this.loading = true
    try {
      let projects = await ProjectSource.getProjects(options && options.skipLog)
      runInAction(() => {
        this.loading = false
        this.projects = projects
      })
    } catch (e) {
      runInAction(() => { this.loading = false })
    }
  }

  @action async getRoleAssignments(options?: { skipLog?: boolean }) {
    let assignments = await ProjectSource.getRoleAssignments(options && options.skipLog)
    runInAction(() => {
      this.roleAssignments = assignments
    })
  }

  @action async getRoles() {
    let roles = await ProjectSource.getRoles()
    runInAction(() => { this.roles = roles })
  }

  @action async getProjectDetails(projectId: string) {
    this.loading = true
    try {
      let project = await ProjectSource.getProjectDetails(projectId)
      runInAction(() => {
        this.projectDetails = project
        this.loading = false
      })
    } catch (e) {
      runInAction(() => { this.loading = false })
    }
  }

  @action async getUsers(projectId: string, showLoading?: boolean) {
    if (showLoading) this.usersLoading = true
    try {
      let users = await ProjectSource.getUsers(projectId)
      runInAction(() => {
        this.usersLoading = false
        this.users = users
      })
    } catch (e) {
      runInAction(() => { this.usersLoading = false })
    }
  }

  @action clearProjectDetails() {
    this.projectDetails = null
    this.users = []
  }

  @action async removeUser(projectId: string, userId: string, roleIds: string[]) {
    await ProjectSource.removeUser(projectId, userId, roleIds)
    runInAction(() => { this.users = this.users.filter(u => u.id !== userId) })
  }

  @action async assignUserRole(projectId: string, userId: string, roleId: string) {
    await ProjectSource.assignUser(projectId, userId, roleId)
  }

  @action async removeUserRole(projectId: string, userId: string, roleId: string) {
    await ProjectSource.removeUser(projectId, userId, [roleId])
  }

  @action async update(projectId: string, project: Project) {
    this.updating = true
    try {
      let updatedProject = await ProjectSource.update(projectId, project)
      runInAction(() => {
        this.projectDetails = updatedProject
        this.updating = false
      })
    } catch (e) {
      runInAction(() => { this.updating = false })
    }
  }

  @action async delete(projectId: string) {
    await ProjectSource.delete(projectId)
  }

  @action async add(project: Project) {
    this.updating = true
    let userId = userStore.loggedUser ? userStore.loggedUser.id : 'undefined'
    try {
      let addedProject = await ProjectSource.add(project, userId)
      runInAction(() => {
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
      })
    } catch (e) {
      runInAction(() => { this.updating = false })
    }
  }
}

export default new ProjectStore()
