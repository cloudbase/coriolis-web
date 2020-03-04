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

import express from 'express'
import fs from 'fs'
import path from 'path'

import router from './api/router'

// Create our app
const app = express()

const PORT = process.env.PORT || 3000
const isDev = process.argv.find(a => a === '--dev')

// Write file to disk with process env variables, so that the client code can read
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist')
}
fs.writeFileSync('./dist/env.js', `window.env = {
  ENV: '${isDev ? 'development' : 'production'}',
}
`)

if (isDev) {
  require('./dev')(app, PORT)
}

app.use(express.static('dist'))

require('./proxy')(app)

app.use('/api', router)

if (isDev) {
  // $FlowIgnore
  app.use((req, res) => {
    res.redirect(`${req.baseUrl}/#${req.url}`)
  })
} else {
  // $FlowIgnore
  app.get('*/env.js', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'env.js'))
  })
  // $FlowIgnore
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Express server is up on port ${PORT}`)
})
