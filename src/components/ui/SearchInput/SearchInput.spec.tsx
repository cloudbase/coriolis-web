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
import { ThemeProps } from '@src/components/Theme'
import SearchInput from '.'

describe('SearchInput', () => {
  it('renders the value', () => {
    render(<SearchInput value="test value" />)
    expect(TestUtils.selectInput('TextInput__Input')!.value).toBe('test value')
  })

  it('fires change on input change', () => {
    const onChange = jest.fn()
    render(<SearchInput onChange={onChange} />)
    userEvent.paste(TestUtils.selectInput('TextInput__Input')!, 'test value')
    expect(onChange).toHaveBeenCalledWith('test value')
  })

  it('opens on button click', async () => {
    render(<SearchInput />)
    const style = () => window.getComputedStyle(TestUtils.selectInput('TextInput__Input')!)
    expect(style().width).toBe('50px')
    TestUtils.select('SearchButton__Wrapper')!.click()
    // wait 500 ms for animation
    await new Promise(resolve => { setTimeout(resolve, 500) })
    expect(style().width).toBe(`${ThemeProps.inputSizes.regular.width}px`)
  })

  it('renders open when it has alwaysOpen prop', () => {
    render(<SearchInput alwaysOpen />)
    const style = window.getComputedStyle(TestUtils.selectInput('TextInput__Input')!)
    expect(style.width).toBe(`${ThemeProps.inputSizes.regular.width}px`)
  })

  it('renders loading state', () => {
    const { rerender } = render(<SearchInput loading />)
    expect(TestUtils.select('StatusIcon__Wrapper')).toBeTruthy()
    rerender(<SearchInput />)
    expect(TestUtils.select('StatusIcon__Wrapper')).toBeFalsy()
  })
})
