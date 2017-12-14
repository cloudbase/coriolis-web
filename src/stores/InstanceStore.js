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

import alt from '../alt'
import InstanceActions from '../actions/InstanceActions'

import { wizardConfig } from '../config'

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
  constructor() {
    this.instances = []
    this.instancesLoading = false
    this.searching = false
    this.searchNotFound = false
    this.loadingPage = false
    this.currentPage = 1
    this.hasNextPage = false
    this.cachedHasNextPage = false
    this.cachedInstances = []
    this.reloading = false
    this.instancesDetails = []
    this.loadingInstancesDetails = true

    this.bindListeners({
      handleLoadInstances: InstanceActions.LOAD_INSTANCES,
      handleLoadInstancesSuccess: InstanceActions.LOAD_INSTANCES_SUCCESS,
      handleLoadInstancesFailed: InstanceActions.LOAD_INSTANCES_FAILED,
      handleSearchInstances: InstanceActions.SEARCH_INSTANCES,
      handleSearchInstancesSuccess: InstanceActions.SEARCH_INSTANCES_SUCCESS,
      handleSearchInstancesFailed: InstanceActions.SEARCH_INSTANCES_FAILED,
      handleLoadNextPage: InstanceActions.LOAD_NEXT_PAGE,
      handleLoadNextPageSuccess: InstanceActions.LOAD_NEXT_PAGE_SUCCESS,
      handleLoadNextPageFailed: InstanceActions.LOAD_NEXT_PAGE_FAILED,
      handleLoadPreviousPage: InstanceActions.LOAD_PREVIOUS_PAGE,
      handleReloadInstances: InstanceActions.RELOAD_INSTANCES,
      handleReloadInstancesSuccess: InstanceActions.RELOAD_INSTANCES_SUCCESS,
      handleReloadInstancesFailed: InstanceActions.RELOAD_INSTANCES_FAILED,
      handleLoadInstancesDetails: InstanceActions.LOAD_INSTANCES_DETAILS,
      handleLoadInstanceDetailsSuccess: InstanceActions.LOAD_INSTANCE_DETAILS_SUCCESS,
      handleLoadInstanceDetailsFailed: InstanceActions.LOAD_INSTANCE_DETAILS_FAILED,
    })
  }

  handleLoadInstances(endpointId) {
    this.endpointId = endpointId
    this.instancesLoading = true
    this.searchNotFound = false
  }

  handleLoadInstancesSuccess({ endpointId, instances }) {
    if (endpointId !== this.endpointId) {
      return
    }

    this.currentPage = 1
    this.hasNextPage = InstanceStoreUtils.hasNextPage(instances)
    this.instances = instances
    this.cachedInstances = instances
    this.instancesLoading = false
  }

  handleLoadInstancesFailed({ endpointId }) {
    if (endpointId !== this.endpointId) {
      return
    }

    this.instancesLoading = false
  }

  handleSearchInstances() {
    this.searching = true
  }

  handleSearchInstancesSuccess({ instances, searchText }) {
    this.currentPage = 1
    this.hasNextPage = InstanceStoreUtils.hasNextPage(instances)
    this.instances = instances
    this.cachedInstances = instances
    this.searching = false
    this.searchNotFound = instances.length === 0 && searchText
  }

  handleSearchInstancesFailed() {
    this.searching = false
    this.searchNotFound = true
  }

  handleLoadNextPage({ fromCache }) {
    if (!fromCache) {
      this.loadingPage = true
      return
    }
    this.currentPage = this.currentPage + 1
    let numCachedPages = Math.ceil(this.cachedInstances.length / wizardConfig.instancesItemsPerPage)
    if (this.currentPage === numCachedPages) {
      this.hasNextPage = this.cachedHasNextPage
    } else {
      this.hasNextPage = true
    }
    this.instances = InstanceStoreUtils.loadFromCache(this.cachedInstances, this.currentPage)
  }

  handleLoadNextPageSuccess(instances) {
    this.hasNextPage = InstanceStoreUtils.hasNextPage(instances)
    this.cachedHasNextPage = this.hasNextPage
    this.cachedInstances = [...this.cachedInstances, ...instances]
    this.instances = instances
    this.loadingPage = false
    this.currentPage = this.currentPage + 1
  }

  handleLoadNextPageFailed() {
    this.loadingPage = false
  }

  handleLoadPreviousPage() {
    this.hasNextPage = true
    this.currentPage = this.currentPage - 1
    this.instances = InstanceStoreUtils.loadFromCache(this.cachedInstances, this.currentPage)
  }

  handleReloadInstances() {
    this.reloading = true
    this.searchNotFound = false
  }

  handleReloadInstancesSuccess({ instances, searchText }) {
    this.reloading = false
    this.currentPage = 1
    this.hasNextPage = InstanceStoreUtils.hasNextPage(instances)
    this.instances = instances
    this.cachedInstances = instances
    this.searching = false
    this.searchNotFound = instances.length === 0 && searchText
  }

  handleReloadInstancesFailed() {
    this.reloading = false
    this.searchNotFound = true
  }

  handleLoadInstancesDetails({ count, fromCache }) {
    if (fromCache) {
      return
    }

    this.loadingInstancesDetails = true
    this.instancesDetailsCount = count
    this.instancesDetails = []
  }

  handleLoadInstanceDetailsSuccess(instance) {
    this.instancesDetailsCount -= 1
    this.loadingInstancesDetails = this.instancesDetailsCount > 0

    if (this.instancesDetails.find(i => i.id === instance.id)) {
      this.instancesDetails = this.instancesDetails.filter(i => i.id !== instance.id)
    }

    this.instancesDetails = [
      ...this.instancesDetails,
      instance,
    ]
    this.instancesDetails.sort((a, b) => a.instance_name.localeCompare(b.instance_name))
  }

  handleLoadInstanceDetailsFailed() {
    this.instancesDetailsCount -= 1
    this.loadingInstancesDetails = this.instancesDetailsCount > 0
  }
}

export default alt.createStore(InstanceStore)
