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
import userEvent from '@testing-library/user-event'

import FieldInput from '.'

jest.mock('@src/plugins/default/ContentPlugin', () => jest.fn(() => null))

describe('FieldInput', () => {
  it('renders field label and description', () => {
    render(
      <FieldInput
        name="Field Name"
        label="Field Label"
        description="Field Description"
      />,
    )
    expect(TestUtils.select('FieldInput__LabelText')?.textContent).toBe('Field Label')
    expect(TestUtils.select('InfoIcon__Wrapper')?.getAttribute('data-tip')).toBe('Field Description')
  })

  it('renders string field', () => {
    render(
      <FieldInput
        name="Field Name"
        type="string"
        value="Field Value"
      />,
    )
    expect(TestUtils.selectInput('TextInput__Input')!.value).toBe('Field Value')
  })

  it('renders string field with enumerator', () => {
    const { rerender } = render(
      <FieldInput
        name="Field Name"
        type="string"
        value="Field Value"
        enum={['foo', 'bar']}
      />,
    )
    TestUtils.select('DropdownButton__Wrapper')?.click()
    expect(TestUtils.selectAll('Dropdown__ListItem-')).toHaveLength(2)
    expect(TestUtils.select('Dropdown__ListItem-')?.textContent).toBe('foo')
    rerender(
      <FieldInput
        name="Field Name"
        type="string"
        value="Field Value"
        enum={['foo', 'bar', 'baz', 'qux', 'quux', 'corge', 'grault', 'garply', 'waldo', 'fred', 'plugh', 'xyzzy', 'thud']}
      />,
    )
    expect(TestUtils.select('AutocompleteDropdown__Wrapper')).toBeTruthy()
    userEvent.type(TestUtils.select('TextInput__Input')!, 'ba')
    expect(TestUtils.selectAll('AutocompleteDropdown__ListItem-')).toHaveLength(2)
    expect(TestUtils.selectAll('AutocompleteDropdown__ListItem-')[1].textContent).toBe('baz')
  })

  it('renders text input if empty enums array', () => {
    render(
      <FieldInput
        name="Field Name"
        type="string"
        value="Field Value"
        enum={[]}
      />,
    )
    expect(TestUtils.selectInput('TextInput__Input')!.value).toBe('Field Value')
  })

  it('renders text area', () => {
    render(
      <FieldInput
        name="Field Name"
        type="string"
        value="Field Value"
        useTextArea
      />,
    )
    expect(document.querySelector('textarea')?.value).toBe('Field Value')
  })

  it('renders file input', () => {
    render(
      <FieldInput
        name="Field Name"
        useFile
        type="string"
        value="Field Value"
      />,
    )
    expect(document.querySelector('input')?.getAttribute('type')).toBe('file')
  })

  it('renders integer input', () => {
    const { rerender } = render(
      <FieldInput
        name="Field Name"
        type="integer"
        minimum={0}
        maximum={100}
        value={10}
      />,
    )
    expect(TestUtils.selectInput('Stepper__Input')!.value).toBe('10')

    rerender(
      <FieldInput
        name="Field Name"
        type="integer"
        minimum={1}
        maximum={8}
        value={5}
      />,
    )
    TestUtils.select('DropdownButton__Wrapper')?.click()
    expect(TestUtils.selectAll('Dropdown__ListItem-')).toHaveLength(8)
    expect(TestUtils.selectAll('Dropdown__ListItem-')[1].textContent).toBe('2')
    expect(TestUtils.select('DropdownButton__Label')?.textContent).toBe('5')
  })

  it('renders radio input', () => {
    render(
      <FieldInput
        name="Field Name"
        type="radio"
        value
      />,
    )
    expect(TestUtils.select('RadioInput__Input')?.hasAttribute('checked')).toBeTruthy()
  })

  it('renders array dropdown', () => {
    render(
      <FieldInput
        name="Field Name"
        type="array"
        enum={['foo', 'bar', 'baz']}
        value={['bar', 'baz']}
      />,
    )
    expect(TestUtils.select('DropdownButton__Label')?.textContent).toBe('bar, baz')
    TestUtils.select('DropdownButton__Wrapper')?.click()
  })

  it('renders object field', () => {
    render(
      <FieldInput
        name="Field Name"
        type="object"
        valueCallback={field => `value-${field.name}`}
        properties={[{ name: 'Prop 1', type: 'string' }, { name: 'Prop 2', type: 'string' }]}
      />,
    )
    const rows = TestUtils.selectAll('PropertiesTable__Row')
    expect(rows).toHaveLength(2)
    expect(TestUtils.select('PropertiesTable__Column', rows[1])?.textContent).toBe('Prop 2')
    expect(TestUtils.selectInput('TextInput__Input', rows[1])!.value).toBe('value-Prop 2')
  })
})
