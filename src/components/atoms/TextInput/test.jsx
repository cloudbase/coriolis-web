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
import sinon from 'sinon'
import TestWrapper from '../../../utils/TestWrapper'
import TextInput from '.'

const wrap = props => new TestWrapper(shallow(<TextInput {...props} />), 'textInput')

describe('TextInput Component', () => {
  it('dispatches change', () => {
    const onChange = sinon.spy()
    const wrapper = wrap({ value: 'the_value', onChange })
    const input = wrapper.find('input')
    expect(input.prop('value')).toBe('the_value')
    input.simulate('change', { value: 'A' })
    expect(onChange.args[0][0].value).toBe('A')
  })

  it('shows close icon', () => {
    let wrapper = wrap()
    let close = wrapper.find('close')
    expect(close.prop('show')).toBe(undefined)
    wrapper = wrap({ showClose: true, value: 'the_value' })
    close = wrapper.find('close')
    expect(close.prop('show')).toBe(true)
    wrapper = wrap({ showClose: true, value: '' })
    close = wrapper.find('close')
    expect(close.prop('show')).toBe(false)
    wrapper = wrap({ showClose: true })
    close = wrapper.find('close')
    expect(close.prop('show')).toBe(false)
  })
})
