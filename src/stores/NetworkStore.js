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
import NetworkActions from '../actions/NetworkActions'

class NetworkStore {
  constructor() {
    this.networks = []
    this.loading = false
    this.cacheId = null

    this.bindListeners({
      handleLoadNetworks: NetworkActions.LOAD_NETWORKS,
      handleLoadNetworksSuccess: NetworkActions.LOAD_NETWORKS_SUCCESS,
      handleLoadNetworksFailed: NetworkActions.LOAD_NETWORKS_FAILED,
    })
  }

  handleLoadNetworks({ fromCache }) {
    if (fromCache) {
      return
    }

    this.loading = true
  }

  handleLoadNetworksSuccess({ networks, cacheId }) {
    this.loading = false
    this.networks = networks
    this.cacheId = cacheId
  }

  handleLoadNetworksFailed() {
    this.loading = false
  }
}

export default alt.createStore(NetworkStore)
