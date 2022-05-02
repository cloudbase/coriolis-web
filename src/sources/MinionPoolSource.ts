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

import Api from '@src/utils/ApiCaller'
import DefaultMinionPoolSchemaPlugin from '@src/plugins/default/MinionPoolSchemaPlugin'

import configLoader from '@src/utils/Config'
import { MinionPool, MinionPoolDetails } from '@src/@types/MinionPool'
import { ProviderTypes } from '@src/@types/Providers'
import { Field } from '@src/@types/Field'
import { providerTypes } from '@src/constants'
import { Endpoint, OptionValues } from '@src/@types/Endpoint'
import { MinionPoolAction } from '@src/stores/MinionPoolStore'
import { Execution } from '@src/@types/Execution'
import { SchemaParser } from './Schemas'

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
        enum: [
          {
            label: 'Linux',
            value: 'linux',
          }, {
            label: 'Windows',
            value: 'windows',
          },
        ],
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

  async loadOptions(config: {
    optionsType: 'source' | 'destination',
    endpoint: Endpoint,
    envData: { [prop: string]: any } | null | undefined,
    useCache?: boolean | null,
  }): Promise<OptionValues[]> {
    const {
      optionsType, endpoint, envData, useCache,
    } = config
    const envString = SchemaParser.getMinionPoolToOptionsQuery(envData, endpoint.type)
    const callName = optionsType === 'source' ? 'source-minion-pool-options' : 'destination-minion-pool-options'
    const fieldName = optionsType === 'source' ? 'source_minion_pool_options' : 'destination_minion_pool_options'

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${endpoint.id}/${callName}${envString}`,
      cache: useCache,
      cancelId: endpoint.id,
    })
    return response.data[fieldName]
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
        fields = SchemaParser.minionPoolOptionsSchemaToFields(providerName, schema, `${providerName}-minion-pool`)
      }
      return fields
    } catch (err) {
      console.error(err)
      return []
    }
  }

  async add(config: {
    endpointId: string,
    data: any,
    defaultSchema: Field[],
    envSchema: Field[],
    provider: ProviderTypes
  }) {
    const {
      endpointId, data, defaultSchema, envSchema, provider,
    } = config
    const payload = {
      minion_pool: {
        ...new DefaultMinionPoolSchemaPlugin().getMinionPoolEnv(defaultSchema, data),
        endpoint_id: endpointId,
        environment_options: SchemaParser.getMinionPoolEnv(provider, envSchema, data),
      },
    }
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/minion_pools`,
      method: 'POST',
      data: payload,
    })
    return response.data.minion_pool
  }

  async update(config: {
    data: any,
    defaultSchema: Field[],
    envSchema: Field[],
    provider: ProviderTypes
  }) {
    const {
      data, defaultSchema, envSchema, provider,
    } = config
    const payload = {
      minion_pool: {
        ...new DefaultMinionPoolSchemaPlugin().getMinionPoolEnv(defaultSchema, data),
        environment_options: SchemaParser.getMinionPoolEnv(provider, envSchema, data),
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
