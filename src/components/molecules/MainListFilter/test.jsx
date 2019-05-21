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
import TestWrapper from '../../../utils/TestWrapper'
import MainListFilter from '.'

const wrap = props => new TestWrapper(shallow(
  // $FlowIgnore
  <MainListFilter {...props} />
), 'mainListFilter')

let items = [
  { label: 'Item 1', value: 'item-1' },
  { label: 'Item 2', value: 'item-2' },
  { label: 'Item 3', value: 'item-3' },
]

let selectionInfo = { selected: 2, total: 7, label: 'items' }

describe('MainListFilter Component', () => {
  it('renders given items', () => {
    let wrapper = wrap({ items, selectionInfo })
    expect(wrapper.findPartialId('filterItem').length).toBe(items.length)
    items.forEach(item => {
      expect(wrapper.findText(`filterItem-${item.value}`)).toBe(item.label)
    })
  })

  it('renders selection info', () => {
    let wrapper = wrap({ items, selectionInfo })
    expect(wrapper.findText('selectionText')).toBe('2 of 7 items(s) selected')
  })

  it('handles reload click', () => {
    let onReloadButtonClick = sinon.spy()
    let wrapper = wrap({ items, selectionInfo, onReloadButtonClick })
    wrapper.find('reloadButton').simulate('click')
    expect(onReloadButtonClick.calledOnce).toBe(true)
  })

  it('handles item click with correct args', () => {
    let onFilterItemClick = sinon.spy()
    let wrapper = wrap({ items, selectionInfo, onFilterItemClick })
    wrapper.find(`filterItem-${items[2].value}`).simulate('click')
    expect(onFilterItemClick.args[0][0].value).toBe(items[2].value)
  })
})
