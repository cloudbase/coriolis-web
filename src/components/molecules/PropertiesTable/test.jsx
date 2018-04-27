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

// @flow

import React from 'react'
import { shallow } from 'enzyme'
import TW from '../../../utils/TestWrapper'
import PropertiesTable from '.'

const wrap = props => new TW(shallow(<PropertiesTable onChange={() => { }} {...props} />), 'propertiesTable')

let properties = [
  { type: 'boolean', name: 'prop_1', label: 'Boolean', value: true },
  { type: 'strict-boolean', name: 'prop_2', label: 'Strict Boolean', value: false },
  { type: 'string', name: 'prop_3', label: 'String', value: 'value-3' },
  { type: 'string', name: 'prop_3a', label: 'String', required: true, value: 'value-4' },
  { type: 'string', enum: ['a', 'b', 'c'], name: 'prop_4', label: 'String enum', value: 'value-5' },
]
const valueCallback = prop => {
  const property = properties.find(p => p.name === prop.name)
  return property ? property.value : null
}

describe('PropertiesTable Component', () => {
  it('renders all properties', () => {
    const wrapper = wrap({ properties, valueCallback })
    expect(wrapper.find('row-', true).length).toBe(properties.length)
    expect(wrapper.find(`row-${properties[3].name}`).findText('header')).toBe('Prop 3a')
  })

  it('renders boolean properties', () => {
    const wrapper = wrap({ properties, valueCallback })
    expect(wrapper.find('switch-prop_1').prop('triState')).toBe(true)
    expect(wrapper.find('switch-prop_1').prop('checked')).toBe(true)
    expect(wrapper.find('switch-prop_2').prop('triState')).toBe(false)
    expect(wrapper.find('switch-prop_2').prop('checked')).toBe(false)
  })

  it('renders string properties', () => {
    const wrapper = wrap({ properties, valueCallback })
    expect(wrapper.find('textInput-prop_3').prop('value')).toBe('value-3')
    expect(wrapper.find('textInput-prop_3').prop('required')).toBe(false)
    expect(wrapper.find('textInput-prop_3a').prop('value')).toBe('value-4')
    expect(wrapper.find('textInput-prop_3a').prop('required')).toBe(true)
  })

  it('renders enum properties', () => {
    const wrapper = wrap({ properties, valueCallback })
    expect(wrapper.find('dropdown-prop_4').prop('items')[0].value).toBe(null)
    expect(wrapper.find('dropdown-prop_4').prop('items')[2].value).toBe('b')
  })
})
