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

import configLoader from '../utils/Config'
import type { MainItem, UpdateData } from '../@types/MainItem'
import type { Execution } from '../@types/Execution'
import type { Endpoint } from '../@types/Endpoint'
import type { Task, ProgressUpdate } from '../@types/Task'
import type { Field } from '../@types/Field'

export const sortTasks = (
  tasks: Task[], taskUpdatesSortFunction: (updates: ProgressUpdate[]) => void,
) => {
  if (!tasks) {
    return
  }
  let sortedTasks: any[] = []
  let buffer: Task[] = []
  let runningBuffer: Task[] = []
  let completedBuffer: Task[] = []
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

class ReplicaSourceUtils {
  static filterDeletedExecutionsInReplicas(replicas: any[]) {
    return replicas.map((replica: { executions: any }) => {
      // eslint-disable-next-line no-param-reassign
      replica.executions = ReplicaSourceUtils.filterDeletedExecutions(replica.executions)
      return replica
    })
  }

  static filterDeletedExecutions(executions: any[]) {
    if (!executions || !executions.length) {
      return executions
    }

    return executions.filter((execution: { deleted_at: null }) => execution.deleted_at == null)
  }

  static sortReplicas(replicas: any[]) {
    replicas.forEach((replica: { executions: any }) => {
      ReplicaSourceUtils.sortExecutionsAndTasks(replica.executions)
    })

    replicas.sort(
      (a: { executions: string | any[]; updated_at: any; created_at: any },
        b: { executions: string | any[]; updated_at: any; created_at: any }) => {
        const aLastExecution = a.executions && a.executions.length
          ? a.executions[a.executions.length - 1] : null
        const bLastExecution = b.executions && b.executions.length
          ? b.executions[b.executions.length - 1] : null
        const aLastTime = aLastExecution
          ? aLastExecution.updated_at || aLastExecution.created_at : null
        const bLastTime = bLastExecution
          ? bLastExecution.updated_at || bLastExecution.created_at : null
        const aTime = aLastTime || a.updated_at || a.created_at
        const bTime = bLastTime || b.updated_at || b.created_at
        return moment(bTime).diff(moment(aTime))
      },
    )
  }

  static sortExecutions(executions: any[]) {
    if (executions) {
      executions.sort((a: { number: number }, b: { number: number }) => a.number - b.number)
    }
  }

  static sortExecutionsAndTasks(executions: any[]) {
    this.sortExecutions(executions)
    executions.forEach((execution: { tasks: Task[] }) => {
      sortTasks(execution.tasks, ReplicaSourceUtils.sortTaskUpdates)
    })
  }

  static sortTaskUpdates(updates: any[]) {
    if (!updates) {
      return
    }
    updates
      .sort((a: any, b: any) => moment(a.created_at)
        .toDate().getTime() - moment(b.created_at).toDate().getTime())
  }
}

class ReplicaSource {
  async getReplicas(skipLog?: boolean, quietError?: boolean): Promise<MainItem[]> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas`,
      skipLog,
      quietError,
    })
    let replicas = response.data.replicas
    replicas = ReplicaSourceUtils.filterDeletedExecutionsInReplicas(replicas)
    ReplicaSourceUtils.sortReplicas(replicas)
    return replicas
  }

  async execute(replicaId: string, fields?: Field[]): Promise<Execution> {
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
    const execution = response.data.execution
    sortTasks(execution.tasks, ReplicaSourceUtils.sortTaskUpdates)
    return execution
  }

  async cancelExecution(
    replicaId: string, executionId: string, force?: boolean | null,
  ): Promise<string> {
    const data: any = { cancel: null }
    if (force) {
      data.cancel = { force: true }
    }
    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${replicaId}/executions/${executionId}/actions`,
      method: 'POST',
      data,
    })
    return replicaId
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

  async update(
    replica: MainItem,
    destinationEndpoint: Endpoint,
    updateData: UpdateData,
    defaultStorage: string | null | undefined,
    storageConfigDefault: string,
  ): Promise<Execution> {
    const parser = OptionsSchemaPlugin.for(destinationEndpoint.type)
    const payload: any = { replica: {} }

    if (updateData.network.length > 0) {
      payload.replica.network_map = parser.getNetworkMap(updateData.network)
    }

    if (Object.keys(updateData.destination).length > 0) {
      payload.replica.destination_environment = parser
        .getDestinationEnv(updateData.destination, replica.destination_environment)
    }

    if (Object.keys(updateData.source).length > 0) {
      payload.replica.source_environment = parser
        .getDestinationEnv(updateData.source, replica.source_environment)
    }

    if (defaultStorage || updateData.storage.length > 0) {
      payload.replica.storage_mappings = parser
        .getStorageMap(defaultStorage, updateData.storage, storageConfigDefault)
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
