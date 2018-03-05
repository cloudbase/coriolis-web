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
import LoginOptions from '.'

const wrap = props => shallow(<LoginOptions {...props} />)

let buttons = [
  {
    name: 'Google',
    id: 'google',
    url: '',
  },
  {
    name: 'Microsoft',
    id: 'microsoft',
    url: '',
  },
  {
    name: 'Facebook',
    id: 'facebook',
    url: '',
  },
  {
    name: 'GitHub',
    id: 'github',
    url: '',
  },
]

it('renders with given buttons', () => {
  let wrapper = wrap({ buttons })
  expect(wrapper.children().length).toBe(4)
  expect(wrapper.childAt(2).prop('id')).toBe('facebook')
  expect(wrapper.childAt(1).html().indexOf('Sign in with Microsoft')).toBeGreaterThan(-1)
})
