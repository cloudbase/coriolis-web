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

import type { Project } from '../types/Project'
import ProjectSource from '../sources/ProjectSource'


class ProjectStore {
  @observable projects: Project[] = []
  @observable loading: boolean = false

  @action getProjects(): Promise<void> {
    this.loading = true
    return ProjectSource.getProjects().then((projects: Project[]) => {
      this.loading = false
      this.projects = projects
    }).catch(() => {
      this.loading = false
    })
  }
}

export default new ProjectStore()
