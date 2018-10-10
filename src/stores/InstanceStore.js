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

import { wizardConfig } from '../config'
import type { Instance } from '../types/Instance'
import InstanceSource from '../sources/InstanceSource'

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

class InstanceStoreUtils {
  static hasNextPage(instances) {
    let result = false
    if (instances.length - 1 === wizardConfig.instancesItemsPerPage) {
      result = true
      instances.pop()
    }

    return result
  }

  static loadFromCache(cache, page) {
    let startIndex = wizardConfig.instancesItemsPerPage * (page - 1)
    let endIndex = startIndex + wizardConfig.instancesItemsPerPage
    return cache.filter((item, index) => {
      if (index >= startIndex && index < endIndex) {
        return true
      }

      return false
    })
  }
}

class InstanceStore {
  @observable instances: Instance[] = []
  @observable instancesLoading = false
  @observable searching = false
  @observable searchNotFound: boolean = false
  @observable loadingPage = false
  @observable currentPage = 1
  @observable hasNextPage = false
  @observable cachedHasNextPage = false
  @observable cachedInstances: Instance[] = []
  @observable reloading = false
  @observable instancesDetails: Instance[] = []
  @observable loadingInstancesDetails = true
  @observable instancesDetailsCount: number = 0
  @observable instancesDetailsRemaining: number = 0

  lastEndpointId: string
  reqId: number

  @action loadInstances(endpointId: string, skipLimit?: boolean, useCache?: boolean, useLocalStorage?: boolean): Promise<void> {
    if (this.cachedInstances.length > 0 && this.lastEndpointId === endpointId && useCache) {
      return Promise.resolve()
    }

    this.instancesLoading = true
    this.searchNotFound = false
    this.lastEndpointId = endpointId

    if (useLocalStorage) {
      let endpointInstances = InstanceLocalStorage.loadInstancesFromLocalStorage(endpointId)
      if (endpointInstances) {
        this.currentPage = 1
        this.hasNextPage = false
        this.instances = endpointInstances
        this.cachedInstances = endpointInstances
        this.instancesLoading = false
        return Promise.resolve()
      }
    }

    return InstanceSource.loadInstances(endpointId, null, null, skipLimit).then(instances => {
      if (endpointId !== this.lastEndpointId) {
        return
      }

      this.currentPage = 1
      this.hasNextPage = InstanceStoreUtils.hasNextPage(instances)
      this.instances = instances
      this.cachedInstances = instances
      this.instancesLoading = false

      InstanceLocalStorage.saveInstancesToLocalStorage(endpointId, instances)
    }).catch(() => {
      if (endpointId !== this.lastEndpointId) {
        return
      }
      this.instancesLoading = false
    })
  }

  @action searchInstances(endpointId: string, searchText: string) {
    this.searching = true
    return InstanceSource.loadInstances(endpointId, searchText).then(instances => {
      this.currentPage = 1
      this.hasNextPage = InstanceStoreUtils.hasNextPage(instances)
      this.instances = instances
      this.cachedInstances = instances
      this.searching = false
      this.searchNotFound = Boolean(instances.length === 0 && searchText)
    }).catch(r => {
      if (r.canceled) {
        return
      }
      this.searching = false
      this.searchNotFound = true
    })
  }

  @action loadNextPage(endpointId: string, searchText: string): Promise<void> {
    if (this.cachedInstances.length > wizardConfig.instancesItemsPerPage * this.currentPage) {
      this.currentPage = this.currentPage + 1
      let numCachedPages = Math.ceil(this.cachedInstances.length / wizardConfig.instancesItemsPerPage)
      if (this.currentPage === numCachedPages) {
        this.hasNextPage = this.cachedHasNextPage
      } else {
        this.hasNextPage = true
      }
      this.instances = InstanceStoreUtils.loadFromCache(this.cachedInstances, this.currentPage)
      return Promise.resolve()
    }

    this.loadingPage = true
    return InstanceSource.loadInstances(
      endpointId,
      searchText,
      this.instances[this.instances.length - 1].id
    ).then(instances => {
      this.hasNextPage = InstanceStoreUtils.hasNextPage(instances)
      this.cachedHasNextPage = this.hasNextPage
      this.cachedInstances = [...this.cachedInstances, ...instances]
      this.instances = instances
      this.loadingPage = false
      this.currentPage = this.currentPage + 1
    }).catch(() => {
      this.loadingPage = false
    })
  }

  @action loadPreviousPage() {
    this.hasNextPage = true
    this.currentPage = this.currentPage - 1
    this.instances = InstanceStoreUtils.loadFromCache(this.cachedInstances, this.currentPage)
  }

  @action reloadInstances(endpointId: string, searchText: string) {
    this.reloading = true
    this.searchNotFound = false

    InstanceSource.loadInstances(endpointId, searchText).then(instances => {
      this.reloading = false
      this.currentPage = 1
      this.hasNextPage = InstanceStoreUtils.hasNextPage(instances)
      this.instances = instances
      this.cachedInstances = instances
      this.searching = false
      this.searchNotFound = Boolean(instances.length === 0 && searchText)
    }).catch(() => {
      this.reloading = false
      this.searchNotFound = true
    })
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
