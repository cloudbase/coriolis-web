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
import Arrow from './Arrow'

describe('Arrow', () => {
  it.each`
    orientation
    ${'up'}
    ${'down'}
    ${'left'}
    ${'right'}
  `('renders the $orientation orientation', ({ orientation }) => {
    render(<Arrow orientation={orientation} />)
    expect(TestUtils.select('Arrow__Wrapper')?.getAttribute('orientation')).toBe(orientation)
  })

  it('renderes with primary colors', () => {
    const { rerender } = render(<Arrow primary />)
    expect(document.querySelector(`g[stroke="${ThemePalette.primary}"]`)).toBeTruthy()
    rerender(<Arrow />)
    expect(document.querySelector(`g[stroke="${ThemePalette.grayscale[4]}"]`)).toBeTruthy()
  })

  it('renderes with primary colors', () => {
    const { rerender } = render(<Arrow primary />)
    expect(document.querySelector(`g[stroke="${ThemePalette.primary}"]`)).toBeTruthy()
    rerender(<Arrow />)
    expect(document.querySelector(`g[stroke="${ThemePalette.grayscale[4]}"]`)).toBeTruthy()
  })
})
