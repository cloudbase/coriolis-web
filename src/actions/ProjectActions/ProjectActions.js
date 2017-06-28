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
import Api from '../../components/ApiCaller';
import {servicesUrl, defaultDomain} from '../../config';
import Location from '../../core/Location';

let ProjectActions = Reflux.createActions({
  'loadProjects': { children: ["completed", "failed"] },
  'setCurrentProject': {}
})
/*
ProjectActions.login.listen((userData => {
  let auth = {
    "auth": {
      "identity": {
        "methods": [
          "password"
        ],
        "password": {
          "user": {
            "name": userData.name,
            "domain": {
              "name": userData.domain ? userData.domain : defaultDomain
            },
            "password": userData.password
          }
        }
      },
      scope: {
        project: {
          domain: {
            name: userData.domain ? userData.domain : defaultDomain
          },
          name: userData.name
        }
      }
    }
  }

  Api.setDefaultHeader({ "X-Auth-Token": null })

  Api.sendAjaxRequest({
    url: servicesUrl.identity,
    method: "POST",
    data: auth
  })
    .then((response) => {
      UserAction.login.success(response)
      Location.push('/migrations')
    }, UserAction.login.failed)
    .catch(UserAction.login.failed)
}))*/

ProjectActions.loadProjects.listen(() => {
  Api.sendAjaxRequest({
      url: servicesUrl.projects,
      method: "GET"
    })
    .then((response) => {
      ProjectActions.loadProjects.completed(response)
    }, ProjectActions.loadProjects.failed)
    .catch((response) => {
      ProjectActions.loadProjects.failed(response)
    });
})
export default ProjectActions;
