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
import NotificationDropdown from './NotificationDropdown'

const wrap = props => shallow(<NotificationDropdown {...props} />)

let items = [
  {
    title: 'Migration',
    time: '12:53 PM',
    description: 'A full VM migration between two clouds',
    icon: { info: true },
  }, {
    title: 'Replica',
    time: '12:53 PM',
    description: 'Incrementally replicate virtual machines',
    icon: { error: true },
  }, {
    title: 'Endpoint',
    time: '12:53 PM',
    description: 'A conection to a public or private cloud',
    icon: { success: true },
  },
]

it('renders no items message on click', () => {
  let wrapper = wrap()
  expect(wrapper.children().length).toBe(1)
  wrapper.childAt(0).simulate('click')
  expect(wrapper.childAt(1).html().indexOf('There are no notifications')).toBeGreaterThan(-1)
})

it('renders items correctly', () => {
  let wrapper = wrap({ items })
  expect(wrapper.children().length).toBe(1)
  wrapper.childAt(0).simulate('click')
  let itemsWrapper = wrapper.childAt(1)
  expect(itemsWrapper.findWhere(w => w.prop('success')).length).toBe(1)
  expect(itemsWrapper.findWhere(w => w.prop('info')).length).toBe(1)
  expect(itemsWrapper.findWhere(w => w.prop('error')).length).toBe(1)
  expect(itemsWrapper.childAt(1).html().indexOf('Incrementally replicate virtual machines')).toBeGreaterThan(-1)
})

it('dispatches item click', () => {
  let onItemClick = sinon.spy()
  let wrapper = wrap({ items, onItemClick })
  expect(wrapper.children().length).toBe(1)
  wrapper.childAt(0).simulate('click')
  let itemsWrapper = wrapper.childAt(1)
  itemsWrapper.childAt(2).simulate('click')
  expect(onItemClick.args[0][0].title).toBe('Endpoint')
})
