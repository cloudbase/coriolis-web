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

import moment from 'moment'

import Api from '../utils/ApiCaller'

import configLoader from '../utils/Config'
import { MinionPool, MinionPoolDetails } from '../@types/MinionPool'
import { ProviderTypes } from '../@types/Providers'
import { Field } from '../@types/Field'
import { providerTypes } from '../constants'
import { SchemaParser } from './Schemas'
import { OptionValues } from '../@types/Endpoint'
import { MinionPoolAction } from '../stores/MinionPoolStore'
import { Execution, ExecutionTasks } from '../@types/Execution'
import { sortTasks } from './ReplicaSource'
import { ProgressUpdate } from '../@types/Task'

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
        name: 'pool_platform',
        type: 'string',
      },
      {
        name: 'pool_name',
        type: 'string',
        required: true,
      },
      {
        name: 'pool_os_type',
        type: 'string',
        required: true,
        enum: [
          {
            value: 'linux',
            label: 'Linux',
          },
          {
            value: 'windows',
            label: 'Windows',
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
    return response.data.minion_pools
  }

  async loadEnvOptions(endpointId: string, platform: 'source' | 'destination', useCache?: boolean): Promise<OptionValues[]> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${endpointId}/${platform}-minion-pool-options`,
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

  async runAction(minionPoolId: string, minionPoolAction: MinionPoolAction): Promise<Execution> {
    const payload: any = {}
    payload[minionPoolAction] = null

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/minion_pools/${minionPoolId}/actions`,
      method: 'POST',
      data: payload,
    })
    return response.data.execution
  }

  async getMinionPoolDetails(
    minionPoolId: string,
    options?: { skipLog?: boolean },
  ): Promise<MinionPoolDetails> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/minion_pools/${minionPoolId}`,
      skipLog: options?.skipLog,
    })
    const minionPool: MinionPoolDetails = response.data.minion_pool
    minionPool.executions.sort((a, b) => a.number - b.number)
    return minionPool
  }

  async cancelExecution(minionPoolId: string, force?: boolean, executionId?: string) {
    let usableExecutionId = executionId
    if (!usableExecutionId) {
      const details = await this.getMinionPoolDetails(minionPoolId)
      const lastExecution = details.executions[details.executions.length - 1]

      if (!lastExecution) {
        return null
      }
      usableExecutionId = lastExecution.id
    }

    const payload: any = { cancel: { force: force || false } }

    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/minion_pools/${minionPoolId}/executions/${usableExecutionId}/actions`,
      method: 'POST',
      data: payload,
    })
    return null
  }

  async deleteMinionPool(minionPoolId: string) {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/minion_pools/${minionPoolId}`,
      method: 'DELETE',
    })
    return response.data.execution
  }

  async getExecutionTasks(options: {
    minionPoolId: string,
    executionId?: string,
    skipLog?: boolean,
  }): Promise<ExecutionTasks> {
    const {
      minionPoolId, executionId, skipLog,
    } = options

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/minion_pools/${minionPoolId}/executions/${executionId}`,
      skipLog,
      quietError: true,
    })
    const execution: ExecutionTasks = response.data.execution
    const sortTaskUpdates = (updates: ProgressUpdate[]) => {
      if (!updates) {
        return
      }
      updates.sort((a, b) => moment(a.created_at)
        .toDate().getTime() - moment(b.created_at).toDate().getTime())
    }
    sortTasks(execution.tasks, sortTaskUpdates)
    return execution
  }
}

export default new MinionPoolSource()
