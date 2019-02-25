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

import { servicesUrl } from '../config'

class InstanceSource {
  static loadInstancesChunk(
    endpointId: string,
    chunkSize: number,
    lastInstanceId?: string,
    cancelId?: string,
    searchText?: string
  ): Promise<Instance[]> {
    let url = `${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpointId}/instances`
    let queryParams: { [string]: string | number } = {}

    if (chunkSize !== Infinity) {
      queryParams = {
        limit: chunkSize,
      }

      if (lastInstanceId) {
        queryParams = {
          ...queryParams,
          marker: lastInstanceId,
        }
      }
    }

    if (searchText) {
      queryParams = {
        ...queryParams,
        name: searchText,
      }
    }

    let keys = Object.keys(queryParams)
    url = `${url}${keys.length > 0 ? '?' : ''}${keys.map(p => `${p}=${queryParams[p]}`).join('&')}`

    return Api.send({ url, cancelId }).then(response => {
      return response.data.instances
    })
  }

  static loadInstances(endpointId: string): Promise<Instance[]> {
    Api.cancelRequests(endpointId)
    let url = `${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpointId}/instances`
    return Api.send({ url, cancelId: endpointId }).then(response => {
      return response.data.instances
    })
  }

  static loadInstanceDetails(endpointId: string, instanceName: string, reqId: number, quietError?: boolean): Promise<{ instance: Instance, reqId: number }> {
    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpointId}/instances/${btoa(instanceName)}`,
      cancelId: `instanceDetail-${reqId}`,
      quietError,
    }).then(response => {
      return { instance: response.data.instance, reqId }
    })
  }

  static cancelInstancesDetailsRequests(reqId: number) {
    Api.cancelRequests(`instanceDetail-${reqId}`)
  }
}

export default InstanceSource
