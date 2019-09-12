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

import { servicesUrl } from '../constants'

class InstanceSource {
  async loadInstancesChunk(
    endpointId: string,
    chunkSize: number,
    lastInstanceId?: string,
    cancelId?: string,
    searchText?: string,
    env?: any,
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

    if (env) {
      queryParams = {
        ...queryParams,
        env: btoa(JSON.stringify(env)),
      }
    }

    let keys = Object.keys(queryParams)
    url = `${url}${keys.length > 0 ? '?' : ''}${keys.map(p => `${p}=${queryParams[p]}`).join('&')}`

    let response = await Api.send({ url, cancelId })
    return response.data.instances
  }

  async loadInstances(endpointId: string): Promise<Instance[]> {
    Api.cancelRequests(endpointId)
    let url = `${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpointId}/instances`
    let response = await Api.send({ url, cancelId: endpointId })
    return response.data.instances
  }

  async loadInstanceDetails(
    endpointId: string,
    instanceName: string,
    reqId: number,
    quietError?: boolean,
    env?: any
  ): Promise<{ instance: Instance, reqId: number }> {
    let url = `${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpointId}/instances/${btoa(instanceName)}`
    if (env) {
      url += `?env=${btoa(JSON.stringify(env))}`
    }
    let response = await Api.send({
      url,
      cancelId: `instanceDetail-${reqId}`,
      quietError,
    })
    return { instance: response.data.instance, reqId }
  }

  cancelInstancesDetailsRequests(reqId: number) {
    Api.cancelRequests(`instanceDetail-${reqId}`)
  }
}

export default new InstanceSource()
