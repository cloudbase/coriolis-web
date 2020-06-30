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

import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'
import CopyMultilineValue from '.'

const wrap = props => shallow(<CopyMultilineValue value="" {...props} />)

describe('CopyMultilineValue Component', () => {
  it('renders `value`', () => {
    const wrapper = wrap({ value: 'the_value' })
    expect(wrapper.dive().text()).toBe('the_value<Styled(CopyButton) />')
  })

  it('copies `value` to clipboard', () => {
    const onCopy = sinon.spy()
    const wrapper = wrap({ value: 'the_value', onCopy })
    wrapper.simulate('click')
    expect(onCopy.calledOnce).toBe(true)
    expect(onCopy.args[0][0]).toBe('the_value')
  })
})



