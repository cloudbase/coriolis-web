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
import { servicesUrl, providerTypes } from '../config'
import { SchemaParser } from './Schemas'
import type { Field } from '../types/Field'
import type { Providers } from '../types/Providers'
import type { DestinationOption } from '../types/Endpoint'

class ProviderSource {
  static getConnectionInfoSchema(providerName: string): Promise<Field[]> {
    return Api.get(`${servicesUrl.coriolis}/${Api.projectId}/providers/${providerName}/schemas/${providerTypes.CONNECTION}`).then(response => {
      let schema = response.data.schemas.connection_info_schema
      schema = SchemaParser.connectionSchemaToFields(providerName, schema)
      return schema
    })
  }

  static loadProviders(): Promise<Providers> {
    return Api.get(`${servicesUrl.coriolis}/${Api.projectId}/providers`)
      .then(response => response.data.providers)
  }

  static loadOptionsSchema(providerName: string, schemaType: string): Promise<Field[]> {
    let schemaTypeInt = schemaType === 'migration' ? providerTypes.TARGET_MIGRATION : providerTypes.TARGET_REPLICA

    return Api.get(`${servicesUrl.coriolis}/${Api.projectId}/providers/${providerName}/schemas/${schemaTypeInt}`).then(response => {
      let schema = response.data.schemas.destination_environment_schema
      let fields = SchemaParser.optionsSchemaToFields(providerName, schema)
      return fields
    })
  }

  static getDestinationOptions(endpointId: string, envData: ?{ [string]: mixed }): Promise<DestinationOption[]> {
    let envString = ''
    if (envData) {
      envString = `?env=${btoa(JSON.stringify(envData))}`
    }

    return Api.get(`${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpointId}/destination-options${envString}`)
      .then(response => response.data.destination_options)
  }
}

export default ProviderSource
