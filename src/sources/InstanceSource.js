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

import { servicesUrl, wizardConfig } from '../config'

class InstanceSource {
  static loadInstances(endpointId, searchText, lastInstanceId) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
      let url = `${servicesUrl.coriolis}/${projectId}/endpoints/${endpointId}/instances?limit=${wizardConfig.instancesItemsPerPage + 1}`

      if (searchText) {
        url = `${url}&name=${searchText}`
      }

      if (lastInstanceId) {
        url = `${url}&marker=${lastInstanceId}`
      }

      Api.sendAjaxRequest({
        url,
        method: 'GET',
      }).then(response => {
        resolve(response.data.instances)
      }, reject).catch(reject)
    })
  }

  static loadInstanceDetails(endpointId, instanceName) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/endpoints/${endpointId}/instances/${btoa(instanceName)}`,
        method: 'GET',
      }).then(response => {
        resolve(response.data.instance)
      }, reject).catch(reject)
    })
  }
}

export default InstanceSource
