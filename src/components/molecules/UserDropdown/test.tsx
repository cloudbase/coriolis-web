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
import TW from '../../../utils/TestWrapper'
import UserDropdown from '.'

const wrap = props => new TW(shallow(
  
  <UserDropdown {...props} />
), 'userDropdown')

let user = { name: 'User name', email: 'email@email.com' }

describe('UserDropdown Component', () => {
  it('opens dropdown on click', () => {
    let wrapper = wrap({ user })
    expect(wrapper.find('username').length).toBe(0)
    wrapper.find('button').simulate('click')
    expect(wrapper.find('username').length).toBe(1)
  })

  // it('renders user info', () => {
  //   let wrapper = wrap({ user })
  //   wrapper.find('button').simulate('click')
  //   expect(wrapper.findText('username')).toBe(user.name)
  // })

  it('dispatches item click', () => {
    let onItemClick = sinon.spy()
    let wrapper = wrap({ user, onItemClick })
    wrapper.find('button').simulate('click')
    wrapper.find('label-signout').simulate('click')
    expect(onItemClick.args[0][0].value).toBe('signout')
  })
})



