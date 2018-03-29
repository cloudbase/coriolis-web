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

import NotificationStore from '../stores/NotificationStore'

let apiInstance = null

type RequestOptions = {
  method: string,
  url: string,
  requestId?: string,
  headers?: {[string]: mixed},
}

type RequestInfo = {
  requestId: string,
  request: XMLHttpRequest,
}

class ApiCaller {
  defaultHeaders = {
    'Content-Type': 'application/json',
  }

  requests = []

  constructor() {
    if (!apiInstance) {
      apiInstance = this
    }

    return apiInstance
  }

  addRequest(requestInfo: RequestInfo) {
    this.requests.unshift(requestInfo)
    if (this.requests.length > 100) {
      this.requests.pop()
    }
  }

  cancelRequest(requestInfo: RequestInfo) {
    requestInfo.request.abort()
    this.requests = this.requests.filter(r => r.requestId !== requestInfo.requestId)
  }

  sendAjaxRequest(options: RequestOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest()

      if (options.requestId) {
        this.addRequest({ requestId: options.requestId, request })
      }

      request.open(options.method, options.url)

      let headers = Object.assign({}, this.defaultHeaders)

      if (options.headers) {
        Object.keys(options.headers).forEach((key) => {
          headers[key] = options.headers ? options.headers[key] : ''
        })
      }

      Object.keys(headers).forEach((name) => {
        request.setRequestHeader(name, headers[name])
      })

      request.onreadystatechange = () => {
        if (request.readyState === 4) { // if complete
          if (!(request.status >= 200 && request.status <= 299)) { // check if "OK" (200)
            reject({ status: request.status })
          } else if (request.status === 0) { // check if aborted
            reject({ status: 0 })
          }
        }
      }

      console.log(`%cSending ${options.method} Request to ${options.url}`, 'color: #F5A623') // eslint-disable-line no-console

      try {
        options.data ? request.send(JSON.stringify(options.data)) : request.send()
      } catch (err) {
        reject(err)
      }

      request.onload = () => {
        let data = null

        if (options.json !== false && request.responseText) {
          try {
            data = JSON.parse(request.responseText)
          } catch (err) {
            reject({ message: 'Invalid server response!' })
          }
        } else if (request.responseText) {
          data = request.responseText
        }

        let result = {
          status: request.status,
          data,
          headers: ApiCaller.processHeaders(request.getAllResponseHeaders()),
        }
        if (result.status >= 200 && result.status <= 299) {
          console.log(`%cResponse ${options.url}`, 'color: #0044CA', result.data) // eslint-disable-line no-console
          resolve(result)
        } else {
          console.log(`%cError Response: ${options.url}`, 'color: #D0021B', result.data) // eslint-disable-line no-console

          let loginUrl = '#/'

          if (result.data && result.data.error && result.data.error.message &&
            (result.status !== 401 || window.location.hash !== loginUrl)) {
            // $FlowIgnore
            NotificationStore.notify(result.data.error.message, 'error')
          }

          if (result.status === 401 && window.location.hash !== loginUrl) {
            this.resetHeaders()
            window.location.href = `/${loginUrl}`
          }
          reject({ status: request.status })
        }
      }

      request.onerror = (result) => {
        let loginUrl = '#/'
        if (window.location.hash !== loginUrl) {
          NotificationStore.notify(`Request failed, there might be a problem with the 
          connection to the server.`, 'error')
        }

        // $FlowIgnore
        console.log('%cError Response: ', 'color: #D0021B', result.data) // eslint-disable-line no-console
        reject({ status: 500, data: 'Connection error' })
      }
    })
  }

  resetHeaders() {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  static processHeaders(rawHeaders: string) {
    let headers = {}
    let lines = rawHeaders.split('\n')
    lines.forEach((line) => {
      let comps = line.split(':')
      if (comps[0].length) {
        headers[comps[0]] = comps[1].trim()
      }
    })
    return headers
  }

  setDefaultHeader(name: string, value: ?string) {
    if (value == null) {
      delete this.defaultHeaders[name]
    } else {
      this.defaultHeaders[name] = value
    }
  }
}

export default new ApiCaller()
