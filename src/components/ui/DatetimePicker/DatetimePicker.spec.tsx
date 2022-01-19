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
import moment from 'moment'
import { render } from '@testing-library/react'
import TestUtils from '@tests/TestUtils'
import DatetimePicker from './DatetimePicker'

const DATE = new Date('2021-11-12T12:32:44.426Z')

describe('DatetimePicker', () => {
  it('renders date value in UTC timezone in dropdown label', () => {
    render(
      <DatetimePicker
        onChange={() => { }}
        timezone="utc"
        value={DATE}
      />,
    )

    const expected = moment(DATE)
      .add(new Date().getTimezoneOffset(), 'minutes')
      .format('DD/MM/YYYY hh:mm A')

    expect(TestUtils.select('DropdownButton__Label')?.innerHTML).toEqual(expected)
  })

  it('changes the date', () => {
    render(
      <DatetimePicker
        onChange={() => { }}
        timezone="utc"
        value={DATE}
      />,
    )
    expect(TestUtils.select('DatetimePicker__Portal')).toBeNull()
    TestUtils.select('DropdownButton__Wrapper')?.click()
    expect(TestUtils.select('DatetimePicker__Portal')).not.toBeNull()
    const firstDay = document.querySelector<HTMLElement>('td.rdtDay[data-value="1"]')
    firstDay?.click()

    const expected = moment(DATE)
      .set('date', 1)
      .add(new Date().getTimezoneOffset(), 'minutes')
      .format('DD/MM/YYYY hh:mm A')

    expect(TestUtils.select('DropdownButton__Label')?.innerHTML).toEqual(expected)
  })
})
