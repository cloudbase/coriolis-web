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
import type { Instance } from '../types/Instance'

import { servicesUrl, wizardConfig } from '../config'

class InstanceSource {
  static loadInstances(endpointId: string, searchText: ?string, lastInstanceId: ?string, skipLimit?: boolean): Promise<Instance[]> {
    Api.cancelRequests(endpointId)

    let url = `${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpointId}/instances`
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

    return Api.send({ url, cancelId: endpointId }).then(response => {
      return response.data.instances
    })
  }

  static loadInstanceDetails(endpointId: string, instanceName: string, reqId: number): Promise<{ instance: Instance, reqId: number }> {
    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpointId}/instances/${btoa(instanceName)}`,
      cancelId: `instanceDetail-${reqId}`,
    }).then(response => {
      return { instance: response.data.instance, reqId }
    })
  }

  static cancelInstancesDetailsRequests(reqId: number) {
    Api.cancelRequests(`instanceDetail-${reqId}`)
  }
}

export default InstanceSource
