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

import moment from 'moment'

import Api from '../utils/ApiCaller'
import { OptionsSchemaPlugin } from '../plugins/endpoint'
import DefaultOptionsSchemaPlugin from '../plugins/endpoint/default/OptionsSchemaPlugin'

import configLoader from '../utils/Config'
import type { UpdateData, ReplicaItem, ReplicaItemDetails } from '../@types/MainItem'
import type { Execution, ExecutionTasks } from '../@types/Execution'
import type { Endpoint } from '../@types/Endpoint'
import type { Task, ProgressUpdate } from '../@types/Task'
import type { Field } from '../@types/Field'
import { INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS } from '../components/organisms/WizardOptions/WizardOptions'

export const sortTasks = (
  tasks?: Task[], taskUpdatesSortFunction?: (updates: ProgressUpdate[]) => void,
) => {
  if (!tasks) {
    return
  }
  let sortedTasks: any[] = []
  let buffer: Task[] = []
  let runningBuffer: Task[] = []
  let completedBuffer: Task[] = []
  if (!taskUpdatesSortFunction) {
    return
  }
  tasks.forEach(task => {
    taskUpdatesSortFunction(task.progress_updates)
    buffer.push(task)
    if (task.status === 'RUNNING') {
      runningBuffer.push(task)
    } else if (task.status === 'COMPLETED' || task.status === 'ERROR') {
      completedBuffer.push(task)
    } else {
      if (runningBuffer.length >= 2) {
        sortedTasks = sortedTasks.concat([...completedBuffer, ...runningBuffer, task])
      } else {
        sortedTasks = sortedTasks.concat([...buffer])
      }
      buffer = []
      runningBuffer = []
      completedBuffer = []
    }
  })
  if (buffer.length) {
    if (runningBuffer.length >= 2) {
      sortedTasks = sortedTasks.concat([...completedBuffer, ...runningBuffer])
    } else {
      sortedTasks = sortedTasks.concat([...buffer])
    }
  }
  tasks.splice(0, tasks.length, ...sortedTasks)
}

export class ReplicaSourceUtils {
  static filterDeletedExecutions(executions?: Execution[]) {
    if (!executions || !executions.length) {
      return []
    }

    return executions.filter(execution => execution.deleted_at == null)
  }

  static sortReplicas(replicas: ReplicaItem[]) {
    replicas
      .sort(
        (a, b) => new Date(b.updated_at || b.created_at).getTime()
          - new Date(a.updated_at || a.created_at)
            .getTime(),
      )
  }

  static sortExecutions(executions: Execution[]) {
    executions.sort((a, b) => a.number - b.number)
  }

  static sortTaskUpdates(updates: ProgressUpdate[]) {
    if (!updates) {
      return
    }
    updates
      .sort((a, b) => moment(a.created_at)
        .toDate().getTime() - moment(b.created_at).toDate().getTime())
  }
}

class ReplicaSource {
  async getReplicas(skipLog?: boolean, quietError?: boolean): Promise<ReplicaItem[]> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas`,
      skipLog,
      quietError,
    })
    const replicas: ReplicaItem[] = response.data.replicas
    ReplicaSourceUtils.sortReplicas(replicas)
    return replicas
  }

  async getReplicaDetails(options: {
    replicaId: string, polling?: boolean
  }): Promise<ReplicaItemDetails> {
    const { replicaId, polling } = options

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${replicaId}`,
      skipLog: polling,
    })
    const replica: ReplicaItemDetails = response.data.replica
    replica.executions = ReplicaSourceUtils.filterDeletedExecutions(replica.executions)
    ReplicaSourceUtils.sortExecutions(replica.executions)
    return replica
  }

  async getExecutionTasks(options: {
    replicaId: string,
    executionId?: string,
    polling?: boolean,
  }): Promise<ExecutionTasks> {
    const {
      replicaId, executionId, polling,
    } = options

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${replicaId}/executions/${executionId}`,
      skipLog: polling,
      quietError: true,
    })
    const execution: ExecutionTasks = response.data.execution
    sortTasks(execution.tasks, ReplicaSourceUtils.sortTaskUpdates)
    return execution
  }

  async execute(replicaId: string, fields?: Field[]): Promise<ExecutionTasks> {
    const payload: any = { execution: { shutdown_instances: false } }
    if (fields) {
      fields.forEach(f => {
        payload.execution[f.name] = f.value || false
      })
    }
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${replicaId}/executions`,
      method: 'POST',
      data: payload,
    })
    const execution: ExecutionTasks = response.data.execution
    sortTasks(execution.tasks, ReplicaSourceUtils.sortTaskUpdates)
    return execution
  }

  async cancelExecution(
    options: { replicaId: string, executionId?: string, force?: boolean },
  ): Promise<string> {
    const data: any = { cancel: null }
    if (options.force) {
      data.cancel = { force: true }
    }

    let lastExecutionId = options.executionId

    if (!lastExecutionId) {
      const replicaDetails = await this.getReplicaDetails({ replicaId: options.replicaId })
      const lastExecution = replicaDetails.executions[replicaDetails.executions.length - 1]
      if (lastExecution.status !== 'RUNNING') {
        return options.replicaId
      }
      lastExecutionId = lastExecution.id
    }

    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${options.replicaId}/executions/${lastExecutionId}/actions`,
      method: 'POST',
      data,
    })
    return options.replicaId
  }

  async deleteExecution(replicaId: string, executionId: string): Promise<string> {
    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${replicaId}/executions/${executionId}`,
      method: 'DELETE',
    })
    return replicaId
  }

  async delete(replicaId: string): Promise<string> {
    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${replicaId}`,
      method: 'DELETE',
    })
    return replicaId
  }

  async deleteDisks(replicaId: string): Promise<Execution> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${replicaId}/actions`,
      method: 'POST',
      data: { 'delete-disks': null },
    })
    return response.data.execution
  }

  async update(options: {
    replica: ReplicaItemDetails,
    destinationEndpoint: Endpoint,
    updateData: UpdateData,
    defaultStorage: string | null | undefined,
    storageConfigDefault: string,
  }): Promise<Execution> {
    const {
      replica, destinationEndpoint, updateData, defaultStorage, storageConfigDefault,
    } = options

    const parser = OptionsSchemaPlugin.for(destinationEndpoint.type)
    const payload: any = { replica: {} }

    if (updateData.network.length > 0) {
      payload.replica.network_map = parser.getNetworkMap(updateData.network)
    }
    if (Object.keys(updateData.source).length > 0) {
      const sourceEnv = parser.getDestinationEnv(updateData.source, replica.source_environment)
      if (sourceEnv.minion_pool_id) {
        payload.replica.origin_minion_pool_id = sourceEnv.minion_pool_id
        delete sourceEnv.minion_pool_id
      }
      if (Object.keys(sourceEnv).length) {
        payload.replica.source_environment = sourceEnv
      }
    }

    if (Object.keys(updateData.destination).length > 0) {
      const destEnv = parser.getDestinationEnv(updateData.destination,
        { ...replica, ...replica.destination_environment })

      const newMinionMappings = destEnv[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS]
      if (newMinionMappings) {
        payload.replica[
          INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS
        ] = newMinionMappings
      }
      delete destEnv[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS]

      if (destEnv.minion_pool_id) {
        payload.replica.destination_minion_pool_id = destEnv.minion_pool_id
        delete destEnv.minion_pool_id
      }
      if (Object.keys(destEnv).length) {
        payload.replica.destination_environment = destEnv
      }
    }

    if (defaultStorage || updateData.storage.length > 0) {
      payload.replica.storage_mappings = parser
        .getStorageMap(defaultStorage, updateData.storage, storageConfigDefault)
    }

    if (updateData.uploadedScripts?.length) {
      payload.replica.user_scripts = DefaultOptionsSchemaPlugin
        .getUserScripts(updateData.uploadedScripts, replica.user_scripts)
    }

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${replica.id}`,
      method: 'PUT',
      data: payload,
    })
    return response.data
  }
}

export default new ReplicaSource()
