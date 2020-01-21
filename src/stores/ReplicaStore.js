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

import { observable, action, runInAction } from 'mobx'

import notificationStore from '../stores/NotificationStore'
import ReplicaSource from '../sources/ReplicaSource'
import type { MainItem, UpdateData } from '../types/MainItem'
import type { Execution } from '../types/Execution'
import type { Endpoint } from '../types/Endpoint'
import type { Field } from '../types/Field'

class ReplicaStoreUtils {
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

  @action async getReplicas(options?: { showLoading?: boolean, skipLog?: boolean }): Promise<void> {
    this.backgroundLoading = true

    if ((options && options.showLoading) || !this.replicasLoaded) {
      this.loading = true
    }

    try {
      let replicas = await ReplicaSource.getReplicas(options && options.skipLog)
      this.getReplicasSuccess(replicas)
    } finally {
      this.getReplicasDone()
    }
  }

  @action getReplicasSuccess(replicas: MainItem[]) {
    this.replicasLoaded = true
    this.replicas = replicas
  }

  @action getReplicasDone() {
    this.loading = false
    this.backgroundLoading = false
  }

  @action async getReplicaExecutions(replicaId: string, options?: { showLoading?: boolean, skipLog?: boolean }): Promise<void> {
    if (options && options.showLoading) this.executionsLoading = true

    try {
      let executions = await ReplicaSource.getReplicaExecutions(replicaId, options && options.skipLog)
      this.getReplicaExecutionsSuccess(replicaId, executions)
    } finally {
      runInAction(() => { this.executionsLoading = false })
    }
  }

  @action getReplicaExecutionsSuccess(replicaId: string, executions: Execution[]) {
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
  }

  @action async getReplica(replicaId: string, options?: { showLoading?: boolean, skipLog?: boolean }): Promise<void> {
    this.detailsLoading = Boolean(options && options.showLoading)

    try {
      let replica = await ReplicaSource.getReplica(replicaId, options && options.skipLog)
      runInAction(() => {
        this.replicaDetails = replica
        this.replicas = this.replicas.map(r => r.id === replica.id ? replica : r)
      })
    } finally {
      runInAction(() => { this.detailsLoading = false })
    }
  }

  @action async execute(replicaId: string, fields?: Field[]): Promise<void> {
    let execution = await ReplicaSource.execute(replicaId, fields)
    this.executeSuccess(replicaId, execution)
  }

  @action executeSuccess(replicaId: string, execution: Execution) {
    if (this.replicaDetails && this.replicaDetails.id === replicaId) {
      this.replicaDetails = ReplicaStoreUtils.getNewReplica(this.replicaDetails, execution)
    }

    let replicasItemIndex = this.replicas ? this.replicas.findIndex(r => r.id === replicaId) : -1

    if (replicasItemIndex > -1) {
      const updatedReplica = ReplicaStoreUtils.getNewReplica(this.replicas[replicasItemIndex], execution)
      this.replicas[replicasItemIndex] = updatedReplica
    }
  }

  async cancelExecution(replicaId: string, executionId: string): Promise<void> {
    await ReplicaSource.cancelExecution(replicaId, executionId)
    notificationStore.alert('Cancelled', 'success')
  }

  async deleteExecution(replicaId: string, executionId: string): Promise<void> {
    await ReplicaSource.deleteExecution(replicaId, executionId)
    this.deleteExecutionSuccess(replicaId, executionId)
  }

  @action deleteExecutionSuccess(replicaId: string, executionId: string) {
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
  }

  async delete(replicaId: string) {
    await ReplicaSource.delete(replicaId)
    runInAction(() => { this.replicas = this.replicas.filter(r => r.id !== replicaId) })
  }

  async deleteDisks(replicaId: string) {
    let execution = await ReplicaSource.deleteDisks(replicaId)
    this.deleteDisksSuccess(replicaId, execution)
  }

  @action deleteDisksSuccess(replicaId: string, execution: Execution) {
    if (this.replicaDetails && this.replicaDetails.id === replicaId) {
      this.replicaDetails = ReplicaStoreUtils.getNewReplica(this.replicaDetails, execution)
    }

    let replicasItemIndex = this.replicas ? this.replicas.findIndex(r => r.id === replicaId) : -1

    if (replicasItemIndex > -1) {
      const updatedReplica = ReplicaStoreUtils.getNewReplica(this.replicas[replicasItemIndex], execution)
      this.replicas[replicasItemIndex] = updatedReplica
    }
  }

  @action clearDetails() {
    this.detailsLoading = true
    this.replicaDetails = null
  }

  async update(replica: MainItem, destinationEndpoint: Endpoint, updateData: UpdateData, defaultStorage: ?string, storageConfigDefault: string) {
    await ReplicaSource.update(replica, destinationEndpoint, updateData, defaultStorage, storageConfigDefault)
  }
}

export default new ReplicaStore()
