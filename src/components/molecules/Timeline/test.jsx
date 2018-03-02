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
import Timeline from '.'

const wrap = props => shallow(<Timeline {...props} />)

let items = [
  { id: 'item-1', status: 'ERROR', created_at: new Date(2017, 1, 2) },
  { id: 'item-2', status: 'COMPLETED', created_at: new Date(2017, 2, 3) },
  { id: 'item-3', status: 'RUNNING', created_at: new Date(2017, 3, 4) },
]

it('renders with correct dates', () => {
  let wrapper = wrap({ items, selectedItem: items[2] })
  let itemsWrapper = wrapper.childAt(2).childAt(0)
  expect(itemsWrapper.childAt(0).html().indexOf('02 Feb 2017')).toBeGreaterThan(-1)
  expect(itemsWrapper.childAt(1).html().indexOf('03 Mar 2017')).toBeGreaterThan(-1)
  expect(itemsWrapper.childAt(2).html().indexOf('04 Apr 2017')).toBeGreaterThan(-1)
})

it('dispatches item click', () => {
  let onItemClick = sinon.spy()
  let wrapper = wrap({ items, selectedItem: items[2], onItemClick })
  wrapper.childAt(2).childAt(0).childAt(1).simulate('click')
  expect(onItemClick.args[0][0].id).toBe('item-2')
})

it('dispatches next and previous click', () => {
  let onPreviousClick = sinon.spy()
  let onNextClick = sinon.spy()
  let wrapper = wrap({ items, selectedItem: items[2], onPreviousClick, onNextClick })
  wrapper.find('Styled(Arrow)').at(0).simulate('click')
  wrapper.find('Styled(Arrow)').at(1).simulate('click')
  expect(onPreviousClick.calledOnce).toBe(true)
  expect(onNextClick.calledOnce).toBe(true)
})
