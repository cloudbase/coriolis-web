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
import EndpointValidation from './EndpointValidation'

const wrap = props => shallow(<EndpointValidation {...props} />)

it('renders loading', () => {
  let wrapper = wrap({ loading: true })
  expect(wrapper.find('StatusImage').prop('loading')).toBe(true)
  expect(wrapper.html().indexOf('Validating')).toBeGreaterThan(-1)
})

it('renders valid', () => {
  let wrapper = wrap({ validation: { valid: true } })
  expect(wrapper.find('StatusImage').prop('status')).toBe('COMPLETED')
  expect(wrapper.html().indexOf('Endpoint is Valid')).toBeGreaterThan(-1)
})

it('renders failed with default message', () => {
  let wrapper = wrap({ validation: { } })
  expect(wrapper.find('StatusImage').prop('status')).toBe('ERROR')
  expect(wrapper.html().indexOf('An unexpected error occurred.')).toBeGreaterThan(-1)
})

it('renders failed with custom message', () => {
  let wrapper = wrap({ validation: { message: 'custom_message' } })
  expect(wrapper.find('StatusImage').prop('status')).toBe('ERROR')
  expect(wrapper.html().indexOf('custom_message')).toBeGreaterThan(-1)
})
