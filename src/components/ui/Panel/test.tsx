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

import TW from '@src/utils/TestWrapper'
import Panel, { TEST_ID } from '.'
import type { Props, NavigationItem } from '.'

const navigationItems: NavigationItem[] = [
  { label: 'Navigation1', value: 'navigation1' },
  { label: 'Navigation2', value: 'navigation2' },
]

const content = 'Content'

const wrap = (props: Props) => new TW(shallow(
  <Panel {...props} />
), TEST_ID)

describe('Panel Component', () => {
  it('renders navigation items', () => {
    let wrapper = wrap({
      navigationItems,
      content,
      reloadLabel: '',
      onChange: () => { },
      selectedValue: 'navigation2',
      onReloadClick: () => { },
    })
    navigationItems.forEach(i => {
      expect(wrapper.findText(`navItem-${i.value}`)).toBe(i.label)
    })
  })

  it('selects the selected value', () => {
    let wrapper = wrap({
      navigationItems,
      content,
      reloadLabel: '',
      onChange: () => { },
      selectedValue: 'navigation2',
      onReloadClick: () => { },

    })
    expect(wrapper.find('navItem-navigation1').prop('selected')).toBeFalsy()
    expect(wrapper.find('navItem-navigation2').prop('selected')).toBe(true)
  })

  it('dispatches onChange', () => {
    let onChange = sinon.spy()
    let wrapper = wrap({
      navigationItems,
      content,
      onChange,
      reloadLabel: '',
      selectedValue: 'navigation2',
      onReloadClick: () => { },
    })
    wrapper.find('navItem-navigation1').simulate('click')
    expect(onChange.called).toBe(true)
  })

  it('renders content', () => {
    let wrapper = wrap({
      navigationItems,
      content,
      reloadLabel: '',
      onChange: () => { },
      selectedValue: 'navigation2',
      onReloadClick: () => { },
    })
    expect(wrapper.findText('content')).toBe(content)
  })
})



