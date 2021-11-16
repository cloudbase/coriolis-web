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

import Api from '@src/utils/ApiCaller'
import { OptionsSchemaPlugin } from '@src/plugins'
import DefaultOptionsSchemaPlugin from '@src/plugins/default/OptionsSchemaPlugin'

import configLoader from '@src/utils/Config'
import type { UpdateData, ReplicaItem, ReplicaItemDetails } from '@src/@types/MainItem'
import type { Execution, ExecutionTasks } from '@src/@types/Execution'
import type { Endpoint } from '@src/@types/Endpoint'
import type { Task, ProgressUpdate } from '@src/@types/Task'
import type { Field } from '@src/@types/Field'
import { INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS } from '@src/components/modules/WizardModule/WizardOptions/WizardOptions'

export const sortTasks = (tasks?: Task[], taskUpdatesSortFunction?: (updates: ProgressUpdate[]) => void) => {
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
    updates.sort((a, b) => a.index - b.index)
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
      cancelId: replicaId,
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
    sourceEndpoint: Endpoint,
    destinationEndpoint: Endpoint,
    updateData: UpdateData,
    defaultStorage: { value: string | null, busType?: string | null },
    storageConfigDefault: string,
  }): Promise<Execution> {
    const {
      replica,
      destinationEndpoint,
      updateData,
      defaultStorage,
      storageConfigDefault,
      sourceEndpoint,
    } = options

    const sourceParser = OptionsSchemaPlugin.for(sourceEndpoint.type)
    const destinationParser = OptionsSchemaPlugin.for(destinationEndpoint.type)
    const payload: any = { replica: {} }

    if (updateData.destination.title) {
      payload.replica.notes = updateData.destination.title
    }

    if (updateData.network.length > 0) {
      payload.replica.network_map = destinationParser.getNetworkMap(updateData.network)
    }
    if (Object.keys(updateData.source).length > 0) {
      const sourceEnv = sourceParser.getDestinationEnv(updateData.source, replica.source_environment)
      if (updateData.source.minion_pool_id !== undefined) {
        payload.replica.origin_minion_pool_id = updateData.source.minion_pool_id
      }
      if (Object.keys(sourceEnv).length) {
        payload.replica.source_environment = sourceEnv
      }
    }

    if (Object.keys(updateData.destination).length > 0) {
      const destEnv = destinationParser.getDestinationEnv(
        updateData.destination,
        { ...replica, ...replica.destination_environment },
      )

      const newMinionMappings = destEnv[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS]
      if (newMinionMappings) {
        payload.replica[
          INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS
        ] = newMinionMappings
      }
      delete destEnv[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS]

      if (updateData.destination.minion_pool_id !== undefined) {
        payload.replica.destination_minion_pool_id = updateData.destination.minion_pool_id
      }
      if (Object.keys(destEnv).length) {
        payload.replica.destination_environment = destEnv
      }
    }

    if (defaultStorage || updateData.storage.length > 0) {
      payload.replica.storage_mappings = destinationParser
        .getStorageMap(defaultStorage, updateData.storage, storageConfigDefault)
    }

    if (updateData.uploadedScripts?.length || updateData.removedScripts?.length) {
      payload.replica.user_scripts = DefaultOptionsSchemaPlugin
        .getUserScripts(
          updateData.uploadedScripts || [],
          updateData.removedScripts || [],
          replica.user_scripts,
        )
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
