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

import React from 'react'
import { shallow } from 'enzyme'
import Navigation from '.'

const wrap = props => shallow(<Navigation {...props} />)

it('renders all items', () => {
  let wrapper = wrap()
  let links = wrapper.findWhere(w => w.name() === 'styled.a')
  expect(links.length).toBeGreaterThan(2)
  expect(links.at(1).prop('href')).toBe('/#/migrations')
})

it('selects the current page', () => {
  let wrapper = wrap({ currentPage: 'endpoints' })
  let links = wrapper.findWhere(w => w.name() === 'styled.a' && w.prop('selected'))
  expect(links.prop('href')).toBe('/#/endpoints')
})
