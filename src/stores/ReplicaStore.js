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

import { observable, action } from 'mobx'

import notificationStore from '../stores/NotificationStore'
import ReplicaSource from '../sources/ReplicaSource'
import type { MainItem } from '../types/MainItem'
import type { Execution } from '../types/Execution'
import type { Field } from '../types/Field'

class replicaStoreUtils {
  static getNewReplica(replicaDetails: MainItem, execution: Execution): MainItem {
    if (replicaDetails.executions) {
      return {
        ...replicaDetails,
        executions: [...replicaDetails.executions.filter(e => e.id !== execution.id), execution],
      }
    }

    return {
      ...replicaDetails,
      executions: [execution],
    }
  }
}

class ReplicaStore {
  @observable replicas: MainItem[] = []
  @observable replicaDetails: ?MainItem = null
  @observable loading: boolean = true
  @observable backgroundLoading: boolean = false
  @observable detailsLoading: boolean = true
  @observable executionsLoading: boolean = false

  replicasLoaded: boolean = false

  @action getReplicas(options?: { showLoading: boolean }): Promise<void> {
    this.backgroundLoading = true

    if ((options && options.showLoading) || !this.replicasLoaded) {
      this.loading = true
    }

    return ReplicaSource.getReplicas().then(replicas => {
      this.replicas = replicas
      this.loading = false
      this.backgroundLoading = false
      this.replicasLoaded = true
    }).catch(() => {
      this.loading = false
      this.backgroundLoading = false
    })
  }

  @action getReplicaExecutions(replicaId: string, showLoading: boolean = false): Promise<void> {
    if (showLoading) this.executionsLoading = true

    return ReplicaSource.getReplicaExecutions(replicaId).then(executions => {
      let replica = this.replicas.find(replica => replica.id === replicaId)

      if (replica) {
        replica.executions = executions
      }

      if (this.replicaDetails && this.replicaDetails.id === replicaId) {
        this.replicaDetails = {
          ...this.replicaDetails,
          executions,
        }
      }

      this.executionsLoading = false
    }).catch(() => { this.executionsLoading = false })
  }

  @action getReplica(replicaId: string): Promise<void> {
    this.detailsLoading = true

    return ReplicaSource.getReplica(replicaId).then(replica => {
      this.detailsLoading = false
      this.replicaDetails = replica
    }).catch(() => {
      this.detailsLoading = false
    })
  }

  @action execute(replicaId: string, fields?: Field[]): Promise<void> {
    return ReplicaSource.execute(replicaId, fields).then(execution => {
      if (this.replicaDetails && this.replicaDetails.id === replicaId) {
        this.replicaDetails = replicaStoreUtils.getNewReplica(this.replicaDetails, execution)
      }

      let replicasItemIndex = this.replicas ? this.replicas.findIndex(r => r.id === replicaId) : -1

      if (replicasItemIndex > -1) {
        const updatedReplica = replicaStoreUtils.getNewReplica(this.replicas[replicasItemIndex], execution)
        this.replicas[replicasItemIndex] = updatedReplica
      }
    })
  }

  @action cancelExecution(replicaId: string, executionId: string): Promise<void> {
    return ReplicaSource.cancelExecution(replicaId, executionId).then(() => {
      notificationStore.alert('Cancelled', 'success')
    })
  }

  @action deleteExecution(replicaId: string, executionId: string): Promise<void> {
    return ReplicaSource.deleteExecution(replicaId, executionId).then(() => {
      let executions = []

      if (this.replicaDetails && this.replicaDetails.id === replicaId) {
        if (this.replicaDetails.executions) {
          executions = [...this.replicaDetails.executions.filter(e => e.id !== executionId)]
        }

        this.replicaDetails = {
          ...this.replicaDetails,
          executions,
        }
      }
    })
  }

  @action delete(replicaId: string) {
    return ReplicaSource.delete(replicaId).then(() => {
      this.replicas = this.replicas.filter(r => r.id !== replicaId)
    })
  }

  @action deleteDisks(replicaId: string) {
    return ReplicaSource.deleteDisks(replicaId).then(execution => {
      if (this.replicaDetails && this.replicaDetails.id === replicaId) {
        this.replicaDetails = replicaStoreUtils.getNewReplica(this.replicaDetails, execution)
      }

      let replicasItemIndex = this.replicas ? this.replicas.findIndex(r => r.id === replicaId) : -1

      if (replicasItemIndex > -1) {
        const updatedReplica = replicaStoreUtils.getNewReplica(this.replicas[replicasItemIndex], execution)
        this.replicas[replicasItemIndex] = updatedReplica
      }
    })
  }

  @action clearDetails() {
    this.detailsLoading = true
    this.replicaDetails = null
  }
}

export default new ReplicaStore()
