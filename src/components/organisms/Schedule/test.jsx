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
import sinon from 'sinon'
import Schedule from '.'

const wrap = props => shallow(<Schedule {...props} />)

let schedules = [
  { schedule: { dom: 4, dow: 3, month: 2, hour: 13, minute: 29 }, expiration_date: new Date(2017, 10, 27, 17, 19) },
  { enabled: true, schedule: { dom: 2, dow: 3, month: 2, hour: 13, minute: 29 }, expiration_date: new Date() },
]

it('renders no schedules', () => {
  let wrapper = wrap()
  expect(wrapper.html().indexOf('This Replica has no Schedules.') > -1).toBe(true)
})

it('dispaches no schedules `Add schedule` click', () => {
  let onAddScheduleClick = sinon.spy()
  let wrapper = wrap({ onAddScheduleClick })
  wrapper.find('Button').simulate('click')
  expect(onAddScheduleClick.calledOnce).toBe(true)
})

it('renders correct number of schedules', () => {
  let wrapper = wrap({ schedules })
  expect(wrapper.findWhere(w => w.name() === 'Switch' && w.prop('noLabel')).length).toBe(schedules.length)
})

it('renders correct enabled / disabled', () => {
  let wrapper = wrap({ schedules })
  let enabledSwitches = wrapper.findWhere(w => w.name() === 'Switch' && w.prop('noLabel'))
  expect(enabledSwitches.at(0).prop('checked')).toBe(false)
  expect(enabledSwitches.at(1).prop('checked')).toBe(true)
})

it('renders correct month, day of month, day of week, hour, minute and expiration date', () => {
  let wrapper = wrap({ schedules })
  expect(wrapper.find('Styled(Dropdown)').at(0).prop('selectedItem').value).toBe(2)
  expect(wrapper.find('Styled(Dropdown)').at(1).prop('selectedItem').value).toBe(4)
  expect(wrapper.find('Styled(Dropdown)').at(2).prop('selectedItem').value).toBe(3)
  expect(wrapper.find('Styled(Dropdown)').at(3).prop('selectedItem').value).toBe(13)
  expect(wrapper.find('Styled(Dropdown)').at(4).prop('selectedItem').value).toBe(29)
  expect(wrapper.find('DatetimePicker').at(0).prop('value').toString()).toBe('Mon Nov 27 2017 17:19:00 GMT+0200')
})

it('renders correct hour with local timezone', () => {
  let wrapper = wrap({ schedules, timezone: 'local' })
  expect(wrapper.find('Styled(Dropdown)').at(3).prop('selectedItem').value).toBe(15)
})

it('renders correct timezone in footer', () => {
  let wrapper = wrap({ schedules, timezone: 'utc' })
  expect(wrapper.find('DropdownLink').prop('selectedItem')).toBe('utc')
})

it('dispatches timezone change', () => {
  let onTimezoneChange = sinon.spy()
  let wrapper = wrap({ schedules, onTimezoneChange })
  wrapper.find('DropdownLink').simulate('change')
  expect(onTimezoneChange.calledOnce).toBe(true)
})

it('dispatches Add schedule click from list of schedules with local timezone', () => {
  let onAddScheduleClick = sinon.spy()
  let wrapper = wrap({ schedules, onAddScheduleClick, timezone: 'local' })
  wrapper.findWhere(w => w.name() === 'Button' && w.html().indexOf('Add Schedule') > -1).simulate('click')
  expect(onAddScheduleClick.args[0][0].schedule.hour).toBe(22)
})

it('dispatches Add schedule click from list of schedules with UTC timezone', () => {
  let onAddScheduleClick = sinon.spy()
  let wrapper = wrap({ schedules, onAddScheduleClick, timezone: 'utc' })
  wrapper.findWhere(w => w.name() === 'Button' && w.html().indexOf('Add Schedule') > -1).simulate('click')
  expect(onAddScheduleClick.args[0][0].schedule.hour).toBe(0)
})

it('shows options modal', () => {
  let wrapper = wrap({ schedules })
  wrapper.findWhere(w => w.name() === 'Button' && w.html().indexOf('•••') > -1).at(0).simulate('click')
  expect(wrapper.find('Modal').prop('isOpen')).toBe(true)
})

it('has add button disabled while adding a schedule', () => {
  let wrapper = wrap({ schedules, adding: true })
  expect(wrapper.findWhere(w => w.name() === 'Button' && w.html().indexOf('Add Schedule') > -1).prop('disabled')).toBe(true)
})

it('renders loading', () => {
  let wrapper = wrap({ schedules: [], loading: true })
  expect(wrapper.find('StatusImage').prop('loading')).toBe(true)
})
