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
import WizardOptionsField from './WizardOptionsField'

const wrap = props => shallow(<WizardOptionsField {...props} />)

it('renders label', () => {
  let wrapper = wrap({ name: 'test string', type: 'string', value: 'input-value' })
  expect(wrapper.childAt(0).html().indexOf('Test string')).toBeGreaterThan(-1)
})

it('renders string input with correct value', () => {
  let wrapper = wrap({ name: 'test string', type: 'string', value: 'input-value' })
  expect(wrapper.find('TextInput').prop('value')).toBe('input-value')
})

it('renders required string input', () => {
  let wrapper = wrap({ name: 'test string', type: 'string', value: 'input-value', required: true })
  expect(wrapper.find('TextInput').prop('required')).toBe(true)
})

it('renders strict boolean with correct value', () => {
  let wrapper = wrap({ name: 'test string', type: 'strict-boolean', value: true })
  expect(wrapper.find('Switch').prop('triState')).toBe(false)
  expect(wrapper.find('Switch').prop('checked')).toBe(true)
})

it('renders boolean with correct value', () => {
  let wrapper = wrap({ name: 'test string', type: 'boolean', value: true })
  expect(wrapper.find('Switch').prop('triState')).toBe(true)
  expect(wrapper.find('Switch').prop('checked')).toBe(true)
})

it('renders enum string', () => {
  let wrapper = wrap({
    name: 'test string',
    type: 'string',
    value: 'reuse_ports',
    enum: ['keep_mac', 'reuse_ports', 'replace_mac'],
  })
  expect(wrapper.find('Dropdown').prop('selectedItem')).toBe('Reuse Existing Ports')
  expect(wrapper.find('Dropdown').prop('items')[3].value).toBe('replace_mac')
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
  expect(wrapper.find('PropertiesTable').prop('properties')[1].name).toBe('prop-2')
})
