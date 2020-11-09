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

import Api from '../utils/ApiCaller'
import type { Instance } from '../@types/Instance'

import configLoader from '../utils/Config'

import { InstanceInfoPlugin } from '../plugins/endpoint'
import { ProviderTypes } from '../@types/Providers'
import DomUtils from '../utils/DomUtils'

class InstanceSource {
  async loadInstancesChunk(
    endpointId: string,
    chunkSize: number,
    lastInstanceId?: string,
    cancelId?: string,
    searchText?: string,
    env?: any,
    cache?: boolean,
  ): Promise<Instance[]> {
    let url = `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${endpointId}/instances`
    let queryParams: { [prop: string]: string | number } = {}

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
        env: DomUtils.encodeToBase64Url(env),
      }
    }

    const keys = Object.keys(queryParams)
    url = `${url}${keys.length > 0 ? '?' : ''}${keys.map(p => `${p}=${queryParams[p]}`).join('&')}`

    const response = await Api.send({ url, cancelId, cache })
    return response.data.instances
  }

  async loadInstances(endpointId: string, cache?: boolean | null): Promise<Instance[]> {
    Api.cancelRequests(endpointId)
    const url = `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${endpointId}/instances`
    const response = await Api.send({ url, cancelId: endpointId, cache })
    return response.data.instances
  }

  async loadInstanceDetails(opts: {
    endpointId: string,
    instanceId: string,
    targetProvider?: ProviderTypes | null,
    reqId: number,
    quietError?: boolean,
    env?: any,
    cache?: boolean | null,
    skipLog?: boolean | null,
  }): Promise<{ instance?: Instance, reqId: number }> {
    const {
      endpointId, instanceId, targetProvider, reqId, quietError, env, cache, skipLog,
    } = opts
    let url = `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${endpointId}/instances/${DomUtils.encodeToBase64Url(instanceId)}`
    if (env) {
      url += `?env=${DomUtils.encodeToBase64Url(env)}`
    }
    const response = await Api.send({
      url,
      cancelId: `instanceDetail-${reqId}`,
      quietError,
      cache,
      skipLog,
    })

    const instanceInfoParser = targetProvider && InstanceInfoPlugin.for(targetProvider)
    const instance = instanceInfoParser?.parseInstance(response.data.instance)

    return { instance, reqId }
  }

  cancelInstancesDetailsRequests(reqId: number) {
    Api.cancelRequests(`instanceDetail-${reqId}`)
  }
}

export default new InstanceSource()
