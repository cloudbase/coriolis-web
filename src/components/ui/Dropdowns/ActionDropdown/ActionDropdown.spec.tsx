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
import ActionDropdown, { Action } from './ActionDropdown'

const ACTIONS: Action[] = [
  {
    label: 'Action 1',
    title: 'Action 1 Description',
    action: jest.fn(),
  },
  {
    label: 'Action 2',
    disabled: true,
    action: jest.fn(),

  },
  {
    label: 'Action 3',
    loading: true,
    action: jest.fn(),
  },
  {
    label: 'Action 4',
    hidden: true,
    action: jest.fn(),
  },
]

describe('ActionDropdown', () => {
  it('renders button label', () => {
    const { rerender } = render(<ActionDropdown actions={ACTIONS} />)
    expect(TestUtils.select('DropdownButton__Label')?.textContent).toBe('Actions')
    rerender(<ActionDropdown actions={ACTIONS} label="Actions Label" />)
    expect(TestUtils.select('DropdownButton__Label')?.textContent).toBe('Actions Label')
  })

  it('renders only visible actions', () => {
    render(<ActionDropdown actions={ACTIONS} />)
    TestUtils.select('DropdownButton__Wrapper')!.click()
    expect(TestUtils.selectAll('ActionDropdown__ListItem').length).toBe(3)
    TestUtils.selectAll('ActionDropdown__ListItem').forEach((item, index) => {
      expect(item.textContent).toBe(ACTIONS[index].label)
    })
  })

  it('renders actions with props', () => {
    render(<ActionDropdown actions={ACTIONS} />)
    TestUtils.select('DropdownButton__Wrapper')!.click()
    TestUtils.selectAll('ActionDropdown__ListItem').forEach((item, index) => {
      if (ACTIONS[index].disabled) {
        expect(item.hasAttribute('disabled')).toBe(true)
      } else {
        expect(item.hasAttribute('disabled')).toBe(false)
      }
      if (ACTIONS[index].title) {
        expect(item.getAttribute('title')).toBe(ACTIONS[index].title)
      }
      if (ACTIONS[index].loading) {
        expect(TestUtils.select('StatusIcon__Wrapper', item)).toBeTruthy()
      } else {
        expect(TestUtils.select('StatusIcon__Wrapper', item)).toBeFalsy()
      }
    })
  })

  it('fires click events correctly', () => {
    render(<ActionDropdown actions={ACTIONS} />)
    TestUtils.select('DropdownButton__Wrapper')!.click()
    TestUtils.selectAll('ActionDropdown__ListItem').forEach((item, index) => {
      item.click()
      if (ACTIONS[index].disabled || ACTIONS[index].loading) {
        expect(ACTIONS[index].action).not.toHaveBeenCalled()
      } else {
        TestUtils.select('DropdownButton__Wrapper')!.click()
        expect(ACTIONS[index].action).toHaveBeenCalled()
      }
    })
  })
})
