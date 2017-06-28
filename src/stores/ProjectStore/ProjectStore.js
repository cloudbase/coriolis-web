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


import Reflux from 'reflux';
import UserActions from '../../actions/UserActions';
import ProjectActions from '../../actions/ProjectActions'
import ConnectionsActions from '../../actions/ConnectionsActions'
import MigrationActions from '../../actions/MigrationActions'
import ConnectionsStore from '../../stores/ConnectionsStore'
import Location from '../../core/Location';
import Api from '../../components/ApiCaller';
import cookie from 'react-cookie';
import {servicesUrl} from '../../config'

class ProjectStore extends Reflux.Store
{

  constructor() {
    super()
    this.listenables = ProjectActions

    this.state = {
      currentProject: null,
      projects: []
    }

    ProjectActions.loadProjects()
  }

  onLoadProjectsCompleted(response) {
    console.log("onLoadProjectsCompleted", response)
    this.setState({
      projects: response.data.projects
    })
  }
}

ProjectStore.id = "projectStore"

export default ProjectStore;
