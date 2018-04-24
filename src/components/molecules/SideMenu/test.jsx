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
import TW from '../../../utils/TestWrapper'
import SideMenu from '.'

const wrap = props => new TW(shallow(<SideMenu {...props} />), 'sideMenu')

describe('SideMenu Component', () => {
  it('opens menu on click', () => {
    let wrapper = wrap()
    expect(wrapper.find('menu').prop('open')).toBe(false)
    wrapper.find('toggle').simulate('click')
    expect(wrapper.find('menu').prop('open')).toBe(true)
  })

  it('renders at least one item in the list', () => {
    let wrapper = wrap()
    expect(wrapper.find('item-', true).length).toBeGreaterThan(0)
  })
})
