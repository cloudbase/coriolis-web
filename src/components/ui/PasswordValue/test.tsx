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
import TestWrapper from '@src/utils/TestWrapper'
import PasswordValue from '.'

const wrap = props => new TestWrapper(shallow(<PasswordValue value="the_value" {...props} />), 'passwordValue')

describe('PasswordValue Component', () => {
  it('conceals the password', () => {
    const wrapper = wrap()
    expect(wrapper.findText('value')).toBe('•••••••••')
  })

  it('reveals password on click', () => {
    const wrapper = wrap()
    wrapper.simulate('click')
    expect(wrapper.findText('value')).toBe('the_value')
  })
})
