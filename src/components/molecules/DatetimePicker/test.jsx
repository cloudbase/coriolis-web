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
import DatetimePicker from '.'

const wrap = props => shallow(<DatetimePicker {...props} />)

it('renders date value in dropdown label', () => {
  let onChange = sinon.spy()
  let wrapper = wrap({ value: new Date(2017, 3, 21, 14, 22), onChange })
  let label = '21/04/2017 02:22 PM'
  expect(wrapper.children().at(0).prop('value')).toBe(label)
})

it('renders date value in UTC timezone in dropdown label', () => {
  let onChange = sinon.spy()
  let wrapper = wrap({ value: new Date(2017, 3, 21, 14, 22), onChange, timezone: 'utc' })
  let label = '21/04/2017 12:22 PM'
  expect(wrapper.children().at(0).prop('value')).toBe(label)
})

it('opens Datetime component on dropdown click', () => {
  let onChange = sinon.spy()
  let wrapper = wrap({ value: new Date(2017, 3, 21, 14, 22), onChange })
  expect(wrapper.children().at(1).prop('open')).toBe(false)
  wrapper.children().at(0).simulate('click')
  expect(wrapper.children().at(1).prop('open')).toBe(true)
})
