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
import { SchemaParser } from './Schemas'
import ObjectUtils from '../utils/ObjectUtils'
import type { Endpoint, Validation, Storage } from '../types/Endpoint'

import { servicesUrl } from '../config'

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

class EdnpointSource {
  static getEndpoints(): Promise<Endpoint[]> {
    return Api.get(`${servicesUrl.coriolis}/${Api.projectId}/endpoints`).then(response => {
      let connections = []
      if (response.data.endpoints.length) {
        response.data.endpoints.forEach(endpoint => {
          connections.push(endpoint)
        })
      }

      connections.sort((c1, c2) => moment(c2.created_at).diff(moment(c1.created_at)))
      return connections
    })
  }
  static delete(endpoint: Endpoint): Promise<string> {
    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpoint.id}`,
      method: 'DELETE',
    }).then(() => {
      if (endpoint.connection_info && endpoint.connection_info.secret_ref) {
        let uuidIndex = endpoint.connection_info.secret_ref.lastIndexOf('/')
        // $FlowIssue
        let uuid = endpoint.connection_info.secret_ref.substr(uuidIndex + 1)
        return Api.send({
          url: `${servicesUrl.barbican}/v1/secrets/${uuid}`,
          method: 'DELETE',
        }).then(() => { return endpoint.id })
      }
      return endpoint.id
    })
  }

  static getConnectionInfo(endpoint: Endpoint): Promise<$PropertyType<Endpoint, 'connection_info'>> {
    let index = endpoint.connection_info.secret_ref && endpoint.connection_info.secret_ref.lastIndexOf('/')
    let uuid = index && endpoint.connection_info.secret_ref && endpoint.connection_info.secret_ref.substr(index + 1)

    if (!uuid) {
      return Promise.resolve(endpoint.connection_info)
    }

    return Api.send({
      url: `${servicesUrl.barbican}/v1/secrets/${uuid || 'undefined'}/payload`,
      responseType: 'text',
      headers: { Accept: 'text/plain' },
    }).then((response) => {
      return response.data
    })
  }

  static getConnectionsInfo(endpoints: Endpoint[]): Promise<Endpoint[]> {
    return Promise.all(endpoints.map(endpoint => {
      let index = endpoint.connection_info.secret_ref ? endpoint.connection_info.secret_ref.lastIndexOf('/') : ''
      let uuid = endpoint.connection_info.secret_ref && index ? endpoint.connection_info.secret_ref.substr(index + 1) : ''
      if (!uuid) {
        return Promise.resolve({ ...endpoint })
      }
      return Api.send({
        url: `${servicesUrl.barbican}/v1/secrets/${uuid}/payload`,
        responseType: 'text',
        headers: { Accept: 'text/plain' },
      }).then(response => {
        return { ...endpoint, connection_info: response.data }
      })
    }))
  }

  static validate(endpoint: Endpoint): Promise<Validation> {
    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpoint.id}/actions`,
      method: 'POST',
      data: { 'validate-connection': null },
    }).then(response => {
      return response.data['validate-connection']
    })
  }

  static update(endpoint: Endpoint): Promise<Endpoint> {
    let parsedEndpoint = SchemaParser.fieldsToPayload(endpoint)

    if (parsedEndpoint.connection_info && parsedEndpoint.connection_info.secret_ref) {
      // $FlowIgnore
      let uuidIndex = parsedEndpoint.connection_info.secret_ref.lastIndexOf('/')
      // $FlowIgnore
      let uuid = parsedEndpoint.connection_info.secret_ref.substr(uuidIndex + 1)
      let newEndpoint: any = {}
      let connectionInfo = {}
      return Api.send({
        url: `${servicesUrl.barbican}/v1/secrets/${uuid}`,
        method: 'DELETE',
      }).then(() => {
        return Api.send({
          url: `${servicesUrl.barbican}/v1/secrets`,
          method: 'POST',
          data: getBarbicanPayload(ObjectUtils.skipField(parsedEndpoint.connection_info, 'secret_ref')),
        })
      }).then(response => {
        connectionInfo = { secret_ref: response.data.secret_ref }
        let newPayload = {
          endpoint: {
            name: parsedEndpoint.name,
            description: parsedEndpoint.description,
            connection_info: connectionInfo,
          },
        }
        return Api.send({
          url: `${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpoint.id}`,
          method: 'PUT',
          data: newPayload,
        })
      }).then(putResponse => {
        uuidIndex = connectionInfo.secret_ref.lastIndexOf('/')
        uuid = connectionInfo.secret_ref.substr(uuidIndex + 1)
        newEndpoint = putResponse.data.endpoint
        return Api.send({
          url: `${servicesUrl.barbican}/v1/secrets/${uuid}/payload`,
          method: 'GET',
          responseType: 'text',
          headers: { Accept: 'text/plain' },
        })
      }).then(conInfoResponse => {
        newEndpoint.connection_info = {
          ...newEndpoint.connection_info,
          ...conInfoResponse.data,
        }
        return newEndpoint
      })
    }

    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpoint.id}`,
      method: 'PUT',
      data: { endpoint: parsedEndpoint },
    }).then(response => {
      return response.data.endpoint
    })
  }

  static add(endpoint: Endpoint, skipSchemaParser: boolean = false): Promise<Endpoint> {
    let parsedEndpoint: any = skipSchemaParser ? { ...endpoint } : SchemaParser.fieldsToPayload(endpoint)
    let newEndpoint: any = {}
    let connectionInfo = {}
    let useSecret = SchemaParser.useSecret(endpoint.type)

    if (useSecret) {
      return Api.send({
        url: `${servicesUrl.barbican}/v1/secrets`,
        method: 'POST',
        data: getBarbicanPayload(ObjectUtils.skipField(parsedEndpoint.connection_info, 'secret_ref')),
      }).then(response => {
        connectionInfo = { secret_ref: response.data.secret_ref }
        let newPayload = {
          endpoint: {
            name: parsedEndpoint.name,
            description: parsedEndpoint.description,
            type: endpoint.type,
            connection_info: connectionInfo,
          },
        }
        return Api.send({
          url: `${servicesUrl.coriolis}/${Api.projectId}/endpoints`,
          method: 'POST',
          data: newPayload,
        })
      }).then(postResponse => {
        let uuidIndex = connectionInfo.secret_ref.lastIndexOf('/')
        let uuid = connectionInfo.secret_ref.substr(uuidIndex + 1)
        newEndpoint = postResponse.data.endpoint

        return Api.send({
          url: `${servicesUrl.barbican}/v1/secrets/${uuid}/payload`,
          responseType: 'text',
          headers: { Accept: 'text/plain' },
        })
      }).then(conInfoResponse => {
        newEndpoint.connection_info = {
          ...newEndpoint.connection_info,
          ...conInfoResponse.data,
        }
        return newEndpoint
      })
    }

    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/endpoints`,
      method: 'POST',
      data: {
        endpoint: {
          ...parsedEndpoint,
          type: endpoint.type,
        },
      },
    }).then(response => {
      return response.data.endpoint
    })
  }

  static loadStorage(endpointId: string, data: any): Promise<Storage> {
    let env = btoa(JSON.stringify(data))
    return Api.get(`${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpointId}/storage?env=${env}`).then(response => {
      return response.data.storage
    })
  }
}

export default EdnpointSource
