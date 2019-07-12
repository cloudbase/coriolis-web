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
import TestWrapper from '../../../utils/TestWrapper'
import EndpointField from '.'

const wrap = props => new TestWrapper(shallow(<EndpointField {...props} />), 'endpointField')

describe('EndpointField Component', () => {
  it('renders label', () => {
    const wrapper = wrap({ type: 'boolean', value: true, name: 'the_name' })
    expect(wrapper.findText('label')).toBe('The Name')
  })

  it('renders boolean field with correct value', () => {
    let wrapper = wrap({ type: 'boolean', name: 'the_name', value: true })
    expect(wrapper.find('switch-the_name').length).toBe(1)
    expect(wrapper.find('switch-the_name').prop('checked')).toBe(true)
  })

  it('renders boolean field disabled', () => {
    let wrapper = wrap({ type: 'boolean', name: 'the_name', disabled: true })
    expect(wrapper.find('switch-the_name').prop('disabled')).toBe(true)
  })

  it('renders text input field with correct label and value', () => {
    let wrapper = wrap({ type: 'string', name: 'the_name', value: 'the_value' })
    expect(wrapper.findText('label')).toBe('The Name')
    expect(wrapper.find('textInput-the_name').length).toBe(1)
    expect(wrapper.find('textInput-the_name').prop('value')).toBe('the_value')
  })

  it('renders text input field with password, large, disabled, highlighted and required', () => {
    let wrapper = wrap({
      type: 'string',
      name: 'the_name',
      value: 'the_value',
      password: true,
      large: true,
      disabled: true,
      highlight: true,
      required: true,
    })
    let textInput = wrapper.find('textInput-the_name')
    expect(textInput.prop('type')).toBe('password')
    expect(textInput.prop('large')).toBe(true)
    expect(textInput.prop('disabled')).toBe(true)
    expect(textInput.prop('highlight')).toBe(true)
    expect(textInput.prop('required')).toBe(true)
  })

  it('renders integer dropdown field with correct items', () => {
    let wrapper = wrap({
      type: 'integer',
      name: 'the_name',
      value: 11,
      minimum: 10,
      maximum: 15,
    })
    let dropdown = wrapper.find('dropdown-the_name')
    expect(dropdown.prop('selectedItem')).toBe(11)
    expect(dropdown.prop('items')[3].value).toBe(13)
    expect(dropdown.prop('items')[5].value).toBe(15)
  })

  it('renders radio input field with correct value', () => {
    let wrapper = wrap({ type: 'radio', name: 'the_name', value: true })
    let radioInput = wrapper.find('radioInput-the_name')
    expect(radioInput.length).toBe(1)
    expect(radioInput.prop('checked')).toBe(true)
  })
})
