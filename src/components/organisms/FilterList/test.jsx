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
import TW from '../../../utils/TestWrapper'
import FilterList from '.'

const wrap = props => new TW(shallow(
  // $FlowIgnore
  <FilterList {...props} />
), 'filterList')

let items = [
  { id: 'item-1', label: 'Item 1' },
  { id: 'item-2', label: 'Item 2' },
  { id: 'item-3', label: 'Item 3' },
  { id: 'item-3-a', label: 'Item 3-a' },
]

let filterItems = [
  { label: 'All', value: 'all' },
  { label: 'Items 1', value: 'item-1' },
  { label: 'Items 2', value: 'item-2' },
  { label: 'Items 3', value: 'item-3' },
]

let actions = [{ label: 'action', value: 'action' }]

let itemFilterFunction = (item, filterStatus, filterText) => {
  if (
    // $FlowIgnore
    (filterStatus !== 'all' && item.id.indexOf(filterStatus) === -1) ||
    // $FlowIgnore
    (item.label.toLowerCase().indexOf(filterText) === -1)
  ) {
    return false
  }

  return true
}

describe('FilterList Component', () => {
  it('renders with all items', () => {
    let wrapper = wrap({ items, filterItems, itemFilterFunction, actions })
    expect(wrapper.find('mainList').prop('items').length).toBe(4)
  })

  it('handles filter item click', () => {
    let wrapper = wrap({ items, filterItems, itemFilterFunction, actions })
    wrapper.find('filter').simulate('filterItemClick', { ...filterItems[2] })
    expect(wrapper.find('mainList').prop('items').length).toBe(1)
    expect(wrapper.find('mainList').prop('items')[0].id).toBe('item-2')
  })

  it('handles search change', () => {
    let wrapper = wrap({ items, filterItems, itemFilterFunction, actions })
    wrapper.find('filter').simulate('searchChange', 'item 3')
    expect(wrapper.find('mainList').prop('items').length).toBe(2)
    expect(wrapper.find('mainList').prop('items')[0].id).toBe('item-3')
    expect(wrapper.find('mainList').prop('items')[1].id).toBe('item-3-a')
  })

  it('dispaches action for all selected items', () => {
    let onActionChange = sinon.spy()
    let wrapper = wrap({ items, filterItems, itemFilterFunction, actions, onActionChange })
    wrapper.find('filter').simulate('selectAllChange', true)
    wrapper.find('filter').simulate('actionChange', { ...actions[0] })
    expect(onActionChange.args[0][0].length).toBe(4)
    expect(onActionChange.args[0][1].value).toBe('action')
  })
})
