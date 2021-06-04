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

import notificationStore from './NotificationStore'
import ReplicaSource from '../sources/ReplicaSource'
import type {
  UpdateData, ReplicaItem, ReplicaItemDetails,
} from '../@types/MainItem'
import type { Execution, ExecutionTasks } from '../@types/Execution'
import type { Endpoint } from '../@types/Endpoint'
import type { Field } from '../@types/Field'
import apiCaller from '../utils/ApiCaller'

class ReplicaStoreUtils {
  static getNewReplica(
    replicaDetails: ReplicaItemDetails,
    execution: Execution,
  ): ReplicaItemDetails {
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
  @observable replicas: ReplicaItem[] = []

  @observable loading: boolean = false

  @observable replicaDetails: ReplicaItemDetails | null = null

  @observable replicaDetailsLoading: boolean = false

  @observable executionsTasks: ExecutionTasks[] = []

  @observable executionsTasksLoading: boolean = false

  @observable backgroundLoading: boolean = false

  @observable startingExecution: boolean = false

  @observable replicasWithDisks: ReplicaItemDetails[] = []

  @observable replicasWithDisksLoading: boolean = false

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
      this.getReplicasSuccess(replicas)
    } finally {
      this.getReplicasDone()
    }
  }

  @action cancelReplicaDetails() {
    if (this.replicaDetails?.id) {
      apiCaller.cancelRequests(this.replicaDetails?.id)
    }
    this.replicaDetailsLoading = false
  }

  @action async getReplicaDetails(options: {
    replicaId: string, showLoading?: boolean, polling?: boolean,
  }) {
    const { replicaId, showLoading, polling } = options

    if (showLoading) {
      this.replicaDetailsLoading = true
    }

    try {
      const replica = await ReplicaSource.getReplicaDetails({ replicaId, polling })

      runInAction(() => {
        this.replicaDetails = replica
      })
    } finally {
      runInAction(() => {
        this.replicaDetailsLoading = false
      })
    }
  }

  @action clearDetails() {
    this.replicaDetails = null
  }

  @action getReplicasSuccess(replicas: ReplicaItem[]) {
    this.replicasLoaded = true
    this.replicas = replicas
  }

  @action getReplicasDone() {
    this.loading = false
    this.backgroundLoading = false
  }

  private currentlyLoadingExecution: string = ''

  @action async getExecutionTasks(
    options: {
      replicaId: string,
      executionId?: string,
      polling?: boolean,
    },
  ) {
    const {
      replicaId, executionId, polling,
    } = options

    if (!polling && this.currentlyLoadingExecution === executionId) {
      return
    }
    this.currentlyLoadingExecution = polling ? this.currentlyLoadingExecution : executionId || ''
    if (!this.currentlyLoadingExecution) {
      return
    }

    if (!this.executionsTasks.find(e => e.id === this.currentlyLoadingExecution)) {
      this.executionsTasksLoading = true
    }

    try {
      const executionTasks = await ReplicaSource.getExecutionTasks({
        replicaId,
        executionId: this.currentlyLoadingExecution,
        polling,
      })
      runInAction(() => {
        this.executionsTasks = [
          ...this.executionsTasks.filter(e => e.id !== this.currentlyLoadingExecution),
          executionTasks,
        ]
      })
    } catch (err) {
      console.error(err)
    } finally {
      runInAction(() => {
        this.executionsTasksLoading = false
      })
    }
  }

  @action async execute(replicaId: string, fields?: Field[]): Promise<void> {
    this.startingExecution = true

    const execution = await ReplicaSource.execute(replicaId, fields)
    this.executeSuccess(replicaId, execution)
  }

  @action executeSuccess(replicaId: string, execution: Execution) {
    if (this.replicaDetails?.id === replicaId) {
      const updatedReplica = ReplicaStoreUtils
        .getNewReplica(this.replicaDetails, execution)
      this.replicaDetails = updatedReplica
    }
    this.getExecutionTasks({ replicaId, executionId: execution.id })

    this.startingExecution = false
  }

  async cancelExecution(
    options: {replicaId: string, executionId?: string, force?: boolean},
  ): Promise<void> {
    await ReplicaSource.cancelExecution(options)
    if (options.force) {
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

    if (this.replicaDetails?.id === replicaId) {
      executions = [...this.replicaDetails.executions.filter(e => e.id !== executionId)]
      this.replicaDetails.executions = executions
    }
    if (executionId === this.currentlyLoadingExecution) {
      this.currentlyLoadingExecution = ''
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
    if (this.replicaDetails?.id === replicaId) {
      const updatedReplica = ReplicaStoreUtils
        .getNewReplica(this.replicaDetails, execution)
      this.replicaDetails = updatedReplica
    }
  }

  async update(options: {
    replica: ReplicaItemDetails,
    sourceEndpoint: Endpoint,
    destinationEndpoint: Endpoint,
    updateData: UpdateData,
    defaultStorage: { value: string | null, busType?: string | null },
    storageConfigDefault: string,
  }) {
    await ReplicaSource.update(options)
  }

  testReplicaHasDisks(replica: ReplicaItemDetails | null) {
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

  @action
  async loadHaveReplicasDisks(replicas: ReplicaItem[]) {
    this.replicasWithDisksLoading = true

    try {
      const replicaDetails = await Promise.all(replicas
        .map(replica => ReplicaSource.getReplicaDetails({ replicaId: replica.id })))

      runInAction(() => {
        this.replicasWithDisks = replicaDetails.filter(r => this.testReplicaHasDisks(r))
      })
    } finally {
      runInAction(() => {
        this.replicasWithDisksLoading = false
      })
    }
  }
}

export default new ReplicaStore()
