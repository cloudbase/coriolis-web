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
import MainListFilter from '.'

const wrap = props => shallow(<MainListFilter {...props} />)

let items = [
  { label: 'Item 1', value: 'item-1' },
  { label: 'Item 2', value: 'item-2' },
  { label: 'Item 3', value: 'item-3' },
]

let actions = [
  { label: 'Action 1', value: 'action-1' },
  { label: 'Action 2', value: 'action-2' },
]

let selectionInfo = { selected: 2, total: 7, label: 'items' }

it('renders given items', () => {
  let wrapper = wrap({ items, actions, selectionInfo })
  expect(wrapper.childAt(0).childAt(1).children().length).toBe(3)
  expect(wrapper.childAt(0).childAt(1).childAt(1).html().indexOf('Item 2')).toBeGreaterThan(-1)
})

it('renders given actions', () => {
  let wrapper = wrap({ items, actions, selectionInfo })
  expect(wrapper.find('Dropdown').prop('items').length).toBe(2)
  expect(wrapper.find('Dropdown').prop('items')[1].value).toBe('action-2')
})

it('renders selection info', () => {
  let wrapper = wrap({ items, actions, selectionInfo })
  expect(wrapper.childAt(1).childAt(0).html().indexOf('2 of 7 items(s) selected')).toBeGreaterThan(-1)
})

it('handles reload click', () => {
  let onReloadButtonClick = sinon.spy()
  let wrapper = wrap({ items, actions, selectionInfo, onReloadButtonClick }).find('ReloadButton')
  wrapper.simulate('click')
  expect(onReloadButtonClick.calledOnce).toBe(true)
})

it('handles item click with correct args', () => {
  let onFilterItemClick = sinon.spy()
  let wrapper = wrap({ items, actions, selectionInfo, onFilterItemClick })
  let item = wrapper.childAt(0).childAt(1).childAt(2)
  item.simulate('click')
  expect(onFilterItemClick.args[0][0].value).toBe('item-3')
})
