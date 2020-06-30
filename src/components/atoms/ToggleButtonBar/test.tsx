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
import TestWrapper from '../../../utils/TestWrapper'
import ToggleButtonBar from '.'

const wrap = props => new TestWrapper(shallow(<ToggleButtonBar {...props} />), 'toggleButtonBar')
const items = [
  { label: 'test1', value: 'test_1' },
  { label: 'test2', value: 'test_2' },
]

describe('ToggleButtonBar Component', () => {
  it('renders the given items', () => {
    const wrapper = wrap({ items })
    expect(wrapper.findText(items[0].value)).toBe(items[0].label)
    expect(wrapper.findText(items[1].value)).toBe(items[1].label)
  })

  it('selects the given value', () => {
    let wrapper = wrap({ items, selectedValue: 'test_2' })

    expect(wrapper.find(items[0].value).prop('selected')).toBe(false)
    expect(wrapper.find(items[1].value).prop('selected')).toBe(true)
  })
})



