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
import type { Endpoint, Validation } from '../types/Endpoint'
import EndpointSource from '../sources/EndpointSource'

const updateEndpoint = (endpoint, endpoints) => endpoints.map(e => {
  if (e.id === endpoint.id) {
    return { ...endpoint }
  }
  return { ...e }
})

class EndpointStore {
  @observable endpoints: Endpoint[] = []
  @observable loading = false
  @observable loading = false
  @observable connectionInfo: ?$PropertyType<Endpoint, 'connection_info'> = null
  @observable validation: ?Validation = null
  @observable validating = false
  @observable updating = false
  @observable adding = false
  @observable connectionInfoLoading = false

  @action getEndpoints(options?: { showLoading: boolean }) {
    if ((options && options.showLoading) || this.endpoints.length === 0) {
      this.loading = true
    }

    return EndpointSource.getEndpoints().then(endpoints => {
      this.endpoints = endpoints
      this.loading = false
    }).catch(() => {
      this.loading = false
    })
  }

  @action delete(endpoint: Endpoint) {
    return EndpointSource.delete(endpoint).then(() => {
      this.endpoints = this.endpoints.filter(e => e.id !== endpoint.id)
    })
  }

  @action getConnectionInfo(endpoint: Endpoint) {
    this.connectionInfoLoading = true

    return EndpointSource.getConnectionInfo(endpoint).then(connectionInfo => {
      this.setConnectionInfo(connectionInfo)
    }).catch(() => {
      this.connectionInfoLoading = false
    })
  }

  @action setConnectionInfo(connectionInfo: $PropertyType<Endpoint, 'connection_info'>) {
    this.connectionInfo = connectionInfo
    this.connectionInfoLoading = false
  }

  @action validate(endpoint: Endpoint) {
    this.validating = true

    return EndpointSource.validate(endpoint).then(validation => {
      this.validation = validation
      this.validating = false
    }).catch(() => {
      this.validating = false
      this.validation = { valid: false, message: '' }
    })
  }

  @action clearValidation() {
    this.validating = false
    this.validation = null
  }

  @action update(endpoint: Endpoint) {
    this.endpoints = updateEndpoint(endpoint, this.endpoints)
    this.connectionInfo = { ...endpoint.connection_info }
    this.updating = true

    return EndpointSource.update(endpoint).then(updatedEndpoint => {
      this.endpoints = updateEndpoint(updatedEndpoint, this.endpoints)
      this.connectionInfo = { ...updatedEndpoint.connection_info }
      this.updating = false
    })
  }

  @action clearConnectionInfo() {
    this.connectionInfo = null
  }

  @action add(endpoint: Endpoint) {
    this.adding = true

    return EndpointSource.add(endpoint).then(addedEndpoint => {
      this.endpoints = [
        addedEndpoint,
        ...this.endpoints,
      ]

      this.connectionInfo = addedEndpoint.connection_info
      this.adding = false
    }).catch(() => {
      this.adding = false
    })
  }
}

export default new EndpointStore()
