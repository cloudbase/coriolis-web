/*
Copyright (C) 2020 Cloudbase Solutions SRL
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

import configLoader from '../utils/Config'
import { MinionPool, MinionPoolDetails } from '../@types/MinionPool'
import { ProviderTypes } from '../@types/Providers'
import { Field } from '../@types/Field'
import { providerTypes } from '../constants'
import { SchemaParser } from './Schemas'
import { OptionValues } from '../@types/Endpoint'
import { MinionPoolAction } from '../stores/MinionPoolStore'
import { Execution } from '../@types/Execution'
import DomUtils from '../utils/DomUtils'

const transformFieldsToPayload = (schema: Field[], data: any) => {
  const payload: any = {}
  schema.forEach(field => {
    if (data[field.name] === null || data[field.name] === undefined || data[field.name] === '') {
      if (field.default !== null) {
        payload[field.name] = field.default
      }
    } else {
      payload[field.name] = data[field.name]
    }
  })
  return payload
}

class MinionPoolSource {
  getMinionPoolDefaultSchema(): Field[] {
    return [
      {
        name: 'endpoint_id',
        label: 'Endpoint',
        type: 'string',
      },
      {
        name: 'platform',
        type: 'string',
        title: 'Pool Platform',
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        title: 'Pool Name',
      },
      {
        name: 'os_type',
        type: 'string',
        required: true,
        title: 'Pool OS Type',
        default: 'linux',
      },
      {
        name: 'minimum_minions',
        type: 'integer',
        minimum: 1,
        default: 1,
      },
      {
        name: 'maximum_minions',
        type: 'integer',
        minimum: 1,
        default: 1,
      },
      {
        name: 'minion_max_idle_time',
        type: 'integer',
        minimum: 0,
        default: 3600,
      },
      {
        name: 'minion_retention_strategy',
        type: 'string',
        default: 'delete',
        enum: [
          {
            value: 'delete',
            label: 'Delete',
          },
          {
            value: 'poweroff',
            label: 'Power Off',
          },
        ],
      },
      {
        name: 'skip_allocation',
        type: 'boolean',
        nullableBoolean: false,
      },
      {
        name: 'notes',
        type: 'string',
      },
    ]
  }

  async loadMinionPools(options?: { skipLog?: boolean }): Promise<MinionPool[]> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/minion_pools`,
      skipLog: options?.skipLog,
    })
    const minionPools: MinionPool[] = response.data.minion_pools
    minionPools.sort((a, b) => new Date(b.updated_at || b.created_at || '').getTime()
      - new Date(a.updated_at || a.created_at || '').getTime())
    return minionPools
  }

  async loadMinionPoolDetails(
    id: string,
    options?: { skipLog?: boolean },
  ): Promise<MinionPoolDetails> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/minion_pools/${id}`,
      skipLog: options?.skipLog,
    })
    return response.data.minion_pool
  }

  async loadEnvOptions(endpointId: string, platform: 'source' | 'destination', useCache?: boolean): Promise<OptionValues[]> {
    const env = DomUtils.encodeToBase64Url({ list_all_destination_networks: true })
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${endpointId}/${platform}-minion-pool-options?env=${env}`,
      cache: useCache,
    })
    return response.data[`${platform}_minion_pool_options`]
  }

  async loadMinionPoolSchema(providerName: ProviderTypes, platform: 'source' | 'destination'): Promise<Field[]> {
    const providerType = platform === 'source' ? providerTypes.SOURCE_MINION_POOL : providerTypes.DESTINATION_MINION_POOL

    try {
      const response = await Api.send({
        url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/providers/${providerName}/schemas/${providerType}`,
      })
      const schema = response.data?.schemas?.[`${platform}_minion_pool_environment_schema`]
      let fields = []
      if (schema) {
        fields = SchemaParser.optionsSchemaToFields(providerName, schema, `${providerName}-minion-pool`)
      }
      // Remove this field, as all networks are always listed
      fields = fields.filter(f => f.name !== 'list_all_destination_networks')
      return fields
    } catch (err) {
      console.error(err)
      return []
    }
  }

  async add(endpointId: string, data: any, defaultSchema: Field[], envSchema: Field[]) {
    const payload = {
      minion_pool: {
        ...transformFieldsToPayload(defaultSchema, data),
        endpoint_id: endpointId,
        environment_options: {
          ...transformFieldsToPayload(envSchema, data),
          list_all_destination_networks: true,
        },
      },
    }
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/minion_pools`,
      method: 'POST',
      data: payload,
    })
    return response.data.minion_pool
  }

  async update(data: any, defaultSchema: Field[], envSchema: Field[]) {
    const payload = {
      minion_pool: {
        ...transformFieldsToPayload(defaultSchema, data),
        environment_options: {
          ...transformFieldsToPayload(envSchema, data),
          list_all_destination_networks: true,
        },
      },
    }
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/minion_pools/${data.id}`,
      method: 'PUT',
      data: payload,
    })
    return response.data.minion_pool
  }

  async runAction(
    minionPoolId: string,
    minionPoolAction: MinionPoolAction,
    actionOptions?: any,
  ): Promise<Execution> {
    const payload: any = {}

    if (actionOptions) {
      payload[minionPoolAction] = { ...actionOptions }
    } else {
      payload[minionPoolAction] = null
    }

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/minion_pools/${minionPoolId}/actions`,
      method: 'POST',
      data: payload,
    })
    return response.data.execution
  }

  async deleteMinionPool(minionPoolId: string) {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/minion_pools/${minionPoolId}`,
      method: 'DELETE',
    })
    return response.data.execution
  }
}

export default new MinionPoolSource()
