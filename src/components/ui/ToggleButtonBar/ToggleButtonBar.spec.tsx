/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import { render } from '@testing-library/react'
import TestUtils from '@tests/TestUtils'
import { ThemePalette } from '@src/components/Theme'
import ToggleButtonBar from '.'

const ITEMS = [
  { label: 'Button 1', value: 'button-1' },
  { label: 'Button 2', value: 'button-2' },
]

describe('ToggleButtonBar', () => {
  it('renders items', () => {
    render(<ToggleButtonBar items={ITEMS} />)
    const itemsEl = TestUtils.selectAll('ToggleButtonBar__Item')
    expect(itemsEl.length).toBe(ITEMS.length)
    expect(itemsEl[0].textContent).toBe(ITEMS[0].label)
    expect(itemsEl[1].textContent).toBe(ITEMS[1].label)
  })

  it('selects the selected item', () => {
    render(<ToggleButtonBar items={ITEMS} selectedValue="button-2" />)
    const itemsEl = TestUtils.selectAll('ToggleButtonBar__Item')
    expect(window.getComputedStyle(itemsEl[0]).background).toBe('white')
    expect(TestUtils.rgbToHex(window.getComputedStyle(itemsEl[1]).background)).toBe(ThemePalette.primary)
  })

  it('fires change on item click', () => {
    const onChange = jest.fn()
    render(<ToggleButtonBar items={ITEMS} onChange={onChange} />)
    TestUtils.selectAll('ToggleButtonBar__Item')[1].click()
    expect(onChange).toBeCalledWith(ITEMS[1])
  })
})
