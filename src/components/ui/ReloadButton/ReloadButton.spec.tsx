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
import ReloadButton from '.'

describe('ReloadButton', () => {
  it('fires click', () => {
    const onClick = jest.fn()
    render(<ReloadButton onClick={onClick} />)
    TestUtils.select('ReloadButton__Wrapper')!.click()
    expect(onClick).toHaveBeenCalled()
  })

  it('shows click animation', () => {
    render(<ReloadButton onClick={() => { }} />)
    expect(TestUtils.select('ReloadButton__Wrapper')!.classList).not.toContain('reload-animation')
    TestUtils.select('ReloadButton__Wrapper')!.click()
    expect(TestUtils.select('ReloadButton__Wrapper')!.classList).toContain('reload-animation')
  })
})
