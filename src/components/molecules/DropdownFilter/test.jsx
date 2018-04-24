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
import DropdownFilter from '.'

const wrap = props => new TestWrapper(shallow(<DropdownFilter {...props} />), 'dropdownFilter')
const items = [
  { label: 'Item 1', value: 'item-1' },
  { label: 'Item 2', value: 'item-2' },
  { label: 'Item 3', value: 'item-3' },
]

describe('DropdownFilter Component', () => {
  it('opens filter list on button click', () => {
    const wrapper = wrap({ items })
    expect(wrapper.find('list').length).toBe(0)
    wrapper.find('button').simulate('click')
    expect(wrapper.find('list').length).toBe(1)
  })
})
