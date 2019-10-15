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

import express from 'express'
import bodyParser from 'body-parser'

import LogosApi from './LogosApi'
import DownloadZipApi from './DownloadZipApi'
import ConfigApi from './ConfigApi'

import packageJson from '../../package.json'

const router = express.Router()

router.use(bodyParser.json())

// $FlowIgnore
router.get('/version', (req, res) => {
  res.json({ version: packageJson.version })
})

ConfigApi(router)
DownloadZipApi(router)
LogosApi(router)

export default router
