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

export type MinionPoolAction = 'allocate' | 'deallocate' | 'refresh'

export const MinionPoolStoreUtils = {
  isActive: (minionPool: MinionPool) => minionPool.status === 'ALLOCATED' || minionPool.status === 'SCALING' || minionPool.status === 'RESCALING',
}

class MinionPoolStore {
  @observable
  loadingMinionPools: boolean = false

  @observable
  minionPools: MinionPool[] = []

  @observable
  loadingMinionPoolDetails: boolean = false

  @observable
  minionPoolDetails: MinionPoolDetails | null = null

  @observable
  loadingMinionPoolSchema: boolean = false

  @observable
  minionPoolDefaultSchema: Field[] = []

  @observable
  minionPoolEnvSchema: Field[] = []

  @observable
  loadingEnvOptions: boolean = false

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
      const minionPool = await MinionPoolSource.loadMinionPoolDetails(
        id,
        { skipLog: options?.skipLog },
      )

      runInAction(() => {
        this.minionPoolDetails = minionPool
      })
    } finally {
      runInAction(() => {
        this.loadingMinionPoolDetails = false
      })
    }
  }

  @action clearMinionPoolDetails() {
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
  async runAction(minionPoolId: string, minionPoolAction: MinionPoolAction, actionOptions?: any) {
    return MinionPoolSource.runAction(minionPoolId, minionPoolAction, actionOptions)
  }

  async deleteMinionPool(minionPoolId: string) {
    return MinionPoolSource.deleteMinionPool(minionPoolId)
  }
}

export default new MinionPoolStore()
