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

const getModJsonProviders = (jsonPath: string) => {
  const jsonContent: any = fs.readFileSync(jsonPath)
  const json = JSON.parse(jsonContent)
  if (!json.providers) {
    throw new Error()
  }
  return json.providers
}

const getOptimalLogoHeightKey = (
  availableHeightKeys: string[],
  requestedHeight: number,
  style?: string | null,
): string => {
  let heightKeys = availableHeightKeys
  if (style) {
    const styledKeys = heightKeys.filter(k => (style ? k.indexOf(style) > -1 : false))
    if (styledKeys.length) {
      heightKeys = styledKeys
    }
  }

  const optimal = heightKeys.reduce((prev, curr) => {
    let prevHeight: any = /d+/.exec(prev)
    let currHeight: any = /d+/.exec(curr)
    prevHeight = prevHeight ? Number(prevHeight[0]) : 0
    currHeight = currHeight ? Number(currHeight[0]) : 0
    return Math.abs(currHeight - requestedHeight)
      < Math.abs(prevHeight - requestedHeight) ? curr : prev
  })
  return optimal
}

export default (router: express.Router) => {
  router.get('/logos/:provider/:size/:style?', (req, res) => {
    const SIZES = [32, 42, 64, 128]
    const STYLES = ['white', 'disabled']
    const { provider, style } = req.params
    const size = Number(req.params.size)

    if (SIZES.indexOf(size) === -1) {
      res.status(400).json({ error: { message: `Valid sizes are: ${SIZES.join(', ')}` } })
      return
    }
    if (style && STYLES.indexOf(style) === -1) {
      res.status(400).json({ error: { message: `Valid styles are: ${STYLES.join(', ')}` } })
      return
    }
    const logoBase = path.join(__dirname, '/resources/providerLogos')
    let logoPath = `${logoBase}/${provider}-${size}`
    logoPath = style ? `${logoPath}-${style}.svg` : `${logoPath}.svg`

    const modJsonPath: string | null | undefined = process.env.MOD_JSON
    if (!modJsonPath) {
      res.sendFile(logoPath)
      return
    }

    try {
      const providersJson = getModJsonProviders(modJsonPath)
      const providerJson = providersJson[provider]
      if (!providerJson) {
        res.sendFile(logoPath)
        return
      }
      const providerLogosJson = providerJson.logos
      if (!providerLogosJson) {
        console.log(`No logos specified in MOD_JSON file for '${provider}' provider`)
        res.sendFile(logoPath)
        return
      }
      const providerLogosKeys = Object.keys(providerLogosJson)
      if (!providerLogosKeys.length) {
        console.log(`No logo heights specified in MOD_JSON file for '${provider}' provider`)
        res.sendFile(logoPath)
        return
      }
      const optimalHeightKey = getOptimalLogoHeightKey(providerLogosKeys, size, style)
      const modLogoPath = providerLogosJson[optimalHeightKey].path
      if (!modLogoPath) {
        console.log(`No logo path specified in MOD_JSON file for '${provider}' provider`)
        res.sendFile(logoPath)
        return
      }
      res.sendFile(modLogoPath)
    } catch (err) {
      console.error(err)
      res.status(400).json({ error: { message: 'Invalid Mod JSON file' } })
    }
  })
}
