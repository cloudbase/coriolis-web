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

import 'react-hot-loader/patch'
import React from 'react'
import { render } from 'react-dom'
import { HashRouter } from 'react-router-dom'

import { basename } from 'config'
import App from 'components/App.jsx'

const renderApp = () => React.createElement(
  HashRouter,
  { basename },
  React.createElement(App, null)
)

const root = document.getElementById('app')
render(renderApp(), root)

if (module.hot) {
  module.hot.accept('components/App.jsx', () => {
    require('components/App.jsx')
    render(renderApp(), root)
  })
}
