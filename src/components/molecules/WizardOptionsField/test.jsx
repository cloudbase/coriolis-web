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
import WizardOptionsField from '.'

// $FlowIgnore
const wrap = props => new TW(shallow(<WizardOptionsField {...props} />), 'wOptionsField')

describe('WizardOptionsField Component', () => {
  it('renders label', () => {
    let wrapper = wrap({ name: 'the_name', type: 'string', value: 'the_value' })
    expect(wrapper.findText('label')).toBe('The Name')
  })

  it('renders string input with correct value', () => {
    let wrapper = wrap({ name: 'the_name', type: 'string', value: 'the_value' })
    expect(wrapper.find('textInput').prop('value')).toBe('the_value')
  })

  it('renders required field', () => {
    let wrapper = wrap({ name: 'the_name', type: 'string', value: 'the_value', required: true })
    expect(wrapper.find('required').length).toBe(1)
    wrapper = wrap({ name: 'the_name', type: 'string', value: 'the_value', required: false })
    expect(wrapper.find('required').length).toBe(0)
  })

  it('renders strict boolean with correct value', () => {
    let wrapper = wrap({ name: 'the_name', type: 'strict-boolean', value: true })
    expect(wrapper.find('switch').prop('triState')).toBe(false)
    expect(wrapper.find('switch').prop('checked')).toBe(true)
  })

  it('renders boolean with correct value', () => {
    let wrapper = wrap({ name: 'the_name', type: 'boolean', value: true })
    expect(wrapper.find('switch').prop('triState')).toBe(true)
    expect(wrapper.find('switch').prop('checked')).toBe(true)
  })

  it('renders enum string', () => {
    let wrapper = wrap({
      name: 'the_name',
      type: 'string',
      value: 'reuse_ports',
      enum: ['keep_mac', 'reuse_ports', 'replace_mac'],
    })
    expect(wrapper.find('enumDropdown-the_name').prop('selectedItem').label).toBe('Reuse Existing Ports')
    expect(wrapper.find('enumDropdown-the_name').prop('items')[3].value).toBe('replace_mac')
  })

  it('renders object table', () => {
    let wrapper = wrap({
      name: 'test',
      type: 'object',
      properties: [
        { type: 'boolean', name: 'prop-1', label: 'Property 1' },
        { type: 'boolean', name: 'prop-2', label: 'Property 2' },
      ],
      valueCallback: prop => prop.name === 'prop-2',
    })
    expect(wrapper.find('propertiesTable').prop('properties')[1].name).toBe('prop-2')
  })
})
