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

import moment from 'moment'

import Api from '../utils/ApiCaller'
import notificationStore from '../stores/NotificationStore'
import { SchemaParser } from './Schemas'
import ObjectUtils from '../utils/ObjectUtils'
import type { Endpoint, Validation, Storage } from '../types/Endpoint'

import configLoader from '../utils/Config'

let getBarbicanPayload = data => {
  return {
    payload: JSON.stringify(data),
    payload_content_type: 'text/plain',
    algorithm: 'aes',
    bit_length: 256,
    mode: 'cbc',
    content_types: {
      default: 'text/plain',
    },
  }
}

class EndpointSource {
  async getEndpoints(skipLog?: boolean): Promise<Endpoint[]> {
    let response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints`,
      skipLog,
    })
    let connections = []
    if (response.data.endpoints.length) {
      response.data.endpoints.forEach(endpoint => {
        connections.push(SchemaParser.parseConnectionResponse(endpoint))
      })
    }

    connections.sort((c1, c2) => moment(c2.created_at).diff(moment(c1.created_at)))
    return connections
  }

  async delete(endpoint: Endpoint): Promise<string> {
    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${endpoint.id}`,
      method: 'DELETE',
    })
    if (endpoint.connection_info && endpoint.connection_info.secret_ref) {
      let uuidIndex = endpoint.connection_info.secret_ref.lastIndexOf('/')
      // $FlowIssue
      let uuid = endpoint.connection_info.secret_ref.substr(uuidIndex + 1)
      await Api.send({
        url: `${configLoader.config.servicesUrls.barbican}/v1/secrets/${uuid}`,
        method: 'DELETE',
      })
      return endpoint.id
    }
    return endpoint.id
  }

  async getConnectionInfo(endpoint: Endpoint): Promise<$PropertyType<Endpoint, 'connection_info'>> {
    let index = endpoint.connection_info.secret_ref && endpoint.connection_info.secret_ref.lastIndexOf('/')
    let uuid = index && endpoint.connection_info.secret_ref && endpoint.connection_info.secret_ref.substr(index + 1)

    if (!uuid) {
      return endpoint.connection_info
    }

    let response = await Api.send({
      url: `${configLoader.config.servicesUrls.barbican}/v1/secrets/${uuid || 'undefined'}/payload`,
      responseType: 'text',
      headers: { Accept: 'text/plain' },
    })
    return response.data
  }

  async getSecretPayload(uuid: string, count: number = 0) {
    let delay = () => new Promise(r => { setTimeout(() => { r() }, 2000) })

    if (count >= 10) {
      return Promise.reject({ secretCustomError: `The secret '${uuid}' is not active after ${count} retries.` })
    }

    let response = await Api.send({
      url: `${configLoader.config.servicesUrls.barbican}/v1/secrets/${uuid}`,
      headers: { Accept: 'application/json' },
    })

    if (response.data.status === 'ACTIVE') {
      let payload = await Api.send({
        url: `${configLoader.config.servicesUrls.barbican}/v1/secrets/${uuid}/payload`,
        headers: { Accept: 'text/plain' },
      })
      return payload
    }
    await delay()
    let payload = await this.getSecretPayload(uuid, count + 1)
    return payload
  }

  async getConnectionsInfo(endpoints: Endpoint[]): Promise<Endpoint[]> {
    let result: Endpoint[] = await Promise.all(endpoints.map(async endpoint => {
      let index = endpoint.connection_info.secret_ref ? endpoint.connection_info.secret_ref.lastIndexOf('/') : ''
      let uuid = endpoint.connection_info.secret_ref && index ? endpoint.connection_info.secret_ref.substr(index + 1) : ''
      if (!uuid) {
        return { ...endpoint }
      }
      let response = await Api.send({
        url: `${configLoader.config.servicesUrls.barbican}/v1/secrets/${uuid}/payload`,
        responseType: 'text',
        headers: { Accept: 'text/plain' },
      })
      return { ...endpoint, connection_info: response.data }
    }))
    return result
  }

  async validate(endpoint: Endpoint): Promise<Validation> {
    let response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${endpoint.id}/actions`,
      method: 'POST',
      data: { 'validate-connection': null },
    })
    return response.data['validate-connection']
  }

  async update(endpoint: Endpoint): Promise<Endpoint> {
    let parsedEndpoint = SchemaParser.fieldsToPayload(endpoint)

    if (parsedEndpoint.connection_info && Object.keys(parsedEndpoint.connection_info).length > 0 && parsedEndpoint.connection_info.secret_ref) {
      // $FlowIgnore
      let uuidIndex = parsedEndpoint.connection_info.secret_ref.lastIndexOf('/')
      // $FlowIgnore
      let uuid = parsedEndpoint.connection_info.secret_ref.substr(uuidIndex + 1)
      let newEndpoint: any = {}
      let connectionInfo = {}

      await Api.send({
        url: `${configLoader.config.servicesUrls.barbican}/v1/secrets/${uuid}`,
        method: 'DELETE',
      })

      let response = await Api.send({
        url: `${configLoader.config.servicesUrls.barbican}/v1/secrets`,
        method: 'POST',
        data: getBarbicanPayload(ObjectUtils.skipField(parsedEndpoint.connection_info, 'secret_ref')),
      })

      connectionInfo = { secret_ref: response.data.secret_ref }
      let newPayload = {
        endpoint: {
          name: parsedEndpoint.name,
          description: parsedEndpoint.description,
          connection_info: connectionInfo,
        },
      }
      let putResponse = await Api.send({
        url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${endpoint.id}`,
        method: 'PUT',
        data: newPayload,
      })

      uuidIndex = connectionInfo.secret_ref.lastIndexOf('/')
      uuid = connectionInfo.secret_ref.substr(uuidIndex + 1)
      newEndpoint = putResponse.data.endpoint
      try {
        let conInfoResponse = await this.getSecretPayload(uuid)
        newEndpoint.connection_info = {
          ...newEndpoint.connection_info,
          ...conInfoResponse.data,
        }
        return newEndpoint
      } catch (e) {
        if (e.secretCustomError) {
          notificationStore.alert(e.secretCustomError, 'error')
        }
        throw e
      }
    }

    let response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${endpoint.id}`,
      method: 'PUT',
      data: { endpoint: parsedEndpoint },
    })
    return SchemaParser.parseConnectionResponse(response.data.endpoint)
  }

  async add(endpoint: Endpoint, skipSchemaParser: boolean = false): Promise<Endpoint> {
    let parsedEndpoint: any = skipSchemaParser ? { ...endpoint } : SchemaParser.fieldsToPayload(endpoint)
    let newEndpoint: any = {}
    let connectionInfo = {}
    if (configLoader.config.useBarbicanSecrets
      && parsedEndpoint.connection_info && Object.keys(parsedEndpoint.connection_info).length > 0) {
      let response = await Api.send({
        url: `${configLoader.config.servicesUrls.barbican}/v1/secrets`,
        method: 'POST',
        data: getBarbicanPayload(ObjectUtils.skipField(parsedEndpoint.connection_info, 'secret_ref')),
      })

      connectionInfo = { secret_ref: response.data.secret_ref }
      let newPayload = {
        endpoint: {
          name: parsedEndpoint.name,
          description: parsedEndpoint.description,
          type: endpoint.type,
          connection_info: connectionInfo,
        },
      }
      let postResponse = await Api.send({
        url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints`,
        method: 'POST',
        data: newPayload,
      })

      let uuidIndex = connectionInfo.secret_ref.lastIndexOf('/')
      let uuid = connectionInfo.secret_ref.substr(uuidIndex + 1)
      newEndpoint = postResponse.data.endpoint

      try {
        let conInfoResponse = await this.getSecretPayload(uuid)
        newEndpoint.connection_info = {
          ...newEndpoint.connection_info,
          ...conInfoResponse.data,
        }
        return newEndpoint
      } catch (e) {
        if (e.secretCustomError) {
          notificationStore.alert(e.secretCustomError, 'error')
        }
        throw e
      }
    }

    let response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints`,
      method: 'POST',
      data: {
        endpoint: {
          ...parsedEndpoint,
          type: endpoint.type,
        },
      },
    })
    return SchemaParser.parseConnectionResponse(response.data.endpoint)
  }

  async loadStorage(endpointId: string, data: any): Promise<Storage> {
    let env = btoa(JSON.stringify(data))
    let response = await Api.get(`${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${endpointId}/storage?env=${env}`)
    return response.data.storage
  }
}

export default new EndpointSource()
