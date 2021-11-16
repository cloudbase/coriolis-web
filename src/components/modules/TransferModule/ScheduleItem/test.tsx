/*
Copyright (C) 2017  Cloudbase Solutions SRL
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
import { shallow } from 'enzyme'
import TW from '../../../utils/TestWrapper'
import ScheduleItem from '.'

const wrap = props => new TW(shallow(
  
  (<ScheduleItem
    {...props}
    unsavedSchedules={[]}
    colWidths={['6%', '18%', '10%', '18%', '10%', '10%', '23%', '5%']}
  />)
), 'scheduleItem')

describe('ScheduleItem Component', () => {
  it('should render all schedule properties', () => {
    const wrapper = wrap({
      item: {
        id: 'schedule-1',
        enabled: false,
        schedule: { hour: 1, minute: 1, dow: 2, dom: 3, month: 5 },
        expiration_date: new Date(2018, 3, 25, 4, 0, 0),
        shutdown_instances: false,
      },
    })
    expect(wrapper.find('enabled').prop('checked')).toBe(false)
    expect(wrapper.find('hourDropdown').prop('selectedItem').value).toBe(1)
    expect(wrapper.find('minuteDropdown').prop('selectedItem').value).toBe(1)
    expect(wrapper.find('dayOfWeekDropdown').prop('selectedItem').value).toBe(2)
    expect(wrapper.find('dayOfMonthDropdown').prop('selectedItem').value).toBe(3)
    expect(wrapper.find('monthDropdown').prop('selectedItem').value).toBe(5)
  })

  it('should highlight options button if options are changed', () => {
    const wrapper = wrap({
      item: {
        id: 'schedule-1',
        enabled: false,
        schedule: { hour: 1, minute: 1, dow: 2, dom: 3, month: 5 },
        expiration_date: new Date(2018, 3, 25, 4, 0, 0),
        shutdown_instances: true,
      },
    })
    expect(wrapper.find('optionsButton').prop('hollow')).toBe(false)
  })
})



