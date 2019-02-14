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
import TestWrapper from '../../../utils/TestWrapper'
import DetailsNavigation from '.'

const wrap = props => new TestWrapper(shallow(<DetailsNavigation {...props} />), 'detailsNavigation')
const items = [
  { label: 'Item 1', value: 'item-1' },
  { label: 'Item 2', value: 'item-2' },
  { label: 'Item 3', value: 'item-3' },
]

describe('DetailsNavigation Component', () => {
  // it('renders 3 items', () => {
  //   let wrapper = wrap({ items, 'data-test-id': 'dn-wrapper' })
  //   console.log(wrapper.find('dn-wrapper').debug())
  //   // items.forEach(item => {
  //   //   expect(wrapper.find(item.value).shallow.dive().dive()).toBe(item.label)
  //   // })
  // })

  it('has items with correct href attribute', () => {
    let wrapper = wrap({ items, itemType: 'replica', itemId: 'item-id' })
    expect(wrapper.find(items[0].value).prop('to')).toBe('/replica/item-1/item-id')
  })

  it('has items with correct href attribute, if items have no value', () => {
    let wrapper = wrap({ items: [{ label: 'Item 1', value: '' }], itemType: 'migration', itemId: 'item-id' })
    expect(wrapper.find('').prop('to')).toBe('/migration/item-id')
  })
})
