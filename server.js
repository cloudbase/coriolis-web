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

var express = require('express');
var fs = require('fs')

// Create our app
var app = express();
var PORT = process.env.PORT || 3000;

// Write file to disk with process env variables, so that the client code can read
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}
fs.writeFileSync('./dist/env.js', 'window.env = { CORIOLIS_URL: "' + (process.env.CORIOLIS_URL || '/') + '" }')

let isDev = process.argv.find(a => a === '--dev')
if (isDev) {
  let isBrowserOpen = false
  var webpack = require('webpack');
  var webpackConfig = require('./webpack.config');
  var compiler = webpack(webpackConfig);

  app.use(require("webpack-dev-middleware")(compiler, {
    noInfo: false,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    },
    log: function (text) {
      let statusIndex = text.indexOf('webpack: Compiled') > -1
        ? text.indexOf('webpack: Compiled') : text.indexOf('webpack: Failed')
      if (statusIndex > -1) {
        let left = text.substr(0, statusIndex)
        let isSuccesfull = text.indexOf('webpack: Compiled successfully.') > -1
        let color = text.indexOf('webpack: Compiled with warnings.') > -1 ? '\033[43m\033[30m' : ''
        color = isSuccesfull ? '\033[42m\033[30m' : color
        color = text.indexOf('webpack: Failed to compile.') > -1 ? '\033[41m' : color

        let end = color + text.substr(statusIndex) + '\033[0m'
        console.log(left + end)

        if (!isBrowserOpen && isSuccesfull) {
          isBrowserOpen = true
          console.log('\033[96mServer is available at http://localhost:' + PORT + '\033[0m')
        }
      } else {
        console.log(text)
      }
    } 
  }));

  app.use(require("webpack-hot-middleware")(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
  }));
}

app.use(express.static('dist'));

app.use(function (req, res, next) {
  res.redirect(req.baseUrl + '/#' + req.url)
});

app.listen(PORT, function () {
  console.log('Express server is up on port ' + PORT);
});
