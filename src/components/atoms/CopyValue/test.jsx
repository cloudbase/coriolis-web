/*
Copyright (C) 2018  Cloudbase Solutions SRL
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
import CopyValue from '.'

const wrap = props => new TestWrapper(shallow(<CopyValue value="the_value" {...props} />), 'copyValue')

describe('CopyValue Component', () => {
  it('renders `value`', () => {
    const wrapper = wrap()
    expect(wrapper.findText('value')).toBe('the_value')
  })

  it('copies `value` to clipboard', () => {
    const onCopy = sinon.spy()
    const wrapper = wrap({ onCopy })
    wrapper.simulate('click')
    expect(onCopy.calledOnce).toBe(true)
    expect(onCopy.args[0][0]).toBe('the_value')
  })
})
