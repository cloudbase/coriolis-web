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

import { observable, runInAction, action } from 'mobx'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import type {
  Endpoint, Validation, StorageBackend, Storage, MultiValidationItem,
} from '../@types/Endpoint'

import notificationStore from './NotificationStore'
import EndpointSource from '../sources/EndpointSource'

import DomUtils from '../utils/DomUtils'
import regionStore from './RegionStore'

const updateEndpoint = (endpoint: Endpoint, endpoints: Endpoint[]) => endpoints.map(e => {
  if (e.id === endpoint.id) {
    return { ...endpoint }
  }
  return { ...e }
})

class EndpointStore {
  @observable endpoints: Endpoint[] = []

  @observable loading = false

  @observable connectionInfo: Endpoint['connection_info'] | null = null

  @observable connectionsInfo: Endpoint[] = []

  @observable validation: Validation | null = null

  @observable validating = false

  @observable updating = false

  @observable adding = false

  @observable connectionInfoLoading = false

  @observable connectionsInfoLoading = false

  @observable storageBackends: StorageBackend[] = []

  @observable storageLoading: boolean = false

  @observable storageConfigDefault: string = ''

  @observable multiValidation: MultiValidationItem[] = []

  @action async getEndpoints(options?: { showLoading?: boolean, skipLog?: boolean }) {
    if (options && options.showLoading) {
      this.loading = true
    }
    try {
      const endpoints = await EndpointSource.getEndpoints(options && options.skipLog)
      this.getEndpointsSuccess(endpoints)
    } catch (ex) {
      this.getEndpointsFailed()
      throw ex
    }
  }

  @action getEndpointsSuccess(endpoints: Endpoint[]) {
    this.endpoints = endpoints
    this.loading = false
  }

  @action getEndpointsFailed() {
    this.loading = false
  }

  @action async delete(endpoint: Endpoint) {
    await EndpointSource.delete(endpoint)
    this.deleteSuccess(endpoint)
  }

  @action deleteSuccess(endpoint: Endpoint) {
    this.endpoints = this.endpoints.filter(e => e.id !== endpoint.id)
  }

  @action async getConnectionInfo(endpoint: Endpoint) {
    this.connectionInfoLoading = true

    try {
      const connectionInfo = await EndpointSource.getConnectionInfo(endpoint)
      this.setConnectionInfo(connectionInfo)
    } catch (ex) {
      runInAction(() => { this.connectionInfoLoading = false })
      throw ex
    }
  }

  @action async getConnectionsInfo(endpointsData: Endpoint[]): Promise<void> {
    this.connectionsInfoLoading = true
    try {
      const endpoints = await EndpointSource.getConnectionsInfo(endpointsData)
      this.getConnectionsInfoSuccess(endpoints)
    } catch (ex) {
      runInAction(() => { this.connectionsInfoLoading = false })
      throw ex
    }
  }

  @action getConnectionsInfoSuccess(endpoints: Endpoint[]) {
    this.connectionsInfoLoading = false
    this.connectionsInfo = endpoints
  }

  async duplicate(opts: {
    shouldSwitchProject: boolean,
    onSwitchProject: () => Promise<void>,
    endpoints: Endpoint[],
  }): Promise<void> {
    try {
      const endpoints: Endpoint[] = await Promise.all(opts.endpoints.map(async endpoint => {
        const connectionInfo = await EndpointSource.getConnectionInfo(endpoint)
        return {
          ...endpoint,
          connection_info: connectionInfo,
          name: `${endpoint.name}${!opts.shouldSwitchProject ? ' (copy)' : ''}`,
        }
      }))

      if (opts.shouldSwitchProject) {
        await opts.onSwitchProject()
      }

      const results: (Endpoint | {
        status: string, data?: { description: string }
      })[] = await Promise
        .all(endpoints.map(endpoint => EndpointSource
          .add(endpoint, true))
          .map(p => p.catch(e => e)))

      const internalServerErrors = results.filter(r => r.status && r.status === 500)
      if (internalServerErrors.length > 0) {
        notificationStore.alert(`There was a problem duplicating ${internalServerErrors.length} endpoint${internalServerErrors.length > 1 ? 's' : ''}`, 'error')
      }
      const forbiddenErrors = results.filter(r => r.status && r.status === 403)
      if (forbiddenErrors.length > 0 && forbiddenErrors[0].data?.description) {
        notificationStore.alert(String(forbiddenErrors[0].data.description), 'error')
      }
    } catch (ex) {
      if (ex.data && ex.data.description) {
        notificationStore.alert(ex.data.description, 'error')
      }
    }
  }

  @action async exportToJson(endpoint: Endpoint): Promise<void> {
    const connectionInfo = await EndpointSource.getConnectionInfo(endpoint)
    const newEndpoint = JSON.parse(JSON.stringify(endpoint))
    newEndpoint.connection_info = connectionInfo
    await regionStore.setEndpointRegionExport(newEndpoint)
    DomUtils.download(JSON.stringify(newEndpoint), `${newEndpoint.name}.endpoint`)
  }

  @action async exportToZip(endpoints: Endpoint[]): Promise<void> {
    const zip = new JSZip()

    await Promise.all(endpoints.map(async endpoint => {
      const connectionInfo = await EndpointSource.getConnectionInfo(endpoint)
      const newEndpoint = JSON.parse(JSON.stringify(endpoint))
      newEndpoint.connection_info = connectionInfo
      await regionStore.setEndpointRegionExport(newEndpoint)
      zip.file(`${newEndpoint.name}.endpoint`, JSON.stringify(newEndpoint))
    }))

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'coriolis-endpoints.zip')
  }

  @action setConnectionInfo(connectionInfo: Endpoint['connection_info']) {
    this.connectionInfo = connectionInfo
    this.connectionInfoLoading = false
  }

  @action resetMultiValidation() {
    this.multiValidation = []
  }

  @action async validateMultiple(endpoints: Endpoint[]) {
    this.multiValidation = endpoints.map(endpoint => ({
      endpoint,
      validating: true,
    }))

    await Promise.all(endpoints.map(async endpoint => {
      try {
        const validation = await EndpointSource.validate(endpoint)
        runInAction(() => {
          this.multiValidation = this.multiValidation
            .filter(mv => mv.endpoint.name !== endpoint.name
            || mv.endpoint.type !== endpoint.type)
          this.multiValidation = [...this.multiValidation, {
            endpoint,
            validation,
            validating: false,
          }]
        })
      } catch (ex) {
        runInAction(() => {
          this.multiValidation = this.multiValidation
            .filter(mv => mv.endpoint.name !== endpoint.name
            || mv.endpoint.type !== endpoint.type)
          this.multiValidation = [...this.multiValidation, {
            endpoint,
            validation: { valid: false, message: 'Validation request failed' },
            validating: false,
          }]
        })
      }
    }))
  }

  @action async validate(endpoint: Endpoint) {
    this.validating = true

    try {
      const validation = await EndpointSource.validate(endpoint)
      this.validateSuccess(validation)
      return validation
    } catch (ex) {
      this.validateFailed()
      throw ex
    }
  }

  @action validateSuccess(validation: Validation) {
    this.validation = validation
    this.validating = false
  }

  @action validateFailed() {
    this.validating = false
    this.validation = { valid: false, message: '' }
  }

  @action clearValidation() {
    this.validating = false
    this.validation = null
  }

  @action async update(endpoint: Endpoint) {
    this.endpoints = updateEndpoint(endpoint, this.endpoints)
    this.connectionInfo = { ...endpoint.connection_info }
    this.updating = true

    try {
      const updatedEndpoint = await EndpointSource.update(endpoint)
      this.updateSuccess(updatedEndpoint)
    } catch (e) {
      runInAction(() => { this.updating = false })
      throw e
    }
  }

  @action updateSuccess(updatedEndpoint: Endpoint) {
    this.endpoints = updateEndpoint(updatedEndpoint, this.endpoints)
    this.connectionInfo = { ...updatedEndpoint.connection_info }
    this.updating = false
  }

  @action clearConnectionInfo() {
    this.connectionInfo = null
  }

  @action async add(endpoint: Endpoint) {
    this.adding = true

    try {
      const addedEndpoint = await EndpointSource.add(endpoint)
      this.addSuccess(addedEndpoint)
      return addedEndpoint
    } catch (ex) {
      runInAction(() => { this.adding = false })
      throw ex
    }
  }

  async addMultiple(endpoints: Endpoint[]) {
    const addedEndpoints: Endpoint[] = []
    await Promise.all(endpoints.map(async endpoint => {
      try {
        const addedEndpoint = await EndpointSource.add(endpoint, true)
        this.addSuccess(addedEndpoint)
        addedEndpoints.push(addedEndpoint)
        // eslint-disable-next-line no-empty
      } catch (err) { }
    }))
    return addedEndpoints
  }

  @action addSuccess(addedEndpoint: Endpoint) {
    this.endpoints = [
      addedEndpoint,
      ...this.endpoints,
    ]
    this.connectionInfo = addedEndpoint.connection_info
    this.adding = false
  }

  @action async loadStorage(endpointId: string, data: any, options?: {cache?: boolean}): Promise<void> {
    this.storageBackends = []
    this.storageLoading = true

    try {
      const storage = await EndpointSource.loadStorage(endpointId, data, options)
      this.loadStorageSuccess(storage)
    } catch (ex) {
      runInAction(() => { this.storageLoading = false })
      throw ex
    }
  }

  @action loadStorageSuccess(storage: Storage) {
    this.storageBackends = storage.storage_backends
    this.storageConfigDefault = storage.config_default || ''
    this.storageLoading = false
  }
}

export default new EndpointStore()
