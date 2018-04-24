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

// @flow

import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'
import moment from 'moment'
import TW from '../../../utils/TestWrapper'
import NotificationDropdown from '.'

const wrap = props => new TW(shallow(
  // $FlowIgnore
  <NotificationDropdown {...props} />
), 'notificationDropdown')

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

describe('NotificationDropdown Component', () => {
  it('renders no items message on click', () => {
    let wrapper = wrap({ onClose: () => { } })
    expect(wrapper.find('noItems').length).toBe(0)
    wrapper.find('button').simulate('click')
    expect(wrapper.find('noItems').length).toBe(1)
  })

  it('renders items correctly', () => {
    let wrapper = wrap({ items, onClose: () => { } })
    wrapper.find('button').simulate('click')

    items.forEach(item => {
      expect(wrapper.find(`item-${item.id}`).find('itemLevel').prop('level')).toBe(item.level)
      expect(wrapper.find(`item-${item.id}`).findText('itemTitle')).toBe(item.options.persistInfo.title)
      expect(wrapper.find(`item-${item.id}`).findText('itemDescription')).toBe(item.message)
      expect(wrapper.find(`item-${item.id}`).findText('itemTime')).toBe(moment(Number(item.id)).format('HH:mm'))
    })
  })

  it('dispatches onClose', () => {
    let onClose = sinon.spy()
    let wrapper = wrap({ items, onClose })
    wrapper.find('button').simulate('click')
    wrapper.find(`item-${items[0].id}`).simulate('click')
    expect(onClose.calledOnce).toBe(true)
  })
})
