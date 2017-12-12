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

import InstanceSource from '../sources/InstanceSource'
import InstanceStore from '../stores/InstanceStore'
import { wizardConfig } from '../config'

class InstanceActions {
  loadInstances(endpointId) {
    InstanceSource.loadInstances(endpointId).then(
      instances => { this.loadInstancesSuccess(endpointId, instances) },
      response => { this.loadInstancesFailed(endpointId, response) },
    )
    return endpointId
  }

  loadInstancesSuccess(endpointId, instances) {
    return { endpointId, instances }
  }

  loadInstancesFailed(endpointId, response) {
    return { endpointId, response: response || true }
  }

  searchInstances(endpointId, searchText) {
    InstanceSource.loadInstances(endpointId, searchText).then(
      instances => { this.searchInstancesSuccess(instances, searchText) },
      response => { this.searchInstancesFailed(response) },
    )
    return true
  }

  searchInstancesSuccess(instances, searchText) {
    return { instances, searchText }
  }

  searchInstancesFailed(response) {
    return response || true
  }

  loadNextPage(endpointId, searchText) {
    let instanceStore = InstanceStore.getState()

    if (instanceStore.cachedInstances.length > wizardConfig.instancesItemsPerPage * instanceStore.currentPage) {
      return { fromCache: true }
    }

    InstanceSource.loadInstances(
      endpointId,
      searchText,
      instanceStore.instances[instanceStore.instances.length - 1].id
    ).then(
      instances => { this.loadNextPageSuccess(instances) },
      response => { this.loadNextPageFailed(response) },
    )
    return { fromCache: false }
  }

  loadNextPageFromCache() {
    return true
  }

  loadNextPageSuccess(instances) {
    return instances
  }

  loadNextPageFailed(response) {
    return response || true
  }

  loadPreviousPage() {
    return true
  }

  reloadInstances(endpointId, searchText) {
    InstanceSource.loadInstances(endpointId, searchText).then(
      instances => { this.reloadInstancesSuccess(instances, searchText) },
      response => { this.reloadInstancesFailed(response) },
    )

    return true
  }

  reloadInstancesSuccess(instances, searchText) {
    return { instances, searchText }
  }

  reloadInstancesFailed(response) {
    return response || true
  }

  loadInstancesDetails(endpointId, instances) {
    instances.forEach(instance => {
      InstanceSource.loadInstanceDetails(endpointId, instance.instance_name).then(
        instance => { this.loadInstanceDetailsSuccess(instance) },
        response => { this.loadInstanceDetailsFailed(response) },
      )
    })

    return { count: instances.length }
  }

  loadInstanceDetails(endpointId, instanceName) {
    InstanceSource.loadInstanceDetails(endpointId, instanceName).then(
      instance => { this.loadInstanceDetailsSuccess(instance) },
      response => { this.loadInstanceDetailsFailed(response) },
    )

    return true
  }

  loadInstanceDetailsSuccess(instance) {
    return instance
  }

  loadInstanceDetailsFailed(response) {
    return response || true
  }
}

export default alt.createActions(InstanceActions)
