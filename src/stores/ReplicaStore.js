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

import alt from '../alt'
import ReplicaActions from '../actions/ReplicaActions'
import NotificationActions from '../actions/NotificationActions'

class ReplicaStoreUtils {
  static addExecutionToReplica({ replicaStore, replicaId, execution }) {
    let executions = [execution]

    if (replicaStore.replicaDetails.id === replicaId) {
      if (replicaStore.replicaDetails.executions) {
        executions = [...replicaStore.replicaDetails.executions, execution]
      }

      replicaStore.replicaDetails = {
        ...replicaStore.replicaDetails,
        executions,
      }
    }
  }
}

class ReplicaStore {
  constructor() {
    this.replicas = []
    this.replicaDetails = {}
    this.loading = true
    this.backgroundLoading = false
    this.detailsLoading = true
    this.replicasExecutionsLoading = false

    this.bindListeners({
      handleGetReplicas: ReplicaActions.GET_REPLICAS,
      handleGetReplicasSuccess: ReplicaActions.GET_REPLICAS_SUCCESS,
      handleGetReplicasFailed: ReplicaActions.GET_REPLICAS_FAILED,
      handleGetReplicasExecutions: ReplicaActions.GET_REPLICAS_EXECUTIONS,
      handleGetReplicasExecutionsSuccess: ReplicaActions.GET_REPLICAS_EXECUTIONS_SUCCESS,
      handleGetReplicasExecutionsFailed: ReplicaActions.GET_REPLICAS_EXECUTIONS_FAILED,
      handleGetReplicaExecutionsSuccess: ReplicaActions.GET_REPLICA_EXECUTIONS_SUCCESS,
      handleGetReplica: ReplicaActions.GET_REPLICA,
      handleGetReplicaSuccess: ReplicaActions.GET_REPLICA_SUCCESS,
      handleGetReplicaFailed: ReplicaActions.GET_REPLICA_FAILED,
      handleExecuteSuccess: ReplicaActions.EXECUTE_SUCCESS,
      handleDeleteExecutionSuccess: ReplicaActions.DELETE_EXECUTION_SUCCESS,
      handleDeleteSuccess: ReplicaActions.DELETE_SUCCESS,
      handleDeleteDisksSuccess: ReplicaActions.DELETE_DISKS_SUCCESS,
      handleCancelExecutionSuccess: ReplicaActions.CANCEL_EXECUTION_SUCCESS,
      handleClearDetails: ReplicaActions.CLEAR_DETAILS,
    })
  }

  handleGetReplicas({ showLoading }) {
    this.backgroundLoading = true

    if (showLoading || this.replicas.length === 0) {
      this.loading = true
    }
  }

  handleGetReplicasSuccess(replicas) {
    this.replicas = replicas
    this.loading = false
    this.backgroundLoading = false
  }

  handleGetReplicasFailed() {
    this.loading = false
    this.backgroundLoading = false
  }

  handleGetReplicasExecutions() {
    this.replicasExecutionsLoading = true
  }

  handleGetReplicasExecutionsSuccess(replicasExecutions) {
    replicasExecutions.forEach(({ replicaId, executions }) => {
      let replica = this.replicas.find(replica => replica.id === replicaId)
      if (replica) {
        replica.executions = executions
      }
    })

    this.replicasExecutionsLoading = false
  }

  handleGetReplicasExecutionsFailed() {
    this.replicasExecutionsLoading = false
  }

  handleGetReplicaExecutionsSuccess({ replicaId, executions }) {
    let replica = this.replicas.find(replica => replica.id === replicaId)

    if (replica) {
      replica.executions = executions
    }

    if (this.replicaDetails.id === replicaId) {
      this.replicaDetails = {
        ...this.replicaDetails,
        executions,
      }
    }
  }

  handleGetReplica() {
    this.detailsLoading = true
  }

  handleGetReplicaSuccess(replica) {
    this.detailsLoading = false
    this.replicaDetails = replica
  }

  handleGetReplicaFailed() {
    this.detailsLoading = false
  }

  handleExecuteSuccess({ replicaId, execution }) {
    ReplicaStoreUtils.addExecutionToReplica({ replicaStore: this, replicaId, execution })
  }

  handleDeleteDisksSuccess({ replicaId, execution }) {
    ReplicaStoreUtils.addExecutionToReplica({ replicaStore: this, replicaId, execution })
  }

  handleDeleteExecutionSuccess({ replicaId, executionId }) {
    let executions = []

    if (this.replicaDetails.id === replicaId) {
      if (this.replicaDetails.executions) {
        executions = [...this.replicaDetails.executions.filter(e => e.id !== executionId)]
      }

      this.replicaDetails = {
        ...this.replicaDetails,
        executions,
      }
    }
  }

  handleDeleteSuccess(replicaId) {
    this.replicas = this.replicas.filter(r => r.id !== replicaId)
  }

  handleCancelExecutionSuccess() {
    setTimeout(() => { NotificationActions.notify('Cancelled', 'success') }, 0)
  }

  handleClearDetails() {
    this.detailsLoading = true
    this.replicaDetails = {}
  }
}

export default alt.createStore(ReplicaStore)
