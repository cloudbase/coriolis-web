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
import type { Endpoint, Validation, StorageBackend } from '../types/Endpoint'
import notificationStore from './NotificationStore'
import EndpointSource from '../sources/EndpointSource'

export const passwordFields = ['password', 'private_key_passphrase', 'secret_access_key']

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
  @observable connectionsInfo: Endpoint[] = []
  @observable validation: ?Validation = null
  @observable validating = false
  @observable updating = false
  @observable adding = false
  @observable connectionInfoLoading = false
  @observable connectionsInfoLoading = false
  @observable storageBackends: StorageBackend[] = []
  @observable storageLoading: boolean = false
  @observable storageConfigDefault: string = ''

  @action getEndpoints(options?: { showLoading: boolean }) {
    if (options && options.showLoading) {
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
      return Promise.reject()
    })
  }

  @action getConnectionsInfo(endpointsData: Endpoint[]): Promise<void> {
    this.connectionsInfoLoading = true
    return EndpointSource.getConnectionsInfo(endpointsData).then(endpoints => {
      this.connectionsInfoLoading = false
      this.connectionsInfo = endpoints
    }).catch(() => {
      this.connectionsInfoLoading = false
    })
  }

  @action duplicate(opts: {
    shouldSwitchProject: boolean,
    onSwitchProject: () => Promise<void>,
    endpoints: Endpoint[],
  }): Promise<void> {
    let endpoints = []
    return Promise.all(opts.endpoints.map(endpoint => {
      return EndpointSource.getConnectionInfo(endpoint).then(connectionInfo => {
        endpoints.push({
          ...endpoint,
          connection_info: connectionInfo,
          name: `${endpoint.name}${!opts.shouldSwitchProject ? ' (copy)' : ''}`,
        })
      })
    })).then(() => {
      if (opts.shouldSwitchProject) {
        return opts.onSwitchProject()
      }
      return Promise.resolve()
    }).then(() => {
      return Promise.all(endpoints.map(endpoint => {
        return EndpointSource.add(endpoint, true)
      }).map((p: Promise<any>) => p.catch(e => e)))
        .then((results: (Endpoint | { status: string, data?: { description: string } })[]) => {
          let internalServerErrors = results.filter(r => r.status && r.status === 500)
          if (internalServerErrors.length > 0) {
            notificationStore.alert(`There was a problem duplicating ${internalServerErrors.length} endpoint${internalServerErrors.length > 1 ? 's' : ''}`, 'error')
          }
          let forbiddenErrors = results.filter(r => r.status && r.status === 403)
          if (forbiddenErrors.length > 0 && forbiddenErrors[0].data && forbiddenErrors[0].data.description) {
            notificationStore.alert(String(forbiddenErrors[0].data.description), 'error')
          }
        })
    }).catch(e => {
      if (e.data && e.data.description) {
        notificationStore.alert(e.data.description, 'error')
      }
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
    }).catch(e => {
      this.updating = false
      throw e
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
    }).catch(e => {
      this.adding = false
      throw e
    })
  }

  @action loadStorage(endpointId: string, data: any): Promise<void> {
    this.storageBackends = []
    this.storageLoading = true
    return EndpointSource.loadStorage(endpointId, data).then(storage => {
      this.storageBackends = storage.storage_backends
      this.storageConfigDefault = storage.config_default || ''
      this.storageLoading = false
    }).catch(ex => {
      this.storageLoading = false
      throw ex
    })
  }
}

export default new EndpointStore()
