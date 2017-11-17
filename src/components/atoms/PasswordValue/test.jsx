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
import PasswordValue from './PasswordValue'

const wrap = props => shallow(<PasswordValue {...props} />)
const text = html => html.substring(html.indexOf('>') + 1, html.lastIndexOf('<'))
it('conceals the password', () => {
  let password = text(wrap({ value: 'test' }).children().first().html())
  expect(password).toBe('•••••••••')
})

it('reveals password on click', () => {
  let wrapper = wrap({ value: 'test' })
  wrapper.simulate('click')
  let password = text(wrapper.children().first().html())
  expect(password).toBe('test')
})
