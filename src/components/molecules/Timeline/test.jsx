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
import Timeline from '.'

const wrap = props => new TW(shallow(
  // $FlowIgnore
  <Timeline {...props} />
), 'timeline')

let items = [
  { id: 'item-1', status: 'ERROR', created_at: new Date(2017, 1, 2) },
  { id: 'item-2', status: 'COMPLETED', created_at: new Date(2017, 2, 3) },
  { id: 'item-3', status: 'RUNNING', created_at: new Date(2017, 3, 4) },
]

describe('Timeline Component', () => {
  it('renders with correct dates', () => {
    let wrapper = wrap({ items, selectedItem: items[2] })
    expect(wrapper.findPartialId('label-').length).toBe(items.length)
    items.forEach(item => {
      expect(wrapper.findText(`label-${item.id}`)).toBe(moment(item.created_at).format('DD MMM YYYY'))
    })
  })

  it('dispatches item click', () => {
    let onItemClick = sinon.spy()
    let wrapper = wrap({ items, selectedItem: items[2], onItemClick })
    wrapper.find(`item-${items[1].id}`).simulate('click')
    expect(onItemClick.args[0][0].id).toBe('item-2')
  })

  it('dispatches next and previous click', () => {
    let onPreviousClick = sinon.spy()
    let onNextClick = sinon.spy()
    let wrapper = wrap({ items, selectedItem: items[2], onPreviousClick, onNextClick })
    wrapper.find('previous').simulate('click')
    wrapper.find('next').simulate('click')
    expect(onPreviousClick.calledOnce).toBe(true)
    expect(onNextClick.calledOnce).toBe(true)
  })
})
