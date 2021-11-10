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
import TW from '../../../utils/TestWrapper'
import DropdownFilterGroup from '.'

const dropdowns = [
  {
    key: 'dropdown1',
    items: [{ label: 'Dropdown 1 Item 1', value: 'dropdown1_item1_value' }],
  },
  {
    key: 'dropdown2',
    items: [{ label: 'Dropdown 2 Item 1', value: 'dropdown2_item1_value' }],
    selectedItem: 'dropdown2_item1_value',
  },
]

const wrap = props => new TW(shallow(
  <DropdownFilterGroup items={dropdowns} {...props} />
), 'dfGroup')

describe('DropdownFilterGroup Component', () => {
  it('renders correct dropdowns', () => {
    let wrapper = wrap()
    expect(wrapper.findPartialId('dropdown-').length).toBe(dropdowns.length)
    dropdowns.forEach(dropdown => {
      expect(wrapper.find(`dropdown-${dropdown.key}`).prop('items')[0].value).toBe(dropdown.items[0].value)
      expect(wrapper.find(`dropdown-${dropdown.key}`).prop('selectedItem')).toBe(dropdown.selectedItem || undefined)
    })
  })
})



