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
import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import FileInput from '@src/components/ui/FileInput'
import TestUtils from '@tests/TestUtils'

describe('FileInput', () => {
  it('uploads file', async () => {
    const onUpload = jest.fn()
    render(<FileInput onUpload={onUpload} />)
    userEvent.upload(
      TestUtils.select('FileInput__FakeFileInput')!,
      [new File(['test-content'], 'test.txt', { type: 'text/plain' })],
    )
    await waitFor(() => expect(onUpload).toHaveBeenCalledWith('test-content'))
    expect(TestUtils.select('FileInput__FileName')?.textContent).toBe('test.txt')
  })
})
