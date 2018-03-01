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
// import sinon from 'sinon'
import Dropdown from './Dropdown'

const wrap = props => shallow(<Dropdown {...props} />)
const items = [
  { label: 'Item 1', value: 'item-1' },
  { label: 'Item 2', value: 'item-2' },
  { label: 'Item 3', value: 'item-3' },
]

// it('opens list with the correct 3 items on button click', () => {
//   let wrapper = wrap({ items })
//   wrapper.childAt(0).simulate('click')
//   let itemsList = wrapper.childAt(1).childAt(1)
//   expect(itemsList.children().length).toBe(3)
//   expect(itemsList.childAt(0).contains('Item 1')).toBe(true)
//   expect(itemsList.childAt(1).contains('Item 2')).toBe(true)
//   expect(itemsList.childAt(2).contains('Item 3')).toBe(true)
// })

// it('dispatches change on item click with correct argument', () => {
//   let onChange = sinon.spy()
//   let wrapper = wrap({ items, onChange })
//   wrapper.childAt(0).simulate('click')
//   let itemsList = wrapper.childAt(1).childAt(1)
//   itemsList.childAt(1).simulate('click')
//   expect(onChange.args[0][0].value).toBe('item-2')
// })

// it('uses labelField to render items', () => {
//   let newItems = items.map(i => { return { value: i.value, name: i.label } })
//   let wrapper = wrap({ items: newItems, labelField: 'name' })
//   wrapper.childAt(0).simulate('click')
//   let itemsList = wrapper.childAt(1).childAt(1)
//   expect(itemsList.childAt(1).contains('Item 2')).toBe(true)
// })

it('renders no items message', () => {
  let wrapper = wrap({ items: [], noItemsMessage: 'no items' })
  expect(wrapper.childAt(0).prop('value')).toBe('no items')
})

it('renders no selection message', () => {
  let wrapper = wrap({ items, noSelectionMessage: 'no selection' })
  expect(wrapper.childAt(0).prop('value')).toBe('no selection')
})
