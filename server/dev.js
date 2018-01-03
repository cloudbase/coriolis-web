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
  let isFirstTimeSuccess = false
  const compiler = webpack(webpackConfig)

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: false,
    publicPath: webpackConfig.output.publicPath,
    stats: 'errors-only',
    log: text => {
      let isSuccessfull = text.indexOf('webpack: Compiled successfully.') > -1
      if (!isFirstTimeSuccess && isSuccessfull) {
        isFirstTimeSuccess = true
        console.log(`\x1b[36mServer is available at http://localhost:${PORT}\x1b[0m`) // eslint-disable-line no-console
      }
    },
  }))

  app.use(require('webpack-hot-middleware')(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000, // eslint-disable-line no-console
  }))
}
