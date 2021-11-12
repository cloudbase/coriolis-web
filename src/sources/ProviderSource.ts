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
import { providerTypes } from '../constants'
import configLoader from '../utils/Config'
import { SchemaParser } from './Schemas'
import type { Field } from '../@types/Field'
import type { Providers, ProviderTypes } from '../@types/Providers'
import type { OptionValues } from '../@types/Endpoint'
import DomUtils from '../utils/DomUtils'

class ProviderSource {
  async getConnectionInfoSchema(providerName: ProviderTypes): Promise<Field[]> {
    const response = await Api.get(`${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/providers/${providerName}/schemas/${providerTypes.CONNECTION}`)
    let schema = response.data.schemas.connection_info_schema
    schema = SchemaParser.connectionSchemaToFields(providerName, schema)
    return schema
  }

  async loadProviders(): Promise<Providers> {
    const response = await Api.get(`${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/providers`)
    return response.data.providers
  }

  async loadOptionsSchema(providerName: ProviderTypes, optionsType: 'source' | 'destination', useCache?: boolean | null, quietError?: boolean | null): Promise<Field[]> {
    const schemaTypeInt = optionsType === 'source' ? providerTypes.SOURCE_REPLICA : providerTypes.TARGET_REPLICA

    try {
      const response = await Api.send({
        url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/providers/${providerName}/schemas/${schemaTypeInt}`,
        cache: useCache,
        quietError,
      })
      const schema = optionsType === 'source' ? response?.data?.schemas?.source_environment_schema : response?.data?.schemas?.destination_environment_schema
      let fields = []
      if (schema) {
        fields = SchemaParser.optionsSchemaToFields(providerName, schema, `${providerName}-${optionsType}`)
      }
      return fields
    } catch (err) {
      console.error(err)
      return []
    }
  }

  async getOptionsValues(
    optionsType: 'source' | 'destination',
    endpointId: string,
    envData: { [prop: string]: any } | null | undefined,
    cache?: boolean | null,
    quietError?: boolean,
  ): Promise<OptionValues[]> {
    let envString = ''
    if (envData) {
      envString = `?env=${DomUtils.encodeToBase64Url(envData)}`
    }
    const callName = optionsType === 'source' ? 'source-options' : 'destination-options'
    const fieldName = optionsType === 'source' ? 'source_options' : 'destination_options'

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${endpointId}/${callName}${envString}`,
      cache,
      cancelId: endpointId,
      quietError,
    })
    return response.data[fieldName]
  }
}

export default new ProviderSource()
