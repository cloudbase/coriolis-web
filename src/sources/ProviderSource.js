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

import { servicesUrl, providerTypes } from '../config'
import { SchemaParser } from './Schemas'

class ProviderSource {
  static getConnectionInfoSchema(providerName) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/providers/${providerName}/schemas/${providerTypes.CONNECTION}`,
        method: 'GET',
      }).then(response => {
        let schema = response.data.schemas.connection_info_schema
        schema = SchemaParser.connectionSchemaToFields(providerName, schema)
        resolve(schema)
      }, reject).catch(reject)
    })
  }

  static loadProviders() {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/providers`,
        method: 'GET',
      }).then(response => {
        resolve(response.data.providers)
      }, reject).catch(reject)
    })
  }

  static loadOptionsSchema(providerName, schemaType) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
      let schemaTypeInt = schemaType === 'migration' ? providerTypes.TARGET_MIGRATION : providerTypes.TARGET_REPLICA

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/providers/${providerName}/schemas/${schemaTypeInt}`,
        method: 'GET',
      }).then(response => {
        let schema = response.data.schemas.destination_environment_schema
        let fields = SchemaParser.optionsSchemaToFields(providerName, schema)
        resolve(fields)
      }, reject).catch(reject)
    })
  }
}

export default ProviderSource
