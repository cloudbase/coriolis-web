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
import ProgressBar from '@src/components/ui/ProgressBar'
import TestUtils from '@tests/TestUtils'

describe('ProgressBar', () => {
  it('renders the progress indicator with the correct width', () => {
    render(<ProgressBar progress={33} />)
    const style = window.getComputedStyle(TestUtils.select('ProgressBar__Progress-')!)
    expect(style.width).toBe('33%')
  })

  it('shows progress label', () => {
    render(<ProgressBar progress={33} useLabel />)
    expect(TestUtils.select('ProgressBar__ProgressLabel')?.textContent).toBe('33 %')
  })
})
