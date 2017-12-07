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
    id: new Date().getTime() + 1,
    message: 'A full VM migration between two clouds',
    level: 'success',
    options: { persistInfo: { title: 'Migration' } },
  },
  {
    id: new Date().getTime() + 2,
    message: 'Incrementally replicate virtual machines',
    level: 'error',
    options: { persistInfo: { title: 'Replica' } },
  },
  {
    id: new Date().getTime() + 3,
    message: 'A conection to a public or private cloud',
    level: 'info',
    options: { persistInfo: { title: 'Endpoint' } },
  },
]

it('renders no items message on click', () => {
  let wrapper = wrap({ onClose: () => { } })
  expect(wrapper.children().length).toBe(1)
  wrapper.childAt(0).simulate('click')
  expect(wrapper.childAt(1).html().indexOf('There are no notifications')).toBeGreaterThan(-1)
})

it('renders items correctly', () => {
  let wrapper = wrap({ items, onClose: () => { } })
  expect(wrapper.children().length).toBe(1)
  wrapper.childAt(0).simulate('click')
  let itemsWrapper = wrapper.childAt(1)
  expect(itemsWrapper.findWhere(w => w.prop('level') === 'success').length).toBe(1)
  expect(itemsWrapper.findWhere(w => w.prop('level') === 'info').length).toBe(1)
  expect(itemsWrapper.findWhere(w => w.prop('level') === 'error').length).toBe(1)
  expect(itemsWrapper.childAt(1).html().indexOf('Incrementally replicate virtual machines')).toBeGreaterThan(-1)
})

it('dispatches onClose', () => {
  let onClose = sinon.spy()
  let wrapper = wrap({ items, onClose })
  expect(wrapper.children().length).toBe(1)
  wrapper.childAt(0).simulate('click')
  let itemsWrapper = wrapper.childAt(1)
  itemsWrapper.childAt(2).simulate('click')
  expect(onClose.calledOnce).toBe(true)
})
