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
import Button from '.'

const wrap = props => shallow(<Button {...props} />)

describe('Button Component', () => {
  it('renders with different combination of props', () => {
    let wrapper = wrap({ disabled: true })
    expect(wrapper.prop('disabled')).toBe(true)
    wrapper = wrap({ primary: true })
    expect(wrapper.prop('disabled')).toBe(undefined)
    expect(wrapper.prop('primary')).toBe(true)
    wrapper = wrap({ disabled: true, primary: true })
    expect(wrapper.prop('disabled')).toBe(true)
    expect(wrapper.prop('primary')).toBe(true)
  })

  it('dispatches click event', () => {
    const onButtonClick = sinon.spy()
    const wrapper = wrap({ onClick: onButtonClick })
    wrapper.simulate('click')
    expect(onButtonClick.calledOnce).toBe(true)
  })
})
