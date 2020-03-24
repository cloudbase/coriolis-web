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

import MsRest from 'ms-rest-azure'
import bodyParser from 'body-parser'
import axios from 'axios'

const forwardHeaders = ['authorization']

let buildError = (message) => {
  return {
    error: { message: `Proxy - ${message}` },
  }
}

module.exports = app => {
  const jsonParser = bodyParser.json()

  app.post('/azure-login', jsonParser, (req, res) => {
    let handleResponse = (err, credentials) => {
      if (err) {
        console.log(err)
        res.status(401).send(buildError('Azure API authentication error'))
      } else {
        res.send(credentials)
      }
    }
    let connInfo = req.body
    let userCred = connInfo.user_credentials
    let servicePrin = connInfo.service_principal_credentials
    if (userCred && userCred.username && userCred.password) {
      MsRest.loginWithUsernamePassword(userCred.username, userCred.password, handleResponse)
    } else if (servicePrin && servicePrin.client_id && servicePrin.client_secret) {
      MsRest.loginWithServicePrincipalSecret(servicePrin.client_id, servicePrin.client_secret, connInfo.tenant, handleResponse)
    } else {
      res.status(401).send(buildError('Azure API authentication error'))
    }
  })

  app.get('/proxy/*', (req, res) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    let url = Buffer.from(req.url.substr('/proxy/'.length), 'base64').toString()
    let headers = {}
    forwardHeaders.forEach(headerName => {
      if (req.headers[headerName] != null) {
        headers[headerName] = req.headers[headerName]
      }
    })

    axios({ url, headers }).then(response => {
      res.send(response.data)
    }).catch(error => {
      if (error.response) {
        res.status(error.response.status).send(buildError(error.response.data.error.message))
      } else if (error.request) {
        console.log(error)
        res.status(500).send(buildError('No Response!'))
      } else {
        res.status(500).send(buildError('Error creating request!'))
      }
    })
  })
}
