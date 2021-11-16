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
import TW from '@src/utils/TestWrapper'
import WizardType from '.'

const wrap = props => new TW(shallow(<WizardType onChange={() => { }} {...props} />), 'wType')

describe('WizardType Component', () => {
  it('renders with the correct type selected', () => {
    let wrapper = wrap({ selected: 'migration' })
    expect(wrapper.find('switch').prop('checked')).toBe(false)
    wrapper = wrap({ selected: 'replica' })
    expect(wrapper.find('switch').prop('checked')).toBe(true)
  })

  it('dispatches change', () => {
    let onChange = sinon.spy()
    let wrapper = wrap({ selected: 'replica', onChange })
    wrapper.find('switch').simulate('change', { passed: true })
    expect(onChange.args[0][0].passed).toBe(true)
  })
})



