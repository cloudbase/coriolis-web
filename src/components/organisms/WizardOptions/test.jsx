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
import WizardOptions from '.'

const wrap = props => new TW(shallow(
  // $FlowIgnore
  <WizardOptions {...props} />
), 'wOptions')

let fields = [
  {
    name: 'string_field',
    type: 'string',
  },
  {
    name: 'string_field_with_default',
    type: 'string',
    default: 'default',
  },
  {
    required: true,
    name: 'required_string_field',
    type: 'string',
  },
  {
    name: 'enum_field',
    type: 'string',
    // $FlowIgnore
    enum: ['enum 1', 'enum 2', 'enum 3'],
  },
  {
    name: 'boolean_field',
    type: 'boolean',
  },
  {
    name: 'strict_boolean_field',
    type: 'strict-boolean',
  },
]

describe('WizardOptions Component', () => {
  it('has description and required field in simple tab', () => {
    let wrapper = wrap({ fields, selectedInstances: [] })
    expect(wrapper.find('field-', true).length).toBe(2)
    expect(wrapper.find('field-description').length).toBe(1)
    expect(wrapper.find('field-required_string_field').length).toBe(1)
  })

  it('renders execute now for replica', () => {
    let wrapper = wrap({ fields, selectedInstances: [], wizardType: 'replica' })
    expect(wrapper.find('field-execute_now').length).toBe(1)
    expect(wrapper.find('field-execute_now_options').length).toBe(1)
  })

  it('renders skip os morphing for migration', () => {
    let wrapper = wrap({ fields, selectedInstances: [], wizardType: 'migration' })
    expect(wrapper.find('field-skip_os_morphing').length).toBe(1)
  })

  it('renders separate / vm if multiple instances are selected', () => {
    let wrapper = wrap({ fields, selectedInstances: [{}, {}] })
    expect(wrapper.find('field-separate_vm').length).toBe(1)
  })

  it('renders correct number of fields in advanced tab', () => {
    let wrapper = wrap({ fields, selectedInstances: [], useAdvancedOptions: true })
    expect(wrapper.find('field-', true).length).toBe(fields.length + 1)
  })

  it('renders correct field info', () => {
    let wrapper = wrap({ fields, selectedInstances: [], useAdvancedOptions: true })

    expect(wrapper.find('field-description').prop('type')).toBe('string')
    expect(wrapper.find('field-required_string_field').prop('required')).toBe(true)
    expect(wrapper.find('field-string_field').prop('type')).toBe('string')
    expect(wrapper.find('field-string_field_with_default').prop('value')).toBe('default')
    expect(wrapper.find('field-enum_field').prop('enum')[0]).toBe('enum 1')
    expect(wrapper.find('field-enum_field').prop('enum')[1]).toBe('enum 2')
    expect(wrapper.find('field-boolean_field').prop('type')).toBe('boolean')
    expect(wrapper.find('field-strict_boolean_field').prop('type')).toBe('strict-boolean')
  })

  it('renders data into field', () => {
    let wrapper = wrap({ fields, selectedInstances: [], useAdvancedOptions: true, data: { string_field: 'new data' } })
    expect(wrapper.find('field-string_field').prop('value')).toBe('new data')
  })
})
