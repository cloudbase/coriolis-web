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

const getModJsonProviders = (jsonPath: string) => {
  let jsonContent = fs.readFileSync(jsonPath)
  let json = JSON.parse(jsonContent)
  if (!json.providers) {
    throw new Error()
  }
  return json.providers
}

const getOptimalLogoHeightKey = (
  availableHeightKeys: string[],
  requestedHeight: number,
  style: ?string
): string => {
  let heightKeys = availableHeightKeys
  if (style) {
    let styledKeys = heightKeys.filter(k => style ? k.indexOf(style) > -1 : false)
    if (styledKeys.length) {
      heightKeys = styledKeys
    }
  }

  let optimal = heightKeys.reduce((prev, curr) => {
    let prevHeight = /d+/.exec(prev)
    let currHeight = /d+/.exec(curr)
    prevHeight = prevHeight ? Number(prevHeight[0]) : 0
    currHeight = currHeight ? Number(currHeight[0]) : 0
    return Math.abs(currHeight - requestedHeight) < Math.abs(prevHeight - requestedHeight) ? curr : prev
  })
  return optimal
}

export default (router: express$Router) => {
  // $FlowIgnore
  router.get('/logos/:provider/:size/:style?', (req, res) => {
    const SIZES = [32, 42, 64, 128]
    const STYLES = ['white', 'disabled']
    let { provider, size, style } = req.params
    size = Number(size)

    if (SIZES.indexOf(size) === -1) {
      res.status(400).json({ error: { message: `Valid sizes are: ${SIZES.join(', ')}` } })
      return
    }
    if (style && STYLES.indexOf(style) === -1) {
      res.status(400).json({ error: { message: `Valid styles are: ${STYLES.join(', ')}` } })
      return
    }
    let logoBase = path.join(__dirname, '/resources/providerLogos')
    let logoPath = `${logoBase}/${provider}-${size}`
    logoPath = style ? `${logoPath}-${style}.svg` : `${logoPath}.svg`

    let modJsonPath: ?string = process.env.MOD_JSON
    if (!modJsonPath) {
      res.sendFile(logoPath)
      return
    }

    try {
      let providersJson = getModJsonProviders(modJsonPath)
      let providerJson = providersJson[provider]
      if (!providerJson) {
        res.sendFile(logoPath)
        return
      }
      let providerLogosJson = providerJson.logos
      if (!providerLogosJson) {
        console.log(`No logos specified in MOD_JSON file for '${provider}' provider`)
        res.sendFile(logoPath)
        return
      }
      let providerLogosKeys = Object.keys(providerLogosJson)
      if (!providerLogosKeys.length) {
        console.log(`No logo heights specified in MOD_JSON file for '${provider}' provider`)
        res.sendFile(logoPath)
        return
      }
      let optimalHeightKey = getOptimalLogoHeightKey(providerLogosKeys, size, style)
      let modLogoPath = providerLogosJson[optimalHeightKey].path
      if (!modLogoPath) {
        console.log(`No logo path specified in MOD_JSON file for '${provider}' provider`)
        res.sendFile(logoPath)
        return
      }
      res.sendFile(modLogoPath)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: { message: 'Invalid Mod JSON file' } })
    }
  })
}
