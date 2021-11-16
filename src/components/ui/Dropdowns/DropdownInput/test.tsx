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
import DropdownInput from '.'

type ItemType = {
  label: string,
  value: string,
  [prop: string]: any,
}
type Props = {
  items: ItemType[],
  selectedItem: string,
  onItemChange: (item: ItemType) => void,
  inputValue: string,
  onInputChange: (value: string) => void,
  placeholder?: string,
  highlight?: boolean,
  disabled?: boolean,
}

const wrap = (props: Props) => new TW(shallow(
  <DropdownInput {...props} />
), 'ddInput')

const items = [
  { label: 'Item 1', value: 'item-1' },
  { label: 'Item 2', value: 'item-2' },
]

describe('DropdownInput Component', () => {
  it('renders link with correct data', () => {
    let wrapper = wrap({
      items,
      selectedItem: 'item-2',
      onItemChange: () => { },
      inputValue: 'input-value',
      onInputChange: () => { },
    })
    expect(wrapper.find('link').prop('items')[1].value).toBe(items[1].value)
    expect(wrapper.find('link').prop('selectedItem')).toBe('item-2')
  })

  it('renders text input with correct data', () => {
    let wrapper = wrap({
      items,
      selectedItem: 'item-2',
      onItemChange: () => { },
      inputValue: 'input-value',
      onInputChange: () => { },
    })
    expect(wrapper.find('text').prop('embedded')).toBe(true)
    expect(wrapper.find('text').prop('value')).toBe('input-value')
  })
})



