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
import { MinionPool, MinionPoolDetails } from '@src/@types/MinionPool'
import MinionPoolSource from '@src/sources/MinionPoolSource'
import { Field } from '@src/@types/Field'
import { Providers, ProviderTypes } from '@src/@types/Providers'
import { OptionsSchemaPlugin } from '@src/plugins'
import { providerTypes } from '@src/constants'
import apiCaller from '@src/utils/ApiCaller'
import { Endpoint, OptionValues } from '@src/@types/Endpoint'

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
    optionsPrimaryLoading: boolean = false

  @observable
    optionsSecondaryLoading: boolean = false

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

  private getOptionsValuesLastReqId: string = ''

  async loadOptions(config: {
    endpoint: Endpoint,
    providers: Providers,
    optionsType: 'source' | 'destination',
    envData?: { [prop: string]: any } | null,
    useCache?: boolean,
  }) {
    const {
      optionsType, endpoint, envData, useCache, providers,
    } = config
    const providerType = optionsType === 'source' ? providerTypes.SOURCE_OPTIONS : providerTypes.DESTINATION_OPTIONS

    const providerWithExtraOptions = providers[endpoint.type].types.find(t => t === providerType)
    if (!providerWithExtraOptions) {
      return
    }

    let canceled = false
    apiCaller.cancelRequests(endpoint.id)

    this.optionsPrimaryLoading = !envData
    this.optionsSecondaryLoading = !!envData

    const reqId = `${(endpoint.id)}-${providerType}`
    this.getOptionsValuesLastReqId = reqId

    try {
      const options = await MinionPoolSource.loadOptions({
        optionsType, endpoint, envData, useCache,
      })
      this.getOptionsValuesSuccess(
        endpoint.type,
        options,
        this.getOptionsValuesLastReqId === reqId,
      )
    } catch (err) {
      canceled = err ? err.canceled : false
      throw err
    } finally {
      if (!canceled && this.getOptionsValuesLastReqId === reqId) {
        this.optionsPrimaryLoading = false
        this.optionsSecondaryLoading = false
      }
    }
  }

  @action getOptionsValuesSuccess(
    provider: ProviderTypes,
    options: OptionValues[],
    isValid: boolean,
  ) {
    if (!isValid) {
      return
    }
    this.minionPoolEnvSchema.forEach(field => {
      const parser = OptionsSchemaPlugin.for(provider)
      parser.fillFieldValues({ field, options, requiresWindowsImage: false })
    })
    this.minionPoolEnvSchema = [...this.minionPoolEnvSchema]
  }

  @action
  async update(provider: ProviderTypes, minionPoolData: any) {
    return MinionPoolSource.update({
      data: minionPoolData,
      defaultSchema: this.minionPoolDefaultSchema,
      envSchema: this.minionPoolEnvSchema,
      provider,
    })
  }

  @action
  async add(provider: ProviderTypes, endpointId: string, minionPoolData: any) {
    return MinionPoolSource.add({
      endpointId,
      data: minionPoolData,
      defaultSchema: this.minionPoolDefaultSchema,
      envSchema: this.minionPoolEnvSchema,
      provider,
    })
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
