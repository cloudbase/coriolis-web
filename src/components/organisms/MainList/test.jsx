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
import MainList from './MainList'

const wrap = props => shallow(<MainList {...props} />)

let items = [
  { id: 'item-1', label: 'Item 1' },
  { id: 'item-2', label: 'Item 2' },
  { id: 'item-3', label: 'Item 3' },
  { id: 'item-3-a', label: 'Item 3-a' },
]

let selectedItems = [{ ...items[1] }, { ...items[2] }]
let renderItemComponent = options => <div {...options}>{options.item.label}</div>

it('renders all items', () => {
  let wrapper = wrap({ items, selectedItems, renderItemComponent })
  let itemsWrapper = wrapper.findWhere(w => w.prop('item'))
  expect(itemsWrapper.length).toBe(4)
  expect(itemsWrapper.at(0).html().indexOf('Item 1') > -1).toBe(true)
  expect(itemsWrapper.at(1).html().indexOf('Item 2') > -1).toBe(true)
  expect(itemsWrapper.at(2).html().indexOf('Item 3') > -1).toBe(true)
  expect(itemsWrapper.at(3).html().indexOf('Item 3-a') > -1).toBe(true)
})

it('renders loading', () => {
  let wrapper = wrap({ items, selectedItems, renderItemComponent, loading: true })
  expect(wrapper.find('StatusImage').prop('loading')).toBe(true)
})

it('renders selected items', () => {
  let wrapper = wrap({ items, selectedItems, renderItemComponent })
  let itemsWrapper = wrapper.findWhere(w => w.prop('item'))
  expect(itemsWrapper.length).toBe(4)
  expect(itemsWrapper.at(0).prop('selected')).toBe(false)
  expect(itemsWrapper.at(1).prop('selected')).toBe(true)
  expect(itemsWrapper.at(2).prop('selected')).toBe(true)
  expect(itemsWrapper.at(3).prop('selected')).toBe(false)
})

it('renders empty list', () => {
  let wrapper = wrap({
    items,
    selectedItems,
    renderItemComponent,
    showEmptyList: true,
    emptyListMessage: 'empty-list-message',
    emptyListExtraMessage: 'empty-list-extra-message',
    emptyListButtonLabel: 'empty-list-button-label',
  })

  expect(wrapper.html().indexOf('empty-list-message') > -1).toBe(true)
  expect(wrapper.html().indexOf('empty-list-extra-message') > -1).toBe(true)
  expect(wrapper.html().indexOf('empty-list-button-label') > -1).toBe(true)
})

it('dispaches empty list button click', () => {
  let onEmptyListButtonClick = sinon.spy()
  let wrapper = wrap({
    items,
    selectedItems,
    renderItemComponent,
    showEmptyList: true,
    onEmptyListButtonClick,
  })
  wrapper.find('Button').simulate('click')
  expect(onEmptyListButtonClick.calledOnce).toBe(true)
})
