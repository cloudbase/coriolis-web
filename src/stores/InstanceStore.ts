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

import {
  observable, runInAction, computed, action,
} from 'mobx'

import type { Instance } from '../@types/Instance'
import type { Endpoint } from '../@types/Endpoint'
import InstanceSource from '../sources/InstanceSource'
import ApiCaller from '../utils/ApiCaller'
import configLoader from '../utils/Config'
import { ProviderTypes } from '../@types/Providers'

class InstanceStore {
  @observable instancesLoading = false

  @observable instancesPerPage = 6

  @observable currentPage = 1

  @observable searchChunksLoading = false

  @observable searchedInstances: Instance[] = []

  @observable backgroundInstances: Instance[] = []

  @observable backgroundChunksLoading = false

  @observable searching = false

  @observable searchNotFound = false

  @observable reloading = false

  @observable instancesDetails: Instance[] = []

  @observable loadingInstancesDetails = false

  @observable instancesDetailsCount = 0

  @observable instancesDetailsRemaining = 0

  @observable searchText = ''

  @computed get instances(): Instance[] {
    if (this.searchText && this.searchedInstances.length > 0) {
      return this.searchedInstances
    }
    return this.backgroundInstances
  }

  @computed get chunksLoading(): boolean {
    if (this.searchText) {
      return this.searchChunksLoading
    }
    return this.backgroundChunksLoading
  }

  lastEndpointId?: string

  reqId!: number

  @action async loadInstancesInChunks(options: {
    endpoint: Endpoint,
    vmsPerPage?: number,
    reload?: boolean,
    env?: any,
    useCache?: boolean,
  }) {
    const {
      endpoint, vmsPerPage, reload, env, useCache,
    } = options
    const usableVmsPerPage = vmsPerPage || 6

    ApiCaller.cancelRequests(`${endpoint.id}-chunk`)

    this.backgroundInstances = []
    if (reload) {
      this.reloading = true
    } else {
      this.instancesLoading = true
    }
    this.backgroundChunksLoading = true
    this.lastEndpointId = endpoint.id
    const chunkSize = configLoader.config.instancesListBackgroundLoading
    const chunkCount = Math.max(chunkSize[endpoint.type] || chunkSize.default, usableVmsPerPage)

    const loadNextChunk = async (lastEndpointId?: string) => {
      const currentEndpointId = endpoint.id
      const instances = await InstanceSource.loadInstancesChunk(currentEndpointId, chunkCount, lastEndpointId, `${endpoint.id}-chunk`, undefined, env, useCache)
      if (currentEndpointId !== this.lastEndpointId) {
        return
      }
      const shouldContinue = this.loadInstancesInChunksSuccess(instances, chunkCount, reload)
      if (shouldContinue) {
        loadNextChunk(instances[instances.length - 1].id)
      }
    }
    loadNextChunk()
  }

  @action loadInstancesInChunksSuccess(
    instances: Instance[], chunkCount: number, reload?: boolean,
  ): boolean {
    this.backgroundInstances = [...this.backgroundInstances, ...instances]
    if (reload) {
      this.reloading = false
    }
    this.instancesLoading = false

    if (instances.length < chunkCount) {
      this.backgroundChunksLoading = false
      return false
    }
    return true
  }

  @action async loadInstances(endpointId: string): Promise<void> {
    this.instancesLoading = true
    this.lastEndpointId = endpointId

    try {
      const instances = await InstanceSource.loadInstances(endpointId, true)
      if (endpointId !== this.lastEndpointId) {
        return
      }
      this.loadInstancesSuccess(instances)
    } catch (ex) {
      if (endpointId !== this.lastEndpointId) {
        return
      }
      runInAction(() => { this.instancesLoading = false })
      throw ex
    }
  }

  @action loadInstancesSuccess(instances: Instance[]) {
    this.backgroundInstances = instances
    this.instancesLoading = false
  }

  @action async searchInstances(endpoint: Endpoint, searchText: string) {
    ApiCaller.cancelRequests(`${endpoint.id}-chunk-search`)

    this.searchText = searchText
    this.searchNotFound = false

    if (!searchText) {
      this.currentPage = 1
      this.searchedInstances = []
      return
    }

    if (!this.backgroundChunksLoading) {
      this.searchedInstances = this.backgroundInstances
        .filter(i => (i.instance_name || i.name)
          .toLowerCase().indexOf(searchText.toLowerCase()) > -1)
      this.searchNotFound = Boolean(this.searchedInstances.length === 0)
      this.currentPage = 1
      return
    }

    this.searching = true
    this.searchChunksLoading = true

    const chunkSize = configLoader.config.instancesListBackgroundLoading
    const chunkCount = Math
      .max(chunkSize[endpoint.type] || chunkSize.default, this.instancesPerPage)

    const loadNextChunk = async (lastEndpointId?: string) => {
      const instances = await InstanceSource.loadInstancesChunk(
        endpoint.id,
        chunkCount,
        lastEndpointId,
        `${endpoint.id}-chunk-search`,
        searchText,
      )
      if (this.searching) {
        runInAction(() => {
          this.currentPage = 1
          this.searchedInstances = []
        })
      }
      const shouldContinue = this.searchInstancesSuccess(instances, chunkCount)
      if (shouldContinue) {
        loadNextChunk(instances[instances.length - 1].id)
      }
    }
    loadNextChunk()
  }

  @action searchInstancesSuccess(instances: Instance[], chunkCount: number): boolean {
    this.searchedInstances = [...this.searchedInstances, ...instances]
    this.searching = false
    this.searchNotFound = Boolean(this.searchedInstances.length === 0)
    if (instances.length < chunkCount) {
      this.searchChunksLoading = false
      return false
    }
    return true
  }

  @action reloadInstances(endpoint: Endpoint, chunkSize?: number, env?: any) {
    this.searchNotFound = false
    this.searchText = ''
    this.currentPage = 1
    this.loadInstancesInChunks({
      endpoint, vmsPerPage: chunkSize, reload: true, env,
    })
  }

  @action cancelIntancesChunksLoading() {
    ApiCaller.cancelRequests(`${this.lastEndpointId}-chunk`)
    this.lastEndpointId = ''
    this.searchNotFound = false
    this.searchText = ''
    this.currentPage = 1
  }

  @action setPage(page: number) {
    this.currentPage = page
  }

  @action updateInstancesPerPage(instancesPerPage: number) {
    this.currentPage = 1
    this.instancesPerPage = instancesPerPage
  }

  @action async loadInstancesDetailsBulk(
    instanceInfos: {
      endpointId: string,
      instanceNames: string[],
      env?: any,
    }[],
  ) {
    this.reqId = !this.reqId ? 1 : this.reqId + 1
    this.instancesDetails = []
    this.loadingInstancesDetails = true
    InstanceSource.cancelInstancesDetailsRequests(this.reqId - 1)
    try {
      await Promise.all(instanceInfos.map(async i => {
        await Promise.all(i.instanceNames.map(async name => {
          const instanceDetails = await InstanceSource.loadInstanceDetails({
            endpointId: i.endpointId,
            instanceName: name,
            reqId: this.reqId,
            quietError: false,
            env: i.env,
            cache: true,
          })
          const instance = instanceDetails.instance
          if (!instance) {
            return
          }
          runInAction(() => {
            this.instancesDetails = this.instancesDetails.filter(id => (id.name || id.instance_name || '') !== name)
            this.instancesDetails.push(instance)
            this.instancesDetails.sort(n => (n.name || n.instance_name || '')
              .localeCompare(n.name || n.instance_name || ''))
          })
        }))
      }))
    } finally {
      this.loadingInstancesDetails = false
    }
  }

  @action async addInstanceDetails(opts: {
    endpointId: string,
    instanceInfo: {name: string, instance_name?: string | null},
    cache?: boolean,
    quietError?: boolean,
    env?: any,
    targetProvider: ProviderTypes,
  }) {
    const {
      endpointId, instanceInfo, cache, quietError, env, targetProvider,
    } = opts
    this.loadingInstancesDetails = true
    const resp = await InstanceSource.loadInstanceDetails({
      endpointId,
      instanceName: instanceInfo.instance_name || instanceInfo.name,
      targetProvider,
      reqId: this.reqId,
      quietError,
      env,
      cache,
    })
    const instance = resp.instance
    if (!instance) {
      return
    }

    runInAction(() => {
      this.loadingInstancesDetails = false
      if (this.instancesDetails.find(i => i.id === instance.id)) {
        this.instancesDetails = this.instancesDetails.filter(i => i.id !== instance.id)
      }
      this.instancesDetails = [
        ...this.instancesDetails,
        instance,
      ]
      this.instancesDetails
        .sort((a, b) => (a.instance_name || a.name).localeCompare((b.instance_name || b.name)))
    })
  }

  @action removeInstanceDetails(instance: Instance) {
    this.instancesDetails = this.instancesDetails.filter(i => i.id !== instance.id)
  }

  @action async loadInstancesDetails(opts: {
    endpointId: string,
    instancesInfo: {name: string, instance_name?: string | null}[],
    cache?: boolean,
    quietError?: boolean,
    skipLog?: boolean,
    env?: any,
    targetProvider?: ProviderTypes | null,
  }): Promise<void> {
    const {
      endpointId, instancesInfo, cache, quietError, env, targetProvider, skipLog,
    } = opts
    // Use reqId to be able to uniquely identify the request
    // so all but the latest request can be igonred and canceled
    this.reqId = !this.reqId ? 1 : this.reqId + 1
    InstanceSource.cancelInstancesDetailsRequests(this.reqId - 1)

    instancesInfo
      .sort((a, b) => (a.instance_name || a.name).localeCompare(b.instance_name || b.name))

    const count = instancesInfo.length
    if (count === 0) {
      return
    }
    this.loadingInstancesDetails = true
    this.instancesDetails = []
    this.instancesDetailsCount = count
    this.instancesDetailsRemaining = count

    await new Promise(resolve => {
      Promise.all(instancesInfo.map(async instanceInfo => {
        try {
          const resp = await InstanceSource.loadInstanceDetails({
            endpointId,
            instanceName: instanceInfo.instance_name || instanceInfo.name,
            targetProvider,
            reqId: this.reqId,
            quietError,
            env,
            cache,
            skipLog,
          })
          const instance = resp.instance
          if (resp.reqId !== this.reqId || !instance) {
            return
          }

          runInAction(() => {
            this.instancesDetailsRemaining -= 1
            this.loadingInstancesDetails = this.instancesDetailsRemaining > 0

            if (this.instancesDetails.find(i => i.id === instance.id)) {
              this.instancesDetails = this.instancesDetails.filter(i => i.id !== instance.id)
            }
            this.instancesDetails = [
              ...this.instancesDetails,
              instance,
            ]
          })
          if (this.instancesDetailsRemaining === 0) {
            this.instancesDetails
              .sort((a, b) => (a.instance_name || a.name)
                .localeCompare((b.instance_name || b.name)))
            resolve()
          }
        } catch (err) {
          runInAction(() => {
            this.instancesDetailsRemaining -= 1
            this.loadingInstancesDetails = this.instancesDetailsRemaining > 0
          })
          if (!err || err.reqId !== this.reqId) {
            return
          }
          if (count === 0) {
            resolve()
          }
        }
      }))
    })
  }

  @action clearInstancesDetails() {
    this.instancesDetails = []
    this.loadingInstancesDetails = false
    this.instancesDetailsCount = 0
    this.instancesDetailsRemaining = 0
  }
}

export default new InstanceStore()
