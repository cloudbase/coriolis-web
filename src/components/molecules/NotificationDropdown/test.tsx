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

import type { NotificationItemData } from '../../../@types/NotificationItem'
import TW from '../../../utils/TestWrapper'
import NotificationDropdown from '.'
import type { Props } from '.'

const wrap = (props: Props) => new TW(shallow(
  <NotificationDropdown {...props} />
), 'notificationDropdown')

let items: NotificationItemData[] = [
  {
    id: '1',
    name: 'notif-1',
    description: 'desc-1',
    type: 'replica',
    status: 'COMPLETED',
    unseen: false,
  },
  {
    id: '2',
    name: 'notif-2',
    description: 'desc-2',
    type: 'migration',
    status: 'RUNNING',
    unseen: true,
  },
  {
    id: '3',
    name: 'notif-3',
    description: 'desc-3',
    type: 'replica',
    status: 'ERROR',
    unseen: false,
  },
]

describe('NotificationDropdown Component', () => {
  it('renders no items message on click', () => {
    let wrapper = wrap({ onClose: () => { }, items: [] })
    expect(wrapper.find('noItems').length).toBe(0)
    wrapper.find('button').simulate('click')
    expect(wrapper.find('noItems').length).toBe(1)
    expect(wrapper.find('bell-badge').length).toBe(0)
    expect(wrapper.find('bell-loading').length).toBe(0)
  })

  it('renders items correctly', () => {
    let wrapper = wrap({ items, onClose: () => { } })
    wrapper.find('button').simulate('click')
    expect(wrapper.find('bell-badge').length).toBe(1)
    expect(wrapper.find('bell-loading').length).toBe(1)

    items.forEach(item => {
      expect(wrapper.find(`${item.id}-status`).prop('status')).toBe(item.status)
      expect(wrapper.findText(`${item.id}-type`)).toBe(item.type === 'replica' ? 'RE' : 'MI')
      expect(wrapper.findText(`${item.id}-name`)).toBe(item.name)
      expect(wrapper.findText(`${item.id}-description`)).toBe(item.description)
      expect(wrapper.find(`${item.id}-badge`).length).toBe(item.unseen ? 1 : 0)
    })
  })

  it('renders button bell badge', () => {
    let wrapper = wrap({ items: items.map(i => { return { ...i, unseen: false } }), onClose: () => { } })
    expect(wrapper.find('bell-badge').length).toBe(0)
    expect(wrapper.find('bell-loading').length).toBe(1)
    wrapper = wrap({ items: items.map(i => { return { ...i, status: 'COMPLETED' } }), onClose: () => { } })
    expect(wrapper.find('bell-badge').length).toBe(1)
    expect(wrapper.find('bell-loading').length).toBe(0)
  })

  it('dispatches onClose', () => {
    let onClose = sinon.spy()
    let wrapper = wrap({ items, onClose })
    wrapper.find('button').simulate('click')
    wrapper.find(`${items[0].id}-item`).simulate('click')
    expect(onClose.calledOnce).toBe(true)
  })
})



