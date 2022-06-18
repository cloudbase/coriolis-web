/*
Copyright (C) 2022  Cloudbase Solutions SRL
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

import { observable, action, runInAction } from 'mobx'

import source from '@src/sources/MetalHubSource'
import { MetalHubServer } from '@src/@types/MetalHub'

class MetalHubStore {
  @observable servers: MetalHubServer[] = []

  @observable loadingServers: boolean = false

  @observable loadingServersError: string = ''

  @observable fingerprint: string = ''

  @observable loadingFingerprint: boolean = false

  @observable loadingFingerprintError: string = ''

  @observable loadingNewServer: boolean = false

  @observable serverDetails: MetalHubServer | null = null

  @observable loadingServerDetails: boolean = false

  @observable updatingServer: boolean = false

  @observable refreshingServer: boolean = false

  async getMetalHubEndpoint() {
    return source.getMetalHubEndpoint()
  }

  @action async getServers(options?: { showLoading?: boolean, skipLog?: boolean }) {
    if (options?.showLoading) {
      this.loadingServers = true
    }
    try {
      const servers = await source.getServers(options?.skipLog)
      runInAction(() => {
        this.servers = servers
        this.loadingServersError = ''
      })
    } finally {
      runInAction(() => { this.loadingServers = false })
    }
  }

  @action async loadFingerprint() {
    this.loadingFingerprint = true
    try {
      const fingerprint = await source.loadFingerprint()
      runInAction(() => {
        this.fingerprint = fingerprint
        this.loadingFingerprintError = ''
      })
    } catch (err) {
      runInAction(() => {
        this.loadingFingerprintError = err.data?.error?.message || err.message || ''
      })
    } finally {
      runInAction(() => { this.loadingFingerprint = false })
    }
  }

  @action async addServer(endpoint: string) {
    this.loadingNewServer = true
    try {
      const addedServer = await source.addServer(endpoint)
      runInAction(() => {
        this.servers.push(addedServer)
      })
    } finally {
      runInAction(() => { this.loadingNewServer = false })
    }
  }

  @action async getServerDetails(serverId: number) {
    this.loadingServerDetails = true

    try {
      const server = await source.getServerDetails(serverId)
      runInAction(() => {
        this.serverDetails = server
      })
    } finally {
      runInAction(() => { this.loadingServerDetails = false })
    }
  }

  @action async deleteServer(serverId: number) {
    await source.deleteServer(serverId)
  }

  clearServerDetails() {
    this.serverDetails = null
  }

  @action async patchServer(serverId: number, apiEndpoint: string) {
    this.updatingServer = true
    try {
      await source.patchServer(serverId, apiEndpoint)
    } finally {
      runInAction(() => { this.updatingServer = false })
    }
  }

  @action async refreshServer(serverId: number) {
    this.refreshingServer = true
    try {
      const server = await source.refreshServer(serverId)
      runInAction(() => {
        this.serverDetails = server
      })
    } finally {
      runInAction(() => { this.refreshingServer = false })
    }
  }
}

export default new MetalHubStore()
