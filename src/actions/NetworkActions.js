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

import NetworkSource from '../sources/NetworkSource'
import NetworkStore from '../stores/NetworkStore'

class NetworkActions {
  loadNetworks(endpointId, environment) {
    let storedCacheId = NetworkStore.getState().cacheId
    let cacheId = `${endpointId}-${btoa(JSON.stringify(environment))}`
    if (cacheId === storedCacheId) {
      return { fromCache: true }
    }

    NetworkSource.loadNetworks(endpointId, environment).then(
      networks => { this.loadNetworksSuccess(networks, cacheId) },
      response => { this.loadNetworksFailed(response) }
    )

    return { fromCache: false }
  }

  loadNetworksSuccess(networks, cacheId) {
    return { networks, cacheId }
  }

  loadNetworksFailed(response) {
    return response || true
  }
}

export default alt.createActions(NetworkActions)
