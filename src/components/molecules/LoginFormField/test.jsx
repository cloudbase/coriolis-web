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
import LoginFormField from '.'

const wrap = props => new TestWrapper(shallow(
  // $FlowIgnore
  <LoginFormField {...props} />
), 'loginFormField')

describe('LoginFormField Component', () => {
  it('renders with correct label', () => {
    let wrapper = wrap({ label: 'Username' })
    expect(wrapper.findText('label')).toBe('Username')
  })

  it('dispatches change on input change', () => {
    const onChange = sinon.spy()
    let wrapper = wrap({ label: 'Username', onChange })
    wrapper.find('input').simulate('change', { t: 't' })
    expect(onChange.args[0][0].t).toBe('t')
  })
})
