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
import ToggleButtonBar from '.'

const wrap = props => shallow(<ToggleButtonBar {...props} />)
const items = [
  { label: 'test1', value: 'test_1' },
  { label: 'test2', value: 'test_2' },
]

it('renders the given items', () => {
  let wrapper = wrap({ items })
  let firstItemLabel = new DOMParser()
    .parseFromString(wrapper.children().at(0).html(), 'text/xml').firstChild.innerHTML
  let secondItemLabel = new DOMParser()
    .parseFromString(wrapper.children().at(1).html(), 'text/xml').firstChild.innerHTML
  expect(firstItemLabel).toBe('test1')
  expect(secondItemLabel).toBe('test2')
})

it('selects the given value', () => {
  let wrapper = wrap({ items, selectedValue: 'test_2' })

  expect(wrapper.children().at(0).prop('selected')).toBe(false)
  expect(wrapper.children().at(1).prop('selected')).toBe(true)
})
