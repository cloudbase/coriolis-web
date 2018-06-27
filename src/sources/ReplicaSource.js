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

import cookie from 'js-cookie'
import moment from 'moment'

import Api from '../utils/ApiCaller'

import { servicesUrl } from '../config'
import type { MainItem } from '../types/MainItem'
import type { Execution } from '../types/Execution'
import type { Field } from '../types/Field'

class ReplicaSourceUtils {
  static filterDeletedExecutionsInReplicas(replicas) {
    return replicas.map(replica => {
      replica.executions = ReplicaSourceUtils.filterDeletedExecutions(replica.executions)
      return replica
    })
  }

  static filterDeletedExecutions(executions) {
    if (!executions || !executions.length) {
      return executions
    }

    return executions.filter(execution => execution.deleted_at === null || execution.deleted_at === undefined)
  }

  static sortReplicas(replicas) {
    if (replicas.length === 1) {
      ReplicaSourceUtils.sortExecutions(replicas[0].executions)
      return
    }

    replicas.sort((a, b) => {
      ReplicaSourceUtils.sortExecutions(a.executions)
      ReplicaSourceUtils.sortExecutions(b.executions)
      let aLastExecution = a.executions && a.executions.length ? a.executions[a.executions.length - 1] : null
      let bLastExecution = b.executions && b.executions.length ? b.executions[b.executions.length - 1] : null
      let aLastTime = aLastExecution ? aLastExecution.updated_at || aLastExecution.created_at : null
      let bLastTime = bLastExecution ? bLastExecution.updated_at || bLastExecution.created_at : null
      let aTime = aLastTime || a.updated_at || a.created_at
      let bTime = bLastTime || b.updated_at || b.created_at
      return moment(bTime).diff(moment(aTime))
    })
  }

  static sortExecutions(executions) {
    if (executions) {
      executions.sort((a, b) => a.number - b.number)
    }
  }

  static sortExecutionsAndTaskUpdates(executions) {
    this.sortExecutions(executions)
    executions.forEach(execution => {
      this.sortTaskUpdates(execution)
    })
  }

  static sortTaskUpdates(execution) {
    if (execution.tasks) {
      execution.tasks.forEach(task => {
        if (task.progress_updates) {
          task.progress_updates.sort((a, b) => moment(b.created_at).isBefore(moment(a.created_at)))
        }
      })
    }
  }
}

class ReplicaSource {
  static getReplicas(): Promise<MainItem[]> {
    let projectId = cookie.get('projectId') || 'undefined'
    return Api.get(`${servicesUrl.coriolis}/${projectId}/replicas/detail`).then(response => {
      let replicas = response.data.replicas
      replicas = ReplicaSourceUtils.filterDeletedExecutionsInReplicas(replicas)
      ReplicaSourceUtils.sortReplicas(replicas)
      return replicas
    })
  }

  static getReplicaExecutions(replicaId: string): Promise<Execution[]> {
    let projectId = cookie.get('projectId') || 'undefined'
    return Api.get(`${servicesUrl.coriolis}/${projectId}/replicas/${replicaId}/executions/detail`).then((response) => {
      let executions = response.data.executions
      ReplicaSourceUtils.sortExecutionsAndTaskUpdates(executions)

      return executions
    })
  }

  static getReplica(replicaId: string): Promise<MainItem> {
    let projectId = cookie.get('projectId') || 'undefined'

    return Api.get(`${servicesUrl.coriolis}/${projectId}/replicas/${replicaId}`).then(response => {
      let replica = response.data.replica
      replica.executions = ReplicaSourceUtils.filterDeletedExecutions(replica.executions)
      ReplicaSourceUtils.sortExecutions(replica.executions)
      return replica
    })
  }

  static execute(replicaId: string, fields?: Field[]): Promise<Execution> {
    let payload = { execution: { shutdown_instances: false } }
    if (fields) {
      fields.forEach(f => {
        payload.execution[f.name] = f.value || false
      })
    }
    let projectId = cookie.get('projectId') || 'undefined'

    return Api.send({
      url: `${servicesUrl.coriolis}/${projectId}/replicas/${replicaId}/executions`,
      method: 'POST',
      data: payload,
    }).then((response) => {
      let execution = response.data.execution
      ReplicaSourceUtils.sortTaskUpdates(execution)
      return execution
    })
  }

  static cancelExecution(replicaId: string, executionId: string): Promise<string> {
    let projectId = cookie.get('projectId')

    return Api.send({
      url: `${servicesUrl.coriolis}/${projectId || 'null'}/replicas/${replicaId}/executions/${executionId}/actions`,
      method: 'POST',
      data: { cancel: null },
    }).then(() => replicaId)
  }

  static deleteExecution(replicaId: string, executionId: string): Promise<string> {
    let projectId = cookie.get('projectId')

    return Api.send({
      url: `${servicesUrl.coriolis}/${projectId || 'null'}/replicas/${replicaId}/executions/${executionId}`,
      method: 'DELETE',
    }).then(() => replicaId)
  }

  static delete(replicaId: string): Promise<string> {
    let projectId = cookie.get('projectId')

    return Api.send({
      url: `${servicesUrl.coriolis}/${projectId || 'null'}/replicas/${replicaId}`,
      method: 'DELETE',
    }).then(() => replicaId)
  }

  static deleteDisks(replicaId: string): Promise<Execution> {
    let projectId = cookie.get('projectId')

    return Api.send({
      url: `${servicesUrl.coriolis}/${projectId || 'null'}/replicas/${replicaId}/actions`,
      method: 'POST',
      data: { 'delete-disks': null },
    }).then(response => response.data.execution)
  }
}

export default ReplicaSource

