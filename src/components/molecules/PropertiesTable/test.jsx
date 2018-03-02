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
import PropertiesTable from '.'

const wrap = props => shallow(<PropertiesTable {...props} />)

let properties = [
  { type: 'boolean', name: 'prop-1', value: true },
  { type: 'boolean', name: 'prop-2', value: false },
]

it('renders boolean properties with correct labels', () => {
  let wrapper = wrap({
    properties,
    valueCallback: prop => properties.find(p => p.name === prop.name).value,
  })
  expect(wrapper.children().length).toBe(2)
  let item1 = wrapper.childAt(0)
  let item2 = wrapper.childAt(1)
  expect(item1.childAt(0).html().indexOf('Prop-1')).toBeGreaterThan(-1)
  expect(item2.childAt(0).html().indexOf('Prop-2')).toBeGreaterThan(-1)
})

it('renders boolean properties with Switch components', () => {
  let wrapper = wrap({
    properties,
    valueCallback: prop => properties.find(p => p.name === prop.name).value,
  })
  expect(wrapper.children().length).toBe(2)
  let item1 = wrapper.childAt(0)
  let item2 = wrapper.childAt(1)
  expect(item1.find('Switch').prop('checked')).toBe(true)
  expect(item2.find('Switch').prop('checked')).toBe(false)
})
