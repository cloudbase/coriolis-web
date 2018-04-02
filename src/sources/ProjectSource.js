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

import { servicesUrl } from '../config'
import type { Project } from '../types/Project'

class ProjectsSource {
  static getProjects(): Promise<Project[]> {
    return new Promise((resolve, reject) => {
      Api.get(servicesUrl.projects).then((response) => {
        if (response.data.projects) {
          resolve(response.data.projects)
        }
      }, reject).catch(reject)
    })
  }
}

export default ProjectsSource
