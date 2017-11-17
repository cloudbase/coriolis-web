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
import Field from './Field'

const wrap = props => shallow(<Field {...props} />)

it('renders boolean field with correct value', () => {
  let wrapper = wrap({ type: 'boolean', label: 'label', value: true })
  expect(wrapper.childAt(1).name()).toBe('Switch')
  expect(wrapper.childAt(1).prop('checked')).toBe(true)
})

it('renders boolean field disabled', () => {
  let wrapper = wrap({ type: 'boolean', label: 'label', disabled: true })
  expect(wrapper.childAt(1).prop('disabled')).toBe(true)
})

it('renders text input field with correct label and value', () => {
  let wrapper = wrap({ type: 'string', label: 'field-label', value: 'text-input' })
  expect(wrapper.childAt(0).contains('field-label')).toBe(true)
  expect(wrapper.childAt(1).name()).toBe('TextInput')
  expect(wrapper.childAt(1).prop('value')).toBe('text-input')
})

it('renders text input field with password, large, disabled, highlighted and required', () => {
  let wrapper = wrap({
    type: 'string',
    label: 'field-label',
    value: 'text-input',
    password: true,
    large: true,
    disabled: true,
    highlight: true,
    required: true,
  })
  expect(wrapper.childAt(1).prop('type')).toBe('password')
  expect(wrapper.childAt(1).prop('large')).toBe(true)
  expect(wrapper.childAt(1).prop('disabled')).toBe(true)
  expect(wrapper.childAt(1).prop('highlight')).toBe(true)
  expect(wrapper.childAt(1).prop('required')).toBe(true)
})

it('renders integer dropdown field with correct items', () => {
  let wrapper = wrap({
    type: 'integer',
    label: 'field-label',
    value: 11,
    minimum: 10,
    maximum: 15,
  })
  expect(wrapper.childAt(1).prop('selectedItem')).toBe(11)
  expect(wrapper.childAt(1).prop('items')[3].value).toBe(13)
  expect(wrapper.childAt(1).prop('items')[5].value).toBe(15)
})

it('renders radio input field with correct value', () => {
  let wrapper = wrap({ type: 'radio', label: 'label', value: true })
  expect(wrapper.childAt(0).name()).toBe('RadioInput')
  expect(wrapper.childAt(0).prop('checked')).toBe(true)
})
