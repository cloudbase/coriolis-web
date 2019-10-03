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

import requireWithoutCache from 'require-without-cache'
import express from 'express'
import bodyParser from 'body-parser'
import AdmZip from 'adm-zip'
import stream from 'stream'

import packageJson from '../package.json'

import type { ZipContent } from '../src/types/ZipContent'

const router = express.Router()

router.use(bodyParser.json())

// $FlowIgnore
router.get('/version', (req, res) => {
  res.json({ version: packageJson.version })
})

// $FlowIgnore
router.get('/config', (req, res) => {
  res.send(requireWithoutCache('../config.js', require).config)
})

// $FlowIgnore
router.post('/download-zip', (req, res) => {
  try {
    let contents: ZipContent[] = req.body.contents
    if (!contents || !contents.length || !contents[0].filename || typeof contents[0].content !== 'string') {
      throw new Error()
    }
    let zip = new AdmZip()
    contents.forEach(content => {
      zip.addFile(content.filename, Buffer.alloc(content.content.length, content.content))
    })
    let zipBuffer = zip.toBuffer()
    let readStream = new stream.PassThrough()
    readStream.end(zipBuffer)
    res.set('Content-Disposition', 'attachment; filename=contents.zip')
    res.set('Content-Type', 'text/plain')
    readStream.pipe(res)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: { message: 'Invalid request body for download zip API' } })
  }
})

export default router
