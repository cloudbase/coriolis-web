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
import DropdownButton from './DropdownButton'

const wrap = props => shallow(<DropdownButton {...props} />).dive()

it('renders the given value', () => {
  let text = wrap({ value: 'test' }).children().first()
  expect(text.html().indexOf('test')).toBeGreaterThan(-1)
})

it('calls click handler', () => {
  let onClick = sinon.spy()
  let wrapper = wrap({ onClick })
  wrapper.simulate('click')
  expect(onClick.calledOnce).toBe(true)
})

it('doesn\'t call click handler if disabled', () => {
  let onClick = sinon.spy()
  let wrapper = wrap({ onClick, disabled: true })
  wrapper.simulate('click')
  expect(onClick.notCalled).toBe(true)
})
