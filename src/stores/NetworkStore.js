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
import type { Network } from '../types/Network'
import NetworkSource from '../sources/NetworkSource'

class NetworkLocalStorage {
  static loadNetworksFromStorage(id: string): ?Network[] {
    let networkStorage: { id: string, networks: Network[] }[] = JSON.parse(localStorage.getItem('networks') || '[]')
    let endpointNetworks = networkStorage.find(n => n.id === id)
    if (!endpointNetworks) {
      return null
    }
    return endpointNetworks.networks
  }

  static saveNetworksToLocalStorage(id: string, networks: Network[]) {
    let networkStorage: { id: string, networks: Network[] }[] = JSON.parse(localStorage.getItem('networks') || '[]')
    let endpointNetworksIndex = networkStorage.findIndex(n => n.id === id)
    if (endpointNetworksIndex > -1) {
      networkStorage.splice(endpointNetworksIndex, 1)
    }
    networkStorage.push({ id, networks })
    localStorage.setItem('networks', JSON.stringify(networkStorage))
  }
}

class NetworkStore {
  @observable networks: Network[] = []
  @observable loading: boolean = false

  cachedId: string = ''

  @action loadNetworks(endpointId: string, environment: any, options?: {
    useLocalStorage?: boolean,
    quietError?: boolean,
  }): Promise<void> {
    let id = `${endpointId}-${btoa(JSON.stringify(environment))}`
    if (this.cachedId === id) {
      return Promise.resolve()
    }

    this.loading = true

    if (options && options.useLocalStorage) {
      let networkStorage = NetworkLocalStorage.loadNetworksFromStorage(id)
      if (networkStorage) {
        this.loading = false
        this.networks = networkStorage
        this.cachedId = id
        return Promise.resolve()
      }
    }

    return NetworkSource.loadNetworks(endpointId, environment, options).then((networks: Network[]) => {
      this.loading = false
      this.networks = networks
      this.cachedId = id

      NetworkLocalStorage.saveNetworksToLocalStorage(id, networks)
    }).catch(() => {
      this.loading = false
    })
  }
}

export default new NetworkStore()
