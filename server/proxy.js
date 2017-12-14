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
import request from 'request'

const forwardHeaders = ['authorization']

module.exports = app => {
  const jsonParser = bodyParser.json()

  app.post('/azure-login', jsonParser, (req, res) => {
    MsRest.loginWithUsernamePassword(req.body.username, req.body.password, (err, credentials) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.send(credentials)
      }
    })
  })

  app.get('/proxy/*', (req, res) => {
    let url = req.url.substr('/proxy/'.length)
    let headers = {}
    forwardHeaders.forEach(headerName => {
      if (req.headers[headerName] !== null && req.headers[headerName] !== undefined) {
        headers[headerName] = req.headers[headerName]
      }
    })

    request({
      url,
      headers,
    }, (err, resp, body) => {
      if (!err) {
        res.send(body)
      } else {
        res.status(500).send(err)
      }
    })
  })
}
