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
import TestWrapper from '@src/utils/TestWrapper'
import Dropdown from '.'

const wrap = props => new TestWrapper(shallow(<Dropdown {...props} />), 'dropdown')
const items = [
  { label: 'Item 1', value: 'item-1' },
  { label: 'Item 2', value: 'item-2' },
  { label: 'Item 3', value: 'item-3' },
]

describe('Dropdown Component', () => {
  it('renders selected item', () => {
    let wrapper = wrap({ items, selectedItem: items[1] })
    expect(wrapper.find('dropdownButton').prop('value')).toBe(items[1].label)
    wrapper = wrap({ items, selectedItem: items[1].label })
    expect(wrapper.find('dropdownButton').prop('value')).toBe(items[1].label)
    wrapper = wrap({
      items: [{ value: 'the_value', name: 'label' }],
      selectedItem: { value: 'the_value', name: 'label' },
      labelField: 'name',
    })
    expect(wrapper.find('dropdownButton').prop('value')).toBe('label')
  })

  it('renders no items message', () => {
    let wrapper = wrap({ items: [], noItemsMessage: 'no items' })
    expect(wrapper.find('dropdownButton').prop('value')).toBe('no items')
  })

  it('renders no selection message', () => {
    let wrapper = wrap({ items, noSelectionMessage: 'no selection' })
    expect(wrapper.find('dropdownButton').prop('value')).toBe('no selection')
  })
})



