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
import moment from 'moment'

import Api from '../utils/ApiCaller'
import { SchemaParser } from './Schemas'
import ObjectUtils from '../utils/ObjectUtils'
import type { Endpoint } from '../types/Endpoint'

import { servicesUrl, useSecret } from '../config'

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
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
      if (projectId) {
        Api.sendAjaxRequest({
          url: `${servicesUrl.coriolis}/${projectId}/endpoints`,
          method: 'GET',
        }).then(response => {
          let connections = []
          if (response.data.endpoints.length) {
            response.data.endpoints.forEach(endpoint => {
              connections.push(endpoint)
            })
          }

          connections.sort((c1, c2) => moment(c2.created_at).diff(moment(c1.created_at)))

          resolve(connections)
        }, reject).catch(reject)
      } else {
        reject()
      }
    })
  }
  static delete(endpoint: Endpoint): Promise<string> {
    return new Promise((resolve, reject) => {
      let projectId :any = cookie.get('projectId')

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/endpoints/${endpoint.id}`,
        method: 'DELETE',
      }).then(() => {
        if (endpoint.connection_info && endpoint.connection_info.secret_ref) {
          let uuidIndex = endpoint.connection_info.secret_ref.lastIndexOf('/')
          // $FlowIssue
          let uuid = endpoint.connection_info.secret_ref.substr(uuidIndex + 1)
          Api.sendAjaxRequest({
            url: `${servicesUrl.barbican}/v1/secrets/${uuid}`,
            method: 'DELETE',
          }).then(() => { resolve(endpoint.id) }, reject).catch(reject)
        } else {
          resolve(endpoint.id)
        }
      }, reject).catch(reject)
    })
  }

  static getConnectionInfo(endpoint: Endpoint): Promise<$PropertyType<Endpoint, 'connection_info'>> {
    let index = endpoint.connection_info.secret_ref && endpoint.connection_info.secret_ref.lastIndexOf('/')
    let uuid = index && endpoint.connection_info.secret_ref && endpoint.connection_info.secret_ref.substr(index + 1)

    return new Promise((resolve, reject) => {
      Api.sendAjaxRequest({
        url: `${servicesUrl.barbican}/v1/secrets/${uuid || ''}/payload`,
        method: 'GET',
        json: false,
        headers: { Accept: 'text/plain' },
      }).then((response) => {
        resolve(JSON.parse(response.data))
      }, reject).catch(reject)
    })
  }

  static validate(endpoint: Endpoint): Promise<{ valid: boolean, validation: { message: string } }> {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId || ''}/endpoints/${endpoint.id}/actions`,
        method: 'POST',
        data: { 'validate-connection': null },
      }).then(response => {
        resolve(response.data['validate-connection'])
      }, reject).catch(reject)
    })
  }

  static update(endpoint: Endpoint): Promise<Endpoint> {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
      let parsedEndpoint = SchemaParser.fieldsToPayload(endpoint)

      if (parsedEndpoint.connection_info && parsedEndpoint.connection_info.secret_ref) {
        let uuidIndex = parsedEndpoint.connection_info.secret_ref.lastIndexOf('/')
        let uuid = parsedEndpoint.connection_info.secret_ref.substr(uuidIndex + 1)

        Api.sendAjaxRequest({
          url: `${servicesUrl.barbican}/v1/secrets/${uuid}`,
          method: 'DELETE',
        })

        Api.sendAjaxRequest({
          url: `${servicesUrl.barbican}/v1/secrets`,
          method: 'POST',
          data: getBarbicanPayload(ObjectUtils.skipField(parsedEndpoint.connection_info, 'secret_ref')),
        }).then(response => {
          let connectionInfo = { secret_ref: response.data.secret_ref }
          let newPayload = {
            endpoint: {
              name: parsedEndpoint.name,
              description: parsedEndpoint.description,
              connection_info: connectionInfo,
            },
          }
          Api.sendAjaxRequest({
            url: `${servicesUrl.coriolis}/${projectId || ''}/endpoints/${endpoint.id}`,
            method: 'PUT',
            data: newPayload,
          }).then(putResponse => {
            uuidIndex = connectionInfo.secret_ref.lastIndexOf('/')
            uuid = connectionInfo.secret_ref.substr(uuidIndex + 1)
            let newEndpoint = putResponse.data.endpoint

            Api.sendAjaxRequest({
              url: `${servicesUrl.barbican}/v1/secrets/${uuid}/payload`,
              method: 'GET',
              json: false,
              headers: { Accept: 'text/plain' },
            }).then(conInfoResponse => {
              newEndpoint.connection_info = {
                ...newEndpoint.connection_info,
                ...JSON.parse(conInfoResponse.data),
              }
              resolve(newEndpoint)
            }, reject).catch(reject)
          }, reject).catch(reject)
        }, reject).catch(reject)
      } else {
        Api.sendAjaxRequest({
          url: `${servicesUrl.coriolis}/${projectId || ''}/endpoints/${endpoint.id}`,
          method: 'PUT',
          data: { endpoint: parsedEndpoint },
        }).then(response => {
          resolve(response.data.endpoint)
        }, reject).catch(reject)
      }
    })
  }

  static add(endpoint: Endpoint): Promise<Endpoint> {
    return new Promise((resolve, reject) => {
      let parsedEndpoint = SchemaParser.fieldsToPayload(endpoint)
      let projectId = cookie.get('projectId')
      if (useSecret) {
        Api.sendAjaxRequest({
          url: `${servicesUrl.barbican}/v1/secrets`,
          method: 'POST',
          data: getBarbicanPayload(ObjectUtils.skipField(parsedEndpoint.connection_info, 'secret_ref')),
        }).then(response => {
          let connectionInfo = { secret_ref: response.data.secret_ref }
          let newPayload = {
            endpoint: {
              name: parsedEndpoint.name,
              description: parsedEndpoint.description,
              type: endpoint.type,
              connection_info: connectionInfo,
            },
          }
          Api.sendAjaxRequest({
            url: `${servicesUrl.coriolis}/${projectId || ''}/endpoints`,
            method: 'POST',
            data: newPayload,
          }).then(postResponse => {
            let uuidIndex = connectionInfo.secret_ref.lastIndexOf('/')
            let uuid = connectionInfo.secret_ref.substr(uuidIndex + 1)
            let newEndpoint = postResponse.data.endpoint

            Api.sendAjaxRequest({
              url: `${servicesUrl.barbican}/v1/secrets/${uuid}/payload`,
              method: 'GET',
              json: false,
              headers: { Accept: 'text/plain' },
            }).then(conInfoResponse => {
              newEndpoint.connection_info = {
                ...newEndpoint.connection_info,
                ...JSON.parse(conInfoResponse.data),
              }
              resolve(newEndpoint)
            }, reject).catch(reject)
          }, reject).catch(reject)
        }, reject).catch(reject)
      } else {
        Api.sendAjaxRequest({
          url: `${servicesUrl.coriolis}/${projectId || ''}/endpoints`,
          method: 'POST',
          data: { endpoint: parsedEndpoint },
        }).then(response => {
          resolve(response.data.endpoint)
        }, reject).catch(reject)
      }
    })
  }
}

export default EdnpointSource
