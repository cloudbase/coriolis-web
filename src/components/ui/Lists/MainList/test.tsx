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
import TW from '@src/utils/TestWrapper'
import MainList from '.'

const wrap = props => new TW(shallow(

  <MainList {...props} />
), 'mainList')

let items = [
  { id: 'item-1', label: 'Item 1' },
  { id: 'item-2', label: 'Item 2' },
  { id: 'item-3', label: 'Item 3' },
  { id: 'item-3-a', label: 'Item 3-a' },
]

let selectedItems = [{ ...items[1] }, { ...items[2] }]

let renderItemComponent = options => <div {...options}>{options.item.label}</div>

describe('MainList Component', () => {
  it('renders all items', () => {
    let wrapper = wrap({ items, selectedItems, renderItemComponent })
    items.forEach(item => {
      expect(wrapper.findText(`item-${item.id}`, true)).toBe(item.label)
    })
    expect(wrapper.find('loadingStatus').length).toBe(0)
  })

  it('renders loading', () => {
    let wrapper = wrap({ items, selectedItems, renderItemComponent, loading: true })
    expect(wrapper.find('loadingStatus').length).toBe(1)
  })

  it('renders selected items', () => {
    let wrapper = wrap({ items, selectedItems, renderItemComponent })
    expect(wrapper.find('item-item-1').prop('selected')).toBe(false)
    expect(wrapper.find('item-item-2').prop('selected')).toBe(true)
    expect(wrapper.find('item-item-3').prop('selected')).toBe(true)
    expect(wrapper.find('item-item-3-a').prop('selected')).toBe(false)
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

    expect(wrapper.findText('emptyMessage')).toBe('empty-list-message')
    expect(wrapper.find('emptyListButton').shallow.dive().dive().text()).toBe('empty-list-button-label')
  })

  it('dispaches empty list button click', () => {
    let onEmptyListButtonClick = sinon.spy()
    let wrapper = wrap({
      items,
      selectedItems,
      renderItemComponent,
      showEmptyList: true,
      onEmptyListButtonClick,
      emptyListButtonLabel: 'New Item',
    })
    wrapper.find('emptyListButton').simulate('click')
    expect(onEmptyListButtonClick.calledOnce).toBe(true)
  })
})



