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
import NewItemDropdown from './NewItemDropdown'

const wrap = props => shallow(<NewItemDropdown {...props} />)

it('opens list on click', () => {
  let wrapper = wrap()
  expect(wrapper.children().length).toBe(1)
  wrapper.childAt(0).simulate('click')
  expect(wrapper.children().length).toBe(2)
  expect(wrapper.childAt(1).children().length).toBe(3)
})

it('dispatches change on item click with correct args', () => {
  let onChange = sinon.spy()
  let wrapper = wrap({ onChange })
  wrapper.childAt(0).simulate('click')
  wrapper.childAt(1).childAt(1).simulate('click')
  expect(onChange.args[0][0].value).toBe('replica')
})
