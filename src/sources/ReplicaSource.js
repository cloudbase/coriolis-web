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

import cookie from 'js-cookie'
import moment from 'moment'

import Api from '../utils/ApiCaller'

import { servicesUrl } from '../config'

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
          task.progress_updates.sort((a, b) => moment(a.created_at).isBefore(moment(b.created_at)))
        }
      })
    }
  }
}

class ReplicaSource {
  static getReplicas() {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/replicas/detail`,
        method: 'GET',
      }).then(response => {
        let replicas = response.data.replicas
        replicas = ReplicaSourceUtils.filterDeletedExecutionsInReplicas(replicas)
        ReplicaSourceUtils.sortReplicas(replicas)
        resolve(replicas)
      }, reject).catch(reject)
    })
  }

  static getReplicaExecutions(replicaId) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/replicas/${replicaId}/executions/detail`,
        method: 'GET',
      }).then((response) => {
        let executions = response.data.executions
        ReplicaSourceUtils.sortExecutionsAndTaskUpdates(executions)

        resolve({ replicaId, executions })
      }, reject).catch(reject)
    })
  }

  static getReplica(replicaId) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/replicas/${replicaId}`,
        method: 'GET',
      }).then(response => {
        let replica = response.data.replica
        replica.executions = ReplicaSourceUtils.filterDeletedExecutions(replica.executions)
        ReplicaSourceUtils.sortExecutions(replica.executions)
        resolve(replica)
      }, reject).catch(reject)
    })
  }

  static execute(replicaId, fields) {
    return new Promise((resolve, reject) => {
      let payload = { execution: { shutdown_instances: false } }
      if (fields) {
        fields.forEach(f => {
          payload.execution[f.name] = f.value || false
        })
      }
      let projectId = cookie.get('projectId')

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/replicas/${replicaId}/executions`,
        method: 'POST',
        data: payload,
      }).then((response) => {
        let execution = response.data.execution
        ReplicaSourceUtils.sortTaskUpdates(execution)
        resolve({ replicaId, execution })
      }, reject).catch(reject)
    })
  }

  static cancelExecution(replicaId, executionId) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/replicas/${replicaId}/executions/${executionId}/actions`,
        method: 'POST',
        data: { cancel: null },
      }).then(() => {
        resolve(replicaId, executionId)
      }, reject).catch(reject)
    })
  }

  static deleteExecution(replicaId, executionId) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/replicas/${replicaId}/executions/${executionId}`,
        method: 'DELETE',
      }).then(() => {
        resolve(replicaId, executionId)
      }, reject).catch(reject)
    })
  }

  static delete(replicaId) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/replicas/${replicaId}`,
        method: 'DELETE',
      }).then(() => { resolve(replicaId) }, reject).catch(reject)
    })
  }

  static deleteDisks(replicaId) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/replicas/${replicaId}/actions`,
        method: 'POST',
        data: { 'delete-disks': null },
      }).then(response => {
        resolve(response.data.execution)
      }, reject).catch(reject)
    })
  }
}

export default ReplicaSource

