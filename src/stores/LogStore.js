/*
Copyright (C) 2019  Cloudbase Solutions SRL
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

import { observable, runInAction, action } from 'mobx'
import cookie from 'js-cookie'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import type { Log } from '../types/Log'

import configLoader from '../utils/Config'

import notificationStore from '../stores/NotificationStore'

import apiCaller from '../utils/ApiCaller'
import DateUtils from '../utils/DateUtils'
import DomUtils from '../utils/DomUtils'

const MAX_STREAM_LINES = 200
class LogStore {
  @observable logs: Log[] = []
  @observable loading: boolean = false
  @observable liveFeed: string[] = []
  @observable generatingDiagnostics: boolean = false

  @action async getLogs(options?: { showLoading?: boolean }) {
    if (options && options.showLoading) {
      this.loading = true
    }
    try {
      let response = await apiCaller.send({ url: configLoader.config.servicesUrls.coriolisLogs })
      runInAction(() => {
        this.logs = response.data.logs
        this.loading = false
      })
    } catch (ex) { throw ex } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  @action download(logName: string, startDate: ?Date, endDate: ?Date) {
    let token = cookie.get('token') || 'null'
    let url = `${configLoader.config.servicesUrls.coriolisLogs}/${logName}?auth_type=keystone&auth_token=${token}`
    if (startDate) {
      url += `&start_date=${DateUtils.toUnix(startDate)}`
    }
    if (endDate) {
      url += `&end_date=${DateUtils.toUnix(endDate)}`
    }

    DomUtils.executeDownloadLink(url)
  }

  @action async downloadDiagnostics() {
    this.generatingDiagnostics = true
    let baseUrl = `${configLoader.config.servicesUrls.coriolis}/${apiCaller.projectId}`
    let [diagnosticsResp, replicasResp, migrationsResp] = await Promise.all([
      apiCaller.send({ url: `${baseUrl}/diagnostics` }),
      apiCaller.send({ url: `${baseUrl}/replicas/detail?show_deleted=true` }),
      apiCaller.send({ url: `${baseUrl}/migrations/detail?show_deleted=true` }),
    ])

    const zip = new JSZip()
    zip.file('diagnostics.json', JSON.stringify(diagnosticsResp.data))
    zip.file('replicas.json', JSON.stringify(replicasResp.data))
    zip.file('migrations.json', JSON.stringify(migrationsResp.data))
    let zipContent = await zip.generateAsync({ type: 'blob' })
    saveAs(zipContent, 'diagnostics.zip')
    runInAction(() => {
      this.generatingDiagnostics = false
    })
  }

  socket: WebSocket
  startLiveFeed(options: { logName: string, severityLevel: number }) {
    let { logName, severityLevel } = options
    let token = cookie.get('token') || 'null'
    let wsUrl
    if (configLoader.config.servicesUrls.coriolisLogStreamBaseUrl === '') {
      wsUrl = `wss://${window.location.host}`
    } else {
      wsUrl = configLoader.config.servicesUrls.coriolisLogStreamBaseUrl.replace('https', 'wss')
    }

    let url = `${wsUrl}/log-stream?auth_type=keystone`
    url += `&auth_token=${token}&severity=${severityLevel}`

    if (logName !== 'All Logs') {
      url += `&app_name=${logName}`
    }

    this.socket = new WebSocket(url)
    this.socket.onopen = () => { console.log('WS Log connection open') }
    this.socket.onmessage = e => {
      if (typeof e.data === 'string') {
        this.addToLiveFeed(JSON.parse(e.data))
      }
    }
    this.socket.onclose = () => { console.log('WS Log connection closed') }
    this.socket.onerror = (e: any) => {
      notificationStore.alert(`WebSocket error: ${e.message}`, 'error')
    }
  }

  @action addToLiveFeed(feed: { message: string }) {
    this.liveFeed = [...this.liveFeed, feed.message]
    if (this.liveFeed.length > MAX_STREAM_LINES) {
      this.liveFeed = [...this.liveFeed.filter((f, i) => i > this.liveFeed.length - MAX_STREAM_LINES)]
    }
  }

  @action clearLiveFeed() {
    this.liveFeed = []
  }

  @action stopLiveFeed() {
    if (this.socket) {
      this.socket.close()
    }
  }
}

export default new LogStore()
