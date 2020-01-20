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
import { servicesUrl, providerTypes } from '../constants'
import { SchemaParser } from './Schemas'
import type { Field } from '../types/Field'
import type { Providers } from '../types/Providers'
import type { OptionValues } from '../types/Endpoint'

class ProviderSource {
  async getConnectionInfoSchema(providerName: string): Promise<Field[]> {
    let response = await Api.get(`${servicesUrl.coriolis}/${Api.projectId}/providers/${providerName}/schemas/${providerTypes.CONNECTION}`)
    let schema = response.data.schemas.connection_info_schema
    schema = SchemaParser.connectionSchemaToFields(providerName, schema)
    return schema
  }

  async loadProviders(): Promise<Providers> {
    let response = await Api.get(`${servicesUrl.coriolis}/${Api.projectId}/providers`)
    return response.data.providers
  }

  async loadOptionsSchema(providerName: string, optionsType: 'source' | 'destination', useCache?: ?boolean, quietError?: ?boolean): Promise<Field[]> {
    let schemaTypeInt = optionsType === 'source' ? providerTypes.SOURCE_REPLICA : providerTypes.TARGET_REPLICA

    try {
      let response = await Api.send({
        url: `${servicesUrl.coriolis}/${Api.projectId}/providers/${providerName}/schemas/${schemaTypeInt}`,
        cache: useCache,
        quietError,
      })
      let schemas = (response && response.data && response.data.schemas) || {}
      let schema = optionsType === 'source' ? schemas.source_environment_schema : schemas.destination_environment_schema
      let fields = []
      if (schema) {
        fields = SchemaParser.optionsSchemaToFields(providerName, schema)
      }
      return fields
    } catch (err) {
      console.error(err)
      return []
    }
  }

  async getOptionsValues(optionsType: 'source' | 'destination', endpointId: string, envData: ?{ [string]: mixed }, cache?: ?boolean, quietError?: boolean): Promise<OptionValues[]> {
    let envString = ''
    if (envData) {
      envString = `?env=${btoa(JSON.stringify(envData))}`
    }
    let callName = optionsType === 'source' ? 'source-options' : 'destination-options'
    let fieldName = optionsType === 'source' ? 'source_options' : 'destination_options'

    let response = await Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/endpoints/${endpointId}/${callName}${envString}`,
      cache,
      cancelId: endpointId,
      quietError,
    })
    return response.data[fieldName]
  }
}

export default new ProviderSource()
