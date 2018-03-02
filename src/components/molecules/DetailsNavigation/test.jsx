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
import DetailsNavigation from '.'

const wrap = props => shallow(<DetailsNavigation {...props} />)
const items = [
  { label: 'Item 1', value: 'item-1' },
  { label: 'Item 2', value: 'item-2' },
  { label: 'Item 3', value: 'item-3' },
]

it('renders 3 items', () => {
  let wrapper = wrap({ items })
  expect(wrapper.children().length).toBe(3)
})

it('has items with correct href attribute', () => {
  let wrapper = wrap({ items, itemType: 'replica', itemId: 'item-id' })
  expect(wrapper.childAt(0).prop('href')).toBe('/#/replica/item-1/item-id')
})

it('has items with correct href attribute, if items have no value', () => {
  let wrapper = wrap({ items: [{ label: 'Item 1', value: '' }], itemType: 'migration', itemId: 'item-id' })
  expect(wrapper.childAt(0).prop('href')).toBe('/#/migration/item-id')
})
