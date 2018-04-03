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

import cookie from 'js-cookie'

import Api from '../utils/ApiCaller'
import type { Instance } from '../types/Instance'

import { servicesUrl, wizardConfig } from '../config'

class InstanceSource {
  static endpointId: string

  static loadInstances(endpointId: string, searchText: ?string, lastInstanceId: ?string, skipLimit?: boolean): Promise<Instance[]> {
    this.endpointId = endpointId

    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
      let url = `${servicesUrl.coriolis}/${projectId || 'null'}/endpoints/${endpointId}/instances`
      let symbol = '?'

      if (!skipLimit) {
        url = `${url + symbol}limit=${wizardConfig.instancesItemsPerPage + 1}`
        symbol = '&'
      }

      if (searchText) {
        url = `${url + symbol}name=${searchText}`
        symbol = '&'
      }

      if (lastInstanceId) {
        url = `${url + symbol}&marker=${lastInstanceId}`
      }

      Api.get(url).then(response => {
        if (this.endpointId === endpointId) {
          resolve(response.data.instances)
        }
      }).catch(reject)
    })
  }

  static loadInstanceDetails(endpointId: string, instanceName: string, reqId: number): Promise<{ instance: Instance, reqId: number }> {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId') || 'undefined'

      Api.send({
        url: `${servicesUrl.coriolis}/${projectId}/endpoints/${endpointId}/instances/${btoa(instanceName)}`,
        cancelId: `instanceDetail-${reqId}`,
      }).then(response => {
        resolve({ instance: response.data.instance, reqId })
      }, response => { reject({ response, reqId }) }).catch(reject)
    })
  }

  static cancelInstancesDetailsRequests(reqId: number) {
    Api.cancelRequests(`instanceDetail-${reqId}`)
  }
}

export default InstanceSource
