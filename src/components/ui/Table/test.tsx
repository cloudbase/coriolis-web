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
import TW from '@src/utils/TestWrapper'
import Table from '../Table'

const wrap = props => new TW(shallow(<Table {...props} />), 'table')

let items = [
  ['item-1', 'item-2', 'item-3', 'item-4', 'item-5'],
  ['item-6', 'item-7', 'item-8', 'item-9', 'item-10'],
]
let headerItems = ['Header 1', 'Header 2', 'Header 3', 'Header 4', 'Header 5']

describe('TTable Component', () => {
  it('renders no items', () => {
    let wrapper = wrap({ items: [], header: headerItems })
    expect(wrapper.find('noItems').length).toBe(1)
  })

  it('renders header', () => {
    let wrapper = wrap({ items, header: headerItems })
    expect(wrapper.findPartialId('header-').length).toBe(headerItems.length)
    headerItems.forEach((headerItem, i) => {
      expect(wrapper.findText(`header-${i}`)).toBe(headerItem)
    })
  })

  it('renders header with calculated widths', () => {
    let wrapper = wrap({ items, header: headerItems })
    expect(wrapper.findPartialId('header-').at(3).prop('width')).toBe('20%')
  })
})



