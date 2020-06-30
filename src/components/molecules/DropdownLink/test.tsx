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
import sinon from 'sinon'
import TestWrapper from '../../../utils/TestWrapper'
import DropdownLink from '.'

const wrap = props => new TestWrapper(shallow(<DropdownLink {...props} />), 'dropdownLink')

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
    expect(wrapper.findText('label')).toBe('Item 2')
  })
})



