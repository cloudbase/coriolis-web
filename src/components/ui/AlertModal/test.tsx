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
import TW from '../../../utils/TestWrapper'
import AlertModal from '.'

const wrap = props => new TW(shallow(<AlertModal {...props} />), 'aModal')

describe('AlertModal Component', () => {
  it('renders confirmation as default with message and extra message', () => {
    let wrapper = wrap({ message: 'alert-message', extraMessage: 'alert-extra' })
    expect(wrapper.findText('message')).toBe('alert-message')
    expect(wrapper.findText('extraMessage')).toBe('alert-extra')
    expect(wrapper.find('status').prop('status')).toBe('confirmation')
    expect(wrapper.find('noButton').length).toBe(1)
    expect(wrapper.find('yesButton').length).toBe(1)
    expect(wrapper.find('dismissButton').length).toBe(0)
  })

  it('has correct buttons for confirmation', () => {
    let wrapper = wrap({ message: 'alert-message', extraMessage: 'alert-extra' })
    expect(wrapper.find('noButton').prop('secondary')).toBe(true)
    expect(wrapper.find('yesButton').prop('secondary')).toBe(undefined)
    expect(wrapper.find('noButton').shallow.dive().dive().text()).toBe('No')
    expect(wrapper.find('yesButton').shallow.dive().dive().text()).toBe('Yes')
  })

  it('has correct button for error', () => {
    let wrapper = wrap({ message: 'alert-message', extraMessage: 'alert-extra', type: 'error' })
    expect(wrapper.find('dismissButton').length).toBe(1)
  })

  it('renders loading', () => {
    let wrapper = wrap({ message: 'alert-message', extraMessage: 'alert-extra', type: 'loading' })
    expect(wrapper.find('status').prop('status')).toBe('RUNNING')
    expect(wrapper.find('noButton').length).toBe(0)
    expect(wrapper.find('yesButton').length).toBe(0)
    expect(wrapper.find('dismissButton').length).toBe(0)
  })
})



