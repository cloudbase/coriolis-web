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
import EndpointValidation from '.'

const wrap = props => new TW(shallow(
  // $FlowIgnore
  <EndpointValidation {...props} />
), 'eValidation')

describe('EndpointValidation Component', () => {
  it('renders loading', () => {
    let wrapper = wrap({ loading: true })
    expect(wrapper.find('status').prop('loading')).toBe(true)
    expect(wrapper.findText('title')).toBe('Validating Endpoint')
  })

  it('renders valid', () => {
    let wrapper = wrap({ validation: { valid: true } })
    expect(wrapper.find('status').prop('status')).toBe('COMPLETED')
    expect(wrapper.findText('title')).toBe('Endpoint is Valid')
  })

  it('renders failed with default message', () => {
    let wrapper = wrap({ validation: {} })
    expect(wrapper.find('status').prop('status')).toBe('ERROR')
    expect(wrapper.findText('title')).toBe('Validation Failed')
    expect(wrapper.findText('errorMessage')).toBe('An unexpected error occurred.<CopyButton />')
  })

  it('renders failed with custom message', () => {
    let wrapper = wrap({ validation: { message: 'custom_message' } })
    expect(wrapper.find('status').prop('status')).toBe('ERROR')
    expect(wrapper.findText('title')).toBe('Validation Failed')
    expect(wrapper.findText('errorMessage')).toBe('custom_message<CopyButton />')
  })
})
