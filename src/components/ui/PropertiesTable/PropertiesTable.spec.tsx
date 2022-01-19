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
import PropertiesTable from '@src/components/ui/PropertiesTable'
import { Field } from '@src/@types/Field'
import TestUtils from '@tests/TestUtils'
import userEvent from '@testing-library/user-event'

const PROPERTIES: Field[] = [
  {
    name: 'name',
    type: 'string',
  },
  {
    name: 'name2',
    type: 'string',
    required: true,
    enum: ['a', 'b', 'c'],
  },
  {
    name: 'name3',
    type: 'boolean',
  },
  {
    name: 'name4',
    type: 'boolean',
    nullableBoolean: true,
  },
]

describe('PropertiesTable', () => {
  it('renders all properties', () => {
    render(
      <PropertiesTable
        properties={PROPERTIES}
        onChange={() => { }}
        valueCallback={field => (field.type === 'string' ? `${field.name}-value` : null)}
      />,
    )
    expect(TestUtils.selectInput('TextInput__Input')?.value).toBe('name-value')

    TestUtils.select('DropdownButton__Wrapper')?.click()
    const listItems = TestUtils.selectAll('Dropdown__ListItem-')
    expect(listItems.length).toBe(PROPERTIES[1].enum!.length + 1)
    expect(listItems[2].textContent).toBe('B')
    expect(TestUtils.select('Dropdown__Required')).toBeTruthy()

    const switches = TestUtils.selectAll('Switch__Wrapper')
    expect(switches.length).toBe(2)
    expect(switches[0].textContent).toBe('No')
    expect(switches[1].textContent).toBe('Not Set')
  })

  it('dispatches text input change', () => {
    const onChange = jest.fn()
    render(
      <PropertiesTable
        properties={PROPERTIES}
        onChange={onChange}
        valueCallback={() => {}}
      />,
    )
    userEvent.clear(TestUtils.selectInput('TextInput__Input')!)
    userEvent.type(TestUtils.selectInput('TextInput__Input')!, 'new-value')
    expect(onChange).toHaveBeenCalledWith(PROPERTIES[0], 'new-value')
  })

  it('dispatches dropdown change', () => {
    const onChange = jest.fn()
    render(
      <PropertiesTable
        properties={PROPERTIES}
        onChange={onChange}
        valueCallback={() => {}}
      />,
    )
    TestUtils.select('DropdownButton__Wrapper')!.click()
    TestUtils.selectAll('Dropdown__ListItem-')[2]!.click()
    expect(onChange).toHaveBeenCalledWith(PROPERTIES[1], 'b')
  })

  it('dispatches switch change', () => {
    const onChange = jest.fn()
    render(
      <PropertiesTable
        properties={PROPERTIES}
        onChange={onChange}
        valueCallback={() => true}
      />,
    )

    const [nonNullableSwitch, nullableSwitch] = TestUtils.selectAll('Switch__InputWrapper')

    nonNullableSwitch.click()
    expect(onChange).toHaveBeenCalledWith(PROPERTIES[2], false)

    nullableSwitch.click()
    expect(onChange).toHaveBeenCalledWith(PROPERTIES[3], null)
  })
})
