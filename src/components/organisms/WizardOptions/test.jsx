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
import WizardOptions from '.'

const wrap = props => shallow(<WizardOptions {...props} />)

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

it('has description and required field in simple tab', () => {
  let wrapper = wrap({ fields, selectedInstances: [] })
  let optionsFields = wrapper.find('Styled(WizardOptionsField)')
  expect(optionsFields.length).toBe(2)
  expect(optionsFields.at(0).prop('name')).toBe('description')
  expect(optionsFields.at(1).prop('name')).toBe('required_string_field')
})

it('renders execute now for replica', () => {
  let wrapper = wrap({ fields, selectedInstances: [], wizardType: 'replica' })
  expect(wrapper.findWhere(w => w.name() === 'Styled(WizardOptionsField)' && w.prop('name') === 'execute_now').length).toBe(1)
  expect(wrapper.findWhere(w => w.name() === 'Styled(WizardOptionsField)' && w.prop('name') === 'execute_now_options').length).toBe(1)
})

it('renders skip os morphing for migration', () => {
  let wrapper = wrap({ fields, selectedInstances: [], wizardType: 'migration' })
  expect(wrapper.findWhere(w => w.name() === 'Styled(WizardOptionsField)' && w.prop('name') === 'skip_os_morphing').length).toBe(1)
})

it('renders separate / vm if multiple instances are selected', () => {
  let wrapper = wrap({ fields, selectedInstances: [{}, {}] })
  expect(wrapper.findWhere(w => w.name() === 'Styled(WizardOptionsField)' && w.prop('name') === 'separate_vm').length).toBe(1)
})

it('renders correct number of fields in advanced tab', () => {
  let wrapper = wrap({ fields, selectedInstances: [], useAdvancedOptions: true })
  let optionsFields = wrapper.find('Styled(WizardOptionsField)')
  expect(optionsFields.length).toBe(fields.length + 1)
})

it('renders correct field info', () => {
  let wrapper = wrap({ fields, selectedInstances: [], useAdvancedOptions: true })
  let findField = name => {
    let field = wrapper.findWhere(w => w.name() === 'Styled(WizardOptionsField)' && w.prop('name') === name)
    expect(field.length).toBe(1)
    return field
  }
  expect(findField('description').prop('type')).toBe('string')
  expect(findField('required_string_field').prop('required')).toBe(true)
  expect(findField('string_field').prop('type')).toBe('string')
  expect(findField('string_field_with_default').prop('value')).toBe('default')
  expect(findField('enum_field').prop('enum')[0]).toBe('enum 1')
  expect(findField('enum_field').prop('enum')[1]).toBe('enum 2')
  expect(findField('boolean_field').prop('type')).toBe('boolean')
  expect(findField('strict_boolean_field').prop('type')).toBe('strict-boolean')
})

it('renders data into field', () => {
  let wrapper = wrap({ fields, selectedInstances: [], useAdvancedOptions: true, data: { string_field: 'new data' } })
  expect(wrapper.findWhere(w => w.name() === 'Styled(WizardOptionsField)' && w.prop('name') === 'string_field').prop('value')).toBe('new data')
})
