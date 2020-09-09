/*
Copyright (C) 2020  Cloudbase Solutions SRL
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

import {
  action, observable, runInAction, computed,
} from 'mobx'
import { MinionPool, MinionPoolDetails } from '../@types/MinionPool'
import MinionPoolSource from '../sources/MinionPoolSource'
import { Field } from '../@types/Field'
import { ProviderTypes } from '../@types/Providers'
import { OptionsSchemaPlugin } from '../plugins/endpoint'
import { ExecutionTasks } from '../@types/Execution'

export type MinionPoolAction = 'set-up-shared-resources' | 'allocate-machines' | 'deallocate-machines' | 'tear-down-shared-resources'

class MinionPoolStore {
  @observable
  loadingMinionPools: boolean = false

  @observable
  minionPools: MinionPool[] = []

  @observable
  loadingMinionPoolSchema: boolean = false

  @observable
  minionPoolDefaultSchema: Field[] = []

  @observable
  minionPoolEnvSchema: Field[] = []

  @observable
  loadingMinionPoolDetails: boolean = false

  @observable
  minionPoolDetails: MinionPoolDetails | null = null

  @observable
  loadingEnvOptions: boolean = false

  @observable
  executionsTasks: ExecutionTasks[] = []

  @observable
  loadingExecutionsTasks: boolean = false

  @computed
  get minionPoolCombinedSchema() {
    return this.minionPoolDefaultSchema.concat(this.minionPoolEnvSchema)
  }

  @action
  async loadMinionPools(options?: { showLoading?: boolean, skipLog?: boolean }) {
    if (options?.showLoading) {
      this.loadingMinionPools = true
    }

    try {
      const minionPools = await MinionPoolSource.loadMinionPools({ skipLog: options?.skipLog })

      runInAction(() => {
        this.minionPools = minionPools
      })
    } finally {
      runInAction(() => {
        this.loadingMinionPools = false
      })
    }
  }

  @action
  async loadMinionPoolDetails(id: string, options?: { showLoading?: boolean, skipLog?: boolean }) {
    if (options?.showLoading) {
      this.loadingMinionPoolDetails = true
    }
    try {
      const minionPoolDetails = await MinionPoolSource.getMinionPoolDetails(
        id,
        { skipLog: options?.skipLog },
      )

      runInAction(() => {
        this.minionPoolDetails = minionPoolDetails
      })
    } finally {
      runInAction(() => {
        this.loadingMinionPoolDetails = false
      })
    }
  }

  @action
  clearMinionPoolDetails() {
    this.minionPoolDetails = null
  }

  @action
  async loadMinionPoolSchema(provider: ProviderTypes, platform: 'source' | 'destination') {
    this.loadingMinionPoolSchema = true

    this.minionPoolDefaultSchema = MinionPoolSource.getMinionPoolDefaultSchema()

    try {
      const schema = await MinionPoolSource.loadMinionPoolSchema(provider, platform)

      runInAction(() => {
        this.minionPoolEnvSchema = schema
      })
    } finally {
      runInAction(() => {
        this.loadingMinionPoolSchema = false
      })
    }
  }

  @action
  async loadEnvOptions(
    endpointId: string,
    providerName: ProviderTypes,
    platform: 'source' | 'destination',
    opts?: { useCache?: boolean },
  ) {
    this.loadingEnvOptions = true

    try {
      const options = await MinionPoolSource.loadEnvOptions(endpointId, platform, opts?.useCache)

      runInAction(() => {
        this.minionPoolEnvSchema.forEach(field => {
          const parser = OptionsSchemaPlugin.for(providerName)
          parser.fillFieldValues(field, options)
        })
      })
    } finally {
      runInAction(() => {
        this.loadingEnvOptions = false
      })
    }
  }

  @action
  async update(minionPoolData: any) {
    return MinionPoolSource.update(
      minionPoolData,
      this.minionPoolDefaultSchema,
      this.minionPoolEnvSchema,
    )
  }

  @action
  async add(endpointId: string, minionPoolData: any) {
    return MinionPoolSource.add(
      endpointId,
      minionPoolData,
      this.minionPoolDefaultSchema,
      this.minionPoolEnvSchema,
    )
  }

  @action
  async runAction(minionPoolId: string, minionPoolAction: MinionPoolAction) {
    return MinionPoolSource.runAction(minionPoolId, minionPoolAction)
  }

  @action
  async cancelExecution(minionPoolId: string, force?: boolean, executionId?: string) {
    return MinionPoolSource.cancelExecution(minionPoolId, force, executionId)
  }

  async deleteMinionPool(minionPoolId: string) {
    return MinionPoolSource.deleteMinionPool(minionPoolId)
  }

  private currentlyLoadingExecution: string = ''

  @action
  async loadExecutionTasks(
    options: {
      minionPoolId: string,
      executionId?: string,
      skipLog?: boolean,
    },
  ) {
    const {
      minionPoolId, executionId, skipLog,
    } = options

    if (!skipLog && this.currentlyLoadingExecution === executionId) {
      return
    }
    this.currentlyLoadingExecution = skipLog ? this.currentlyLoadingExecution : executionId || ''
    if (!this.currentlyLoadingExecution) {
      return
    }

    if (!this.executionsTasks.find(e => e.id === this.currentlyLoadingExecution)) {
      this.loadingExecutionsTasks = true
    }

    try {
      const executionTasks = await MinionPoolSource.getExecutionTasks({
        minionPoolId, executionId: this.currentlyLoadingExecution, skipLog,
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
        this.loadingExecutionsTasks = false
      })
    }
  }
}

export default new MinionPoolStore()
