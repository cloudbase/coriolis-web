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

import { observable, action, runInAction } from 'mobx'
import moment from 'moment'

import notificationStore from './NotificationStore'
import ReplicaSource from '../sources/ReplicaSource'
import type { MainItem, UpdateData } from '../@types/MainItem'
import type { Execution } from '../@types/Execution'
import type { Endpoint } from '../@types/Endpoint'
import type { Field } from '../@types/Field'

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

const checkAddExecution = (
  replicas: MainItem[],
  addExecution: { replicaId: string, execution: Execution } | null,
) => {
  const usableAddExecution = addExecution
  if (!usableAddExecution) {
    return
  }
  const executionTime = moment.utc(usableAddExecution.execution.created_at)
    .local().toDate().getTime()
  if (new Date().getTime() - executionTime > 5000) {
    return
  }
  const replica = replicas.find(r => r.id === usableAddExecution.replicaId)
  if (!replica) {
    return
  }
  const execution = replica.executions.find(e => e.id === usableAddExecution.execution.id)
  if (execution) {
    return
  }
  replica.executions.push(usableAddExecution.execution)
}

class ReplicaStore {
  @observable replicas: MainItem[] = []

  @observable loading: boolean = false

  @observable backgroundLoading: boolean = false

  @observable startingExecution: boolean = false

  replicasLoaded: boolean = false

  addExecution: { replicaId: string, execution: Execution } | null = null

  @action async getReplicas(
    options?: { showLoading?: boolean, skipLog?: boolean, quietError?: boolean },
  ): Promise<void> {
    this.backgroundLoading = true

    if ((options && options.showLoading) || !this.replicasLoaded) {
      this.loading = true
    }

    try {
      const replicas = await ReplicaSource
        .getReplicas(options && options.skipLog, options && options.quietError)
      checkAddExecution(replicas, this.addExecution)
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

  @action async execute(replicaId: string, fields?: Field[]): Promise<void> {
    const replica = this.replicas.find(r => r.id === replicaId)
    if (replica && replica.executions && replica.executions.length === 0) {
      this.startingExecution = true
    }
    const execution = await ReplicaSource.execute(replicaId, fields)
    this.executeSuccess(replicaId, execution)
  }

  @action executeSuccess(replicaId: string, execution: Execution) {
    this.addExecution = { replicaId, execution }
    const replicasItemIndex = this.replicas.findIndex(r => r.id === replicaId)

    if (replicasItemIndex > -1) {
      const updatedReplica = ReplicaStoreUtils
        .getNewReplica(this.replicas[replicasItemIndex], execution)
      this.replicas[replicasItemIndex] = updatedReplica
    }
    this.startingExecution = false
  }

  async cancelExecution(
    replicaId: string, executionId: string, force?: boolean | null,
  ): Promise<void> {
    await ReplicaSource.cancelExecution(replicaId, executionId, force)
    if (force) {
      notificationStore.alert('Force cancelled', 'success')
    } else {
      notificationStore.alert('Cancelled', 'success')
    }
  }

  async deleteExecution(replicaId: string, executionId: string): Promise<void> {
    await ReplicaSource.deleteExecution(replicaId, executionId)
    this.deleteExecutionSuccess(replicaId, executionId)
  }

  @action deleteExecutionSuccess(replicaId: string, executionId: string) {
    let executions = []

    const replicasItemIndex = this.replicas ? this.replicas.findIndex(r => r.id === replicaId) : -1

    if (replicasItemIndex > -1) {
      executions = [...this.replicas[replicasItemIndex].executions
        .filter(e => e.id !== executionId)]
      this.replicas[replicasItemIndex].executions = executions
    }
  }

  async delete(replicaId: string) {
    await ReplicaSource.delete(replicaId)
    runInAction(() => { this.replicas = this.replicas.filter(r => r.id !== replicaId) })
  }

  async deleteDisks(replicaId: string) {
    const execution = await ReplicaSource.deleteDisks(replicaId)
    this.deleteDisksSuccess(replicaId, execution)
  }

  @action deleteDisksSuccess(replicaId: string, execution: Execution) {
    const replicasItemIndex = this.replicas.findIndex(r => r.id === replicaId)

    if (replicasItemIndex > -1) {
      const updatedReplica = ReplicaStoreUtils
        .getNewReplica(this.replicas[replicasItemIndex], execution)
      this.replicas[replicasItemIndex] = updatedReplica
    }
  }

  async update(
    replica: MainItem,
    destinationEndpoint: Endpoint,
    updateData: UpdateData,
    defaultStorage: string | null | undefined,
    storageConfigDefault: string,
  ) {
    await ReplicaSource.update(
      replica,
      destinationEndpoint,
      updateData,
      defaultStorage,
      storageConfigDefault,
    )
  }

  getReplicasWithDisks(replicas: MainItem[]): MainItem[] {
    const result = replicas.filter(r => this.hasReplicaDisks(r))
    return result
  }

  hasReplicaDisks(replica?: MainItem | null): boolean {
    if (!replica || !replica.executions || replica.executions.length === 0) {
      return false
    }
    if (!replica.executions.find(e => e.type === 'replica_execution')) {
      return false
    }
    const lastExecution = replica.executions[replica.executions.length - 1]
    if (lastExecution.type === 'replica_disks_delete' && lastExecution.status === 'COMPLETED') {
      return false
    }
    return true
  }
}

export default new ReplicaStore()
