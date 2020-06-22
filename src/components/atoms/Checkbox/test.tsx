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
import sinon from 'sinon'
import Checkbox from '.'

const wrap = props => shallow(<Checkbox {...props} />)

describe('Checkbox Component', () => {
  it('passes `checked` to the component', () => {
    let wrapper = wrap({ checked: true, onChange: () => {} })
    expect(wrapper.prop('checked')).toBe(true)
  })

  it('calls `onChange` with correct value, on click', () => {
    let onChange = sinon.spy()
    let wrapper = wrap({ checked: false, onChange })
    wrapper.simulate('click')
    expect(onChange.args[0][0]).toBe(true)
  })

  it('doesn\'t call `onChange` if disabled', () => {
    let onChange = sinon.spy()
    let wrapper = wrap({ checked: false, onChange, disabled: true })
    wrapper.simulate('click')
    expect(onChange.notCalled).toBe(true)
  })
})



