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

import path from 'path'
import fs from 'fs'
import requireWithoutCache from 'require-without-cache'

import type { Config } from '../../src/types/Config'

export default (router: express$Router) => {
  // $FlowIgnore
  router.get('/config', (req, res) => {
    let configPath = path.join(__dirname, '../../config.js')
    let config: Config = requireWithoutCache(configPath, require).config
    let modJsonPath: ?string = process.env.MOD_JSON
    if (!modJsonPath) {
      res.send(config)
      return
    }
    try {
      let jsonContent = fs.readFileSync(modJsonPath)
      let configMod = JSON.parse(jsonContent).config
      Object.keys(configMod).forEach(key => { config[key] = configMod[key] })
      res.send(config)
    } catch (err) {
      console.error(err)
      res.status(400).json({ error: { message: 'Invalid MOD_JSON file' } })
    }
  })
}
