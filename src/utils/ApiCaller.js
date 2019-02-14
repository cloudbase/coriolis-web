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

import axios from 'axios'
import type { AxiosXHRConfig, $AxiosXHR } from 'axios'
import cookie from 'js-cookie'

import logger from './ApiLogger'
import notificationStore from '../stores/NotificationStore'
import DomUtils from '../utils/DomUtils'

type Cancelable = {
  requestId: string,
  cancel: () => void,
}

type RequestOptions = {
  url: string,
  method?: string,
  cancelId?: string,
  headers?: { [string]: string },
  data?: any,
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream',
  quietError?: boolean,
  skipLog?: boolean,
}

let cancelables: Cancelable[] = []
const CancelToken = axios.CancelToken

const addCancelable = (cancelable: Cancelable) => {
  cancelables.unshift(cancelable)
  if (cancelables.length > 100) {
    cancelables.pop()
  }
}

class ApiCaller {
  constructor() {
    axios.defaults.headers.common['Content-Type'] = 'application/json'
  }

  get projectId(): string {
    return cookie.get('projectId') || 'undefined'
  }

  cancelRequests(cancelRequestId: string) {
    const filteredCancelables = cancelables.filter(r => r.requestId === cancelRequestId)
    filteredCancelables.forEach(c => {
      c.cancel()
    })
    cancelables = cancelables.filter(r => r.requestId !== cancelRequestId)
  }

  get(url: string): Promise<$AxiosXHR<any>> {
    return this.send({ url })
  }

  send(options: RequestOptions): Promise<$AxiosXHR<any>> {
    return new Promise((resolve, reject) => {
      const axiosOptions: AxiosXHRConfig<any> = {
        url: options.url,
        method: options.method || 'GET',
        headers: options.headers || {},
        data: options.data || null,
        responseType: options.responseType || 'json',
      }

      if (options.cancelId) {
        let cancel = () => { }
        axiosOptions.cancelToken = new CancelToken(c => {
          cancel = c
        })
        addCancelable({ requestId: options.cancelId, cancel })
      }

      if (!options.skipLog) {
        logger.log({
          url: axiosOptions.url,
          method: axiosOptions.method || 'GET',
          type: 'REQUEST',
        })
      }

      axios(axiosOptions).then((response) => {
        if (!options.skipLog) {
          console.log(`%cResponse ${axiosOptions.url}`, 'color: #0044CA', response.data)
          logger.log({
            url: axiosOptions.url,
            method: axiosOptions.method || 'GET',
            type: 'RESPONSE',
            requestStatus: 200,
          })
        }
        resolve(response)
      }).catch(error => {
        const loginUrl = `${DomUtils.urlHashPrefix}`

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (
            (error.response.status !== 401 || window.location.hash !== loginUrl) &&
            !options.quietError &&
            error.response.data) {
            let data = error.response.data
            let message = (data.error && data.error.message) || data.description
            if (message) {
              notificationStore.alert(message, 'error')
            }
          }

          if (error.response.status === 401 && window.location.hash !== loginUrl && error.request.responseURL.indexOf('/proxy/') === -1) {
            window.location.href = '/'
          }

          logger.log({
            url: axiosOptions.url,
            method: axiosOptions.method || 'GET',
            type: 'RESPONSE',
            requestStatus: error.response.status,
            requestError: error,
          })
          reject(error.response)
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest
          if (window.location.hash !== loginUrl) {
            notificationStore.alert('Request failed, there might be a problem with the connection to the server.', 'error')
          }
          logger.log({
            url: axiosOptions.url,
            method: axiosOptions.method || 'GET',
            type: 'RESPONSE',
            description: 'No response',
            requestStatus: 500,
            requestError: error,
          })
          reject({})
        } else {
          let canceled = error.constructor.name === 'Cancel'
          reject({ canceled })
          if (canceled) {
            logger.log({
              url: axiosOptions.url,
              method: axiosOptions.method || 'GET',
              type: 'RESPONSE',
              requestStatus: 'canceled',
            })
            return
          }

          // Something happened in setting up the request that triggered an Error
          logger.log({
            url: axiosOptions.url,
            method: axiosOptions.method || 'GET',
            type: 'RESPONSE',
            description: 'Something happened in setting up the request',
            requestStatus: 500,
          })
          notificationStore.alert('Request failed, there might be a problem with the connection to the server.', 'error')
        }
      })
    })
  }

  setDefaultHeader(name: string, value: ?string) {
    axios.defaults.headers.common[name] = value
  }
}

export default new ApiCaller()
