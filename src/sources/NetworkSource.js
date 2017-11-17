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

import { servicesUrl } from '../config'

class NetworkSource {
  static loadNetworks(enpointId, environment) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
      let url = `${servicesUrl.coriolis}/${projectId}/endpoints/${enpointId}/networks`
      if (environment) {
        url = `${url}?env=${btoa(JSON.stringify(environment))}`
      }

      Api.sendAjaxRequest({
        url,
        method: 'GET',
      }).then(response => {
        let networks = response.data.networks
        networks.sort((a, b) => a.name.localeCompare(b.name))
        resolve(response.data.networks)
      }, reject).catch(reject)
    })
  }
}

export default NetworkSource
