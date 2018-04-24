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

// @flow

import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'
import sinon from 'sinon'
import TW from '../../../utils/TestWrapper'
import Schedule from '.'

const wrap = props => new TW(shallow(<Schedule {...props} />), 'schedule')

let schedules = [
  { id: 's-1', schedule: { dom: 4, dow: 3, month: 2, hour: 13, minute: 29 }, expiration_date: new Date(2017, 10, 27, 17, 19) },
  { id: 's-2', enabled: true, schedule: { dom: 2, dow: 3, month: 2, hour: 13, minute: 29 }, expiration_date: new Date() },
]

describe('Schedule Component', () => {
  it('renders no schedules', () => {
    let wrapper = wrap({ schedules: [] })
    expect(wrapper.findText('noScheduleTitle')).toBe('This Replica has no Schedules.')
  })

  it('dispaches no schedules `Add schedule` click', () => {
    let onAddScheduleClick = sinon.spy()
    let wrapper = wrap({ onAddScheduleClick })
    wrapper.find('noScheduleAddButton').click()
    expect(onAddScheduleClick.calledOnce).toBe(true)
  })

  it('renders correct number of schedules', () => {
    let wrapper = wrap({ schedules })
    schedules.forEach(schedule => {
      expect(wrapper.find(`item-${schedule.id}`).prop('item').id).toBe(schedule.id)
    })
  })

  it('dispatches timezone change', () => {
    let onTimezoneChange = sinon.spy()
    let wrapper = wrap({ schedules, onTimezoneChange })
    wrapper.find('timezoneDropdown').simulate('change', { value: schedules[0] })
    expect(onTimezoneChange.calledOnce).toBe(true)
  })

  it('dispatches Add schedule click from list of schedules with local timezone', () => {
    let onAddScheduleClick = sinon.spy()
    let wrapper = wrap({ schedules, onAddScheduleClick, timezone: 'local' })
    wrapper.find('addScheduleButton').click()
    let localHours = moment(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())).add(new Date().getTimezoneOffset(), 'minutes').hours()
    expect(onAddScheduleClick.args[0][0].schedule.hour).toBe(localHours)
  })

  it('renders correct timezone in footer', () => {
    let wrapper = wrap({ schedules, timezone: 'utc' })
    expect(wrapper.find('timezoneDropdown').prop('selectedItem')).toBe('utc')
  })

  it('has add button disabled while adding a schedule', () => {
    let wrapper = wrap({ schedules, adding: true })
    expect(wrapper.find('addScheduleButton').prop('disabled')).toBe(true)
    expect(wrapper.find('loadingStatus').length).toBe(0)
  })

  it('renders loading', () => {
    let wrapper = wrap({ schedules: [], loading: true })
    expect(wrapper.find('loadingStatus').length).toBe(1)
  })
})
