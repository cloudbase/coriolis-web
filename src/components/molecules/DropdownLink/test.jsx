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
import DropdownLink from '.'

const wrap = props => shallow(<DropdownLink {...props} />)

describe('DropdownLink Component', () => {
  it('renders with selectedItem', () => {
    let onChange = sinon.spy()
    let wrapper = wrap({
      items: [
        { label: 'Item 1', value: 'item-1' },
        { label: 'Item 2', value: 'item-2' },
        { label: 'Item 3', value: 'item-3' },
      ],
      selectedItem: 'item-2',
      onChange,
    })
    expect(wrapper.findWhere(w => w.prop('data-test-id') === 'dropdownLinkLabel').dive().text()).toBe('Item 2')
  })

  // it('has selected item highlighted when opening the list', () => {
  //   let onChange = sinon.spy()
  //   let wrapper = wrap({
  //     items: [
  //       { label: 'Item 1', value: 'item-1' },
  //       { label: 'Item 2', value: 'item-2' },
  //       { label: 'Item 3', value: 'item-3' },
  //     ],
  //     selectedItem: 'item-2',
  //     onChange,
  //   })
  //   wrapper.childAt(0).simulate('click')
  // let list = wrapper.childAt(1)
  // expect(list.children().length).toBe(3)
  // expect(list.childAt(1).prop('selected')).toBe(true)
  // expect(list.childAt(0).prop('selected')).toBe(false)
  // expect(list.childAt(2).prop('selected')).toBe(false)
  // })
})
