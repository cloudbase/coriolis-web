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
import LoginForm from './LoginForm'

const wrap = props => shallow(<LoginForm {...props} />)

it('renders incorrect credentials', () => {
  let wrapper = wrap({ loginFailedResponse: { status: 401 } })
  expect(wrapper.html().indexOf('The username or password did not match. Please try again.')).toBeGreaterThan(-1)
})

it('renders server error', () => {
  let wrapper = wrap({ loginFailedResponse: {} })
  expect(wrapper.html().indexOf('Request failed, there might be a problem with the connection to the server.')).toBeGreaterThan(-1)
})

it('submits correct info', () => {
  let onFormSubmit = sinon.spy()
  let wrapper = wrap({ onFormSubmit })
  wrapper.findWhere(w => w.name() === 'LoginFormField' && w.prop('name') === 'username')
    .simulate('change', { target: { value: 'usr' } })
  wrapper.findWhere(w => w.name() === 'LoginFormField' && w.prop('name') === 'password')
    .simulate('change', { target: { value: 'pswd' } })

  wrapper.simulate('submit', { preventDefault: () => { } })
  expect(onFormSubmit.args[0][0].username).toBe('usr')
  expect(onFormSubmit.args[0][0].password).toBe('pswd')
})
