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

import express from 'express'
import path from 'path'
import fs from 'fs'
import requireWithoutCache from 'require-without-cache'

import type { Services } from '@src/@types/Config'

const getBaseUrl = () => {
  const BASE_URL = process.env.CORIOLIS_URL || ''
  return BASE_URL.trim().replace(/\/$/, '')
}

const modServicesUrls = (configServices: Services, servicesMod?: Services): Services => {
  const services: any = { ...configServices }
  const localServicesMod: any = servicesMod
  Object.keys(services).forEach(key => {
    services[key] = ((servicesMod && localServicesMod[key]) ? localServicesMod[key] : services[key])
      .replace('{BASE_URL}', getBaseUrl())
  })
  return services
}

export default (router: express.Router) => {
  router.get('/config', (_, res) => {
    const configPath = path.join(__dirname, '../../config.ts')
    const config: any = requireWithoutCache(configPath, require).config
    const modJsonPath: string | null | undefined = process.env.MOD_JSON
    if (!modJsonPath) {
      config.servicesUrls = modServicesUrls(config.servicesUrls)
      res.send(config)
      return
    }
    try {
      const jsonContent: any = fs.readFileSync(modJsonPath)
      const configMod = JSON.parse(jsonContent).config
      Object.keys(configMod).forEach(key => {
        if (key !== 'servicesUrls') {
          config[key] = configMod[key]
        }
      })
      config.servicesUrls = modServicesUrls(config.servicesUrls, configMod.servicesUrls)
      res.send(config)
    } catch (err) {
      console.error(err)
      res.status(400).json({ error: { message: 'Invalid MOD_JSON file' } })
    }
  })
}
