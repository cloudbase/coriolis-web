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

import webpack from 'webpack'
import webpackConfig from '../webpack.config'

module.exports = (app, PORT) => {
  let isBrowserOpen = false
  const compiler = webpack(webpackConfig)

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: false,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true,
    },
    log: text => {
      let statusIndex = text.indexOf('webpack: Compiled') > -1
        ? text.indexOf('webpack: Compiled') : text.indexOf('webpack: Failed')
      if (statusIndex > -1) {
        let left = text.substr(0, statusIndex)
        let isSuccesfull = text.indexOf('webpack: Compiled successfully.') > -1
        let color = text.indexOf('webpack: Compiled with warnings.') > -1 ? '\x1b[43m\x1b[30m' : ''
        color = isSuccesfull ? '\x1b[42m\x1b[30m' : color
        color = text.indexOf('webpack: Failed to compile.') > -1 ? '\x1b[41m' : color

        let end = `${color + text.substr(statusIndex)}\x1b[0m`
        console.log(left + end) // eslint-disable-line no-console

        if (!isBrowserOpen && isSuccesfull) {
          isBrowserOpen = true
          console.log(`\x1b[96mServer is available at http://localhost:${PORT}\x1b[0m`) // eslint-disable-line no-console
        }
      } else {
        console.log(text)// eslint-disable-line no-console
      }
    },
  }))

  app.use(require('webpack-hot-middleware')(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000, // eslint-disable-line no-console
  }))
}
