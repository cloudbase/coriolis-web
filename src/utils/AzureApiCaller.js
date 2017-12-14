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

import request from 'ajax-request'

let apiInstance = null
let defaultApiVersion = '2017-11-11-preview'
let azureUrl = 'https://management.azure.com/'

class AzureApiCaller {
  constructor() {
    if (!apiInstance) {
      apiInstance = this
    }

    this.headers = {}

    return apiInstance
  }

  rejectError(error, reject) {
    console.error('%c', 'color: #D0021B', error) // eslint-disable-line no-console
    reject(error)
  }

  send(options, apiVersion) {
    return new Promise((resolve, reject) => {
      options.headers = {
        ...options.headers,
        ...this.headers,
      }
      let logUrl = options.url
      console.log(`%cSending request to Azure proxy: ${logUrl}`, 'color: #F5A623') // eslint-disable-line no-console

      if (options.url.indexOf('/azure-login') === -1) {
        options.url = `/proxy/${`${azureUrl + options.url}?api-version=${apiVersion || defaultApiVersion}`}`
      }

      request(options, (err, resp, body) => {
        if (!err && resp.statusCode === 200) {
          let bodyJs

          try {
            bodyJs = JSON.parse(body)
          } catch (ex) {
            reject(ex)
          }

          if (!bodyJs) {
            this.rejectError('Incorrect response body', reject)
          } else if (bodyJs.error) {
            this.rejectError(`${bodyJs.error.code}: ${bodyJs.error.message}`, reject)
          } else {
            console.log(`%cReceiving request from Azure proxy '${logUrl}':`, 'color: #0044CA', bodyJs) // eslint-disable-line no-console
            resolve(bodyJs)
          }
        } else if (err) {
          this.rejectError(`${err.code}: ${err.message}`, reject)
        } else {
          this.rejectError('Request failed, there might be a problem with the connection to the server.', reject)
        }
      })
    })
  }

  setHeader(name, value) {
    this.headers[name] = value
  }
}

export default new AzureApiCaller()
