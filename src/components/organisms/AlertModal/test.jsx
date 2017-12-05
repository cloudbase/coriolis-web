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
import AlertModal from './AlertModal'

const wrap = props => shallow(<AlertModal {...props} />)

it('renders confirmation as default', () => {
  let wrapper = wrap({ message: 'alert-message', extraMessage: 'alert-extra' })
  expect(wrapper.findWhere(w => w.prop('type') === 'confirmation')).toBeTruthy()
})

it('renders message and extra message', () => {
  let wrapper = wrap({ message: 'alert-message', extraMessage: 'alert-extra' })
  expect(wrapper.childAt(0).html().indexOf('alert-message')).toBeGreaterThan(-1)
  expect(wrapper.childAt(0).html().indexOf('alert-extra')).toBeGreaterThan(-1)
})

it('has correct buttons for confirmation', () => {
  let wrapper = wrap({ message: 'alert-message', extraMessage: 'alert-extra' })
  expect(wrapper.find('Button').at(0).prop('secondary')).toBe(true)
  expect(wrapper.find('Button').at(0).html().indexOf('No')).toBeGreaterThan(-1)
  expect(wrapper.find('Button').at(1).html().indexOf('Yes')).toBeGreaterThan(-1)
})

it('has correct button for error', () => {
  let wrapper = wrap({ message: 'alert-message', extraMessage: 'alert-extra', type: 'error' })
  expect(wrapper.find('Button').prop('secondary')).toBe(true)
  expect(wrapper.find('Button').html().indexOf('Dismiss')).toBeGreaterThan(-1)
})

it('renders loading', () => {
  let wrapper = wrap({ message: 'alert-message', extraMessage: 'alert-extra', type: 'loading' })
  expect(wrapper.find('StatusImage').prop('loading')).toBe(true)
})

it('renders loading with no buttons', () => {
  let wrapper = wrap({ message: 'alert-message', extraMessage: 'alert-extra', type: 'loading' })
  expect(wrapper.find('Button').length).toBe(0)
})
