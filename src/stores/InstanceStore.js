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

import { observable, action, computed } from 'mobx'

import type { Instance } from '../types/Instance'
import type { Endpoint } from '../types/Endpoint'
import InstanceSource from '../sources/InstanceSource'
import ApiCaller from '../utils/ApiCaller'
import { instancesListBackgroundLoading as chunkSize } from '../config'

class InstanceLocalStorage {
  static saveInstancesToLocalStorage(endpointId: string, instances: Instance[]) {
    let instancesLocalStorage: { endpointId: string, instances: Instance[] }[] = JSON.parse(localStorage.getItem('instances') || '[]')
    let endpointIndex = instancesLocalStorage.findIndex(i => i.endpointId === endpointId)
    if (endpointIndex > -1) {
      instancesLocalStorage.splice(endpointIndex, 1)
    }
    instancesLocalStorage.push({ endpointId, instances })
    localStorage.setItem('instances', JSON.stringify(instancesLocalStorage))
  }

  static loadInstancesFromLocalStorage(endpointId: string): ?Instance[] {
    let instancesLocalStorage: { endpointId: string, instances: Instance[] }[] = JSON.parse(localStorage.getItem('instances') || '[]')
    let endpointInstances = instancesLocalStorage.find(i => i.endpointId === endpointId)
    if (!endpointInstances) {
      return null
    }
    return endpointInstances.instances
  }

  static saveDetailsToLocalStorage(endpointId: string, instance: Instance) {
    let instancesDetailsLocalStorage: { endpointId: string, instances: Instance[] }[] = JSON.parse(localStorage.getItem('instancesDetails') || '[]')
    let endpointInstancesIndex = instancesDetailsLocalStorage.findIndex(i => i.endpointId === endpointId)
    let endpointDetails = { endpointId, instances: [] }
    if (endpointInstancesIndex > -1) {
      endpointDetails = instancesDetailsLocalStorage[endpointInstancesIndex]
      instancesDetailsLocalStorage.splice(endpointInstancesIndex, 1)
    }

    let localInstanceIndex = endpointDetails.instances.findIndex(i => i.id === instance.id)
    if (localInstanceIndex > -1) {
      endpointDetails.instances.splice(localInstanceIndex, 1)
    }
    endpointDetails.instances.push(instance)
    instancesDetailsLocalStorage.push(endpointDetails)
    localStorage.setItem('instancesDetails', JSON.stringify(instancesDetailsLocalStorage))
  }

  static loadDetailsFromLocalStorage(endpointId: string, instancesInfo: Instance[]): ?Instance[] {
    let instancesDetailsLocalStorage: { endpointId: string, instances: Instance[] }[] = JSON.parse(localStorage.getItem('instancesDetails') || '[]')
    let endpointStorage = instancesDetailsLocalStorage.find(i => i.endpointId === endpointId)
    if (!endpointStorage || !endpointStorage.instances) {
      return null
    }
    let isValid = true
    let instances: Instance[] = []
    instancesInfo.forEach(instance => {
      let storageInstance = endpointStorage.instances.find(i => instance.id === i.id)
      if (storageInstance) {
        instances.push(storageInstance)
      } else {
        isValid = false
      }
    })
    if (isValid) {
      return instances
    }
    return null
  }
}

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
  @observable loadingInstancesDetails = true
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

  lastEndpointId: string
  reqId: number

  @action loadInstancesInChunks(endpoint: Endpoint, vmsPerPage?: number = 6, reload?: boolean) {
    ApiCaller.cancelRequests(`${endpoint.id}-chunk`)

    this.backgroundInstances = []
    if (reload) {
      this.reloading = true
    } else {
      this.instancesLoading = true
    }
    this.backgroundChunksLoading = true
    this.lastEndpointId = endpoint.id

    let chunkCount = Math.max(chunkSize[endpoint.type] || chunkSize.default, vmsPerPage)

    let loadNextChunk = (lastEndpointId?: string) => {
      let currentEndpointId = endpoint.id
      InstanceSource.loadInstancesChunk(currentEndpointId, chunkCount, lastEndpointId, `${endpoint.id}-chunk`)
        .then(instances => {
          if (currentEndpointId !== this.lastEndpointId) {
            return
          }

          this.backgroundInstances = [...this.backgroundInstances, ...instances]
          if (reload) {
            this.reloading = false
          }
          this.instancesLoading = false

          if (instances.length < chunkCount) {
            this.backgroundChunksLoading = false
            return
          }
          loadNextChunk(instances[instances.length - 1].id)
        })
    }
    loadNextChunk()
  }

  @action loadInstances(endpointId: string): Promise<void> {
    this.instancesLoading = true
    this.lastEndpointId = endpointId

    let endpointInstances = InstanceLocalStorage.loadInstancesFromLocalStorage(endpointId)
    if (endpointInstances) {
      this.backgroundInstances = endpointInstances
      this.instancesLoading = false
      return Promise.resolve()
    }

    return InstanceSource.loadInstances(endpointId).then(instances => {
      if (endpointId !== this.lastEndpointId) {
        return
      }
      this.backgroundInstances = instances
      this.instancesLoading = false
      InstanceLocalStorage.saveInstancesToLocalStorage(endpointId, instances)
    }).catch(() => {
      if (endpointId !== this.lastEndpointId) {
        return
      }
      this.instancesLoading = false
    })
  }

  @action searchInstances(endpoint: Endpoint, searchText: string) {
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
        .filter(i => i.instance_name.toLowerCase().indexOf(searchText.toLowerCase()) > -1)
      this.searchNotFound = Boolean(this.searchedInstances.length === 0)
      this.currentPage = 1
      return
    }

    this.searching = true
    this.searchChunksLoading = true

    let chunkCount = Math.max(chunkSize[endpoint.type] || chunkSize.default, this.instancesPerPage)

    let loadNextChunk = (lastEndpointId?: string) => {
      InstanceSource.loadInstancesChunk(
        endpoint.id,
        chunkCount,
        lastEndpointId,
        `${endpoint.id}-chunk-search`,
        searchText
      ).then(instances => {
        if (this.searching) {
          this.currentPage = 1
          this.searchedInstances = []
        }

        this.searchedInstances = [...this.searchedInstances, ...instances]
        this.searching = false
        this.searchNotFound = Boolean(this.searchedInstances.length === 0)
        if (instances.length < chunkCount) {
          this.searchChunksLoading = false
        }
        return loadNextChunk(instances[instances.length - 1].id)
      })
    }
    loadNextChunk()
  }

  @action reloadInstances(endpoint: Endpoint, chunkSize?: number) {
    this.searchNotFound = false
    this.searchText = ''
    this.currentPage = 1
    this.loadInstancesInChunks(endpoint, chunkSize, true)
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

  @action loadInstancesDetails(endpointId: string, instancesInfo: Instance[], useLocalStorage?: boolean, quietError?: boolean): Promise<void> {
    // Use reqId to be able to uniquely identify the request so all but the latest request can be igonred and canceled
    this.reqId = !this.reqId ? 1 : this.reqId + 1
    InstanceSource.cancelInstancesDetailsRequests(this.reqId - 1)

    instancesInfo.sort((a, b) => a.instance_name.localeCompare(b.instance_name))
    let hash = i => `${i.instance_name}-${i.id || endpointId}`
    if (this.instancesDetails.map(hash).join('_') === instancesInfo.map(hash).join('_')) {
      return Promise.resolve()
    }

    let count = instancesInfo.length
    this.loadingInstancesDetails = true
    this.instancesDetails = []
    this.loadingInstancesDetails = true
    this.instancesDetailsCount = count
    this.instancesDetailsRemaining = count

    if (useLocalStorage) {
      let storageInstances = InstanceLocalStorage.loadDetailsFromLocalStorage(endpointId, instancesInfo)
      if (storageInstances) {
        this.loadingInstancesDetails = false
        this.instancesDetails = storageInstances
        this.loadingInstancesDetails = false
        this.instancesDetailsRemaining = 0
        return Promise.resolve()
      }
    }

    return new Promise((resolve) => {
      instancesInfo.forEach(instanceInfo => {
        InstanceSource.loadInstanceDetails(endpointId, instanceInfo.instance_name, this.reqId, quietError).then((resp: { instance: Instance, reqId: number }) => {
          if (resp.reqId !== this.reqId) {
            return
          }

          this.instancesDetailsRemaining -= 1
          this.loadingInstancesDetails = this.instancesDetailsRemaining > 0

          if (this.instancesDetails.find(i => i.id === resp.instance.id)) {
            this.instancesDetails = this.instancesDetails.filter(i => i.id !== resp.instance.id)
          }

          InstanceLocalStorage.saveDetailsToLocalStorage(endpointId, resp.instance)

          this.instancesDetails = [
            ...this.instancesDetails,
            resp.instance,
          ]
          this.instancesDetails.sort((a, b) => a.instance_name.localeCompare(b.instance_name))

          if (this.instancesDetailsRemaining === 0) {
            resolve()
          }
        }).catch((resp?: { reqId: number }) => {
          this.instancesDetailsRemaining -= 1
          this.loadingInstancesDetails = this.instancesDetailsRemaining > 0

          if (!resp || resp.reqId !== this.reqId) {
            return
          }

          if (count === 0) {
            resolve()
          }
        })
      })
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
