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

import alt from '../alt'

import ReplicaSource from '../sources/ReplicaSource'

class ReplicaActions {
  getReplicas(options) {
    return {
      ...options,
      promise: ReplicaSource.getReplicas().then(
        response => { this.getReplicasSuccess(response) },
        response => { this.getReplicasFailed(response) },
      ),
    }
  }

  getReplicasSuccess(replicas) {
    return replicas || true
  }

  getReplicasFailed(response) {
    return response || true
  }

  getReplicasExecutions(replicas) {
    let count = 0
    let replicasExecutions = []
    replicas.forEach(replica => {
      ReplicaSource.getReplicaExecutions(replica.id).then(
        response => {
          count += 1
          replicasExecutions.push(response)

          if (count === replicas.length) {
            this.getReplicasExecutionsSuccess(replicasExecutions)
          }
        },
        response => {
          count += 1
          if (count === replicas.length) {
            if (replicasExecutions.length > 0) {
              this.getReplicasExecutionsSuccess(replicasExecutions)
            } else {
              this.getReplicasExecutionsFailed(response)
            }
          }
        },
      )
    })

    return replicas
  }

  getReplicasExecutionsSuccess(replicasExecutions) {
    return replicasExecutions
  }

  getReplicasExecutionsFailed(response) {
    return response || true
  }

  getReplicaExecutions(replicaId) {
    return {
      replicaId,
      promise: ReplicaSource.getReplicaExecutions(replicaId).then(
        response => { this.getReplicaExecutionsSuccess(response) },
        response => { this.getReplicaExecutionsFailed(response) },
      ),
    }
  }

  getReplicaExecutionsSuccess({ replicaId, executions }) {
    return { replicaId, executions }
  }

  getReplicaExecutionsFailed(response) {
    return response || true
  }

  getReplica(replicaId) {
    ReplicaSource.getReplica(replicaId).then(
      replica => { this.getReplicaSuccess(replica) },
      response => { this.getReplicaFailed(response) },
    )

    return replicaId
  }

  getReplicaSuccess(replica) {
    return replica
  }

  getReplicaFailed(response) {
    return response || true
  }

  execute(replicaId, fields) {
    ReplicaSource.execute(replicaId, fields).then(
      executions => { this.executeSuccess(executions) },
      response => { this.executeFailed(response) },
    )

    return replicaId
  }

  executeSuccess({ replicaId, execution }) {
    return { replicaId, execution }
  }

  executeFailed(response) {
    return response || true
  }

  cancelExecution(replicaId, executionId) {
    ReplicaSource.cancelExecution(replicaId, executionId).then(
      () => { this.cancelExecutionSuccess(replicaId, executionId) },
      response => { this.cancelExecutionFailed(response) },
    )

    return { replicaId, executionId }
  }

  cancelExecutionSuccess(replicaId, executionId) {
    return { replicaId, executionId }
  }

  cancelExecutionFailed(response) {
    return response || true
  }

  deleteExecution(replicaId, executionId) {
    ReplicaSource.deleteExecution(replicaId, executionId).then(
      () => { this.deleteExecutionSuccess(replicaId, executionId) },
      response => { this.deleteExecutionFailed(response) },
    )

    return { replicaId, executionId }
  }

  deleteExecutionSuccess(replicaId, executionId) {
    return { replicaId, executionId }
  }

  deleteExecutionFailed(response) {
    return response || true
  }

  delete(replicaId) {
    ReplicaSource.delete(replicaId).then(
      () => { this.deleteSuccess(replicaId) },
      response => { this.deleteFailed(response) },
    )
    return replicaId
  }

  deleteSuccess(replicaId) {
    return replicaId
  }

  deleteFailed(response) {
    return response || true
  }

  clearDetails() {
    return true
  }

  deleteDisks(replicaId) {
    ReplicaSource.deleteDisks(replicaId).then(
      execution => { this.deleteDisksSuccess(replicaId, execution) },
      response => { this.deleteDisksFailed(response) },
    )
    return replicaId
  }

  deleteDisksSuccess(replicaId, execution) {
    return { replicaId, execution }
  }

  deleteDisksFailed(execution) {
    return execution || true
  }
}

export default alt.createActions(ReplicaActions)
