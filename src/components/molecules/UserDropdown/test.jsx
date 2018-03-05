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
import UserDropdown from '.'

const wrap = props => shallow(<UserDropdown {...props} />)

let user = { name: 'User name', email: 'email@email.com' }

it('opens dropdown on click', () => {
  let wrapper = wrap({ user })
  wrapper.childAt(0).simulate('click')
  expect(wrapper.childAt(1).children().length).toBe(2)
})

it('renders user info', () => {
  let wrapper = wrap({ user })
  wrapper.childAt(0).simulate('click')
  expect(wrapper.childAt(1).html().indexOf('User name')).toBeGreaterThan(-1)
  expect(wrapper.childAt(1).html().indexOf('email@email.com')).toBeGreaterThan(-1)
})

it('dispatches item click', () => {
  let onItemClick = sinon.spy()
  let wrapper = wrap({ user, onItemClick })
  wrapper.childAt(0).simulate('click')
  let signout = wrapper.findWhere(w => w.prop('onClick') && w.html().indexOf('Sign Out') > -1)
  signout.simulate('click')
  expect(onItemClick.args[0][0].value).toBe('signout')
})
