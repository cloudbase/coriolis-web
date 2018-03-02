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
import TaskItem from '.'

const wrap = props => shallow(<TaskItem {...props} />)

let item = {
  progress_updates: [
    { message: 'the task has a progress of 50%', created_at: new Date() },
    { message: 'the task is almost done', created_at: new Date() },
  ],
  exception_details: 'Exception details',
  status: 'RUNNING',
  created_at: new Date(),
  depends_on: ['depends on id'],
  id: 'item-id',
  task_type: 'Task name',
}
let columnWidths = ['26%', '18%', '36%', '20%']

it('renders progress updates', () => {
  let wrapper = wrap({ item, columnWidths, open: true })
  let collapse = wrapper.find('Collapse')
  expect(collapse.html().indexOf('the task has a progress of 50%')).toBeGreaterThan(-1)
  expect(collapse.html().indexOf('the task is almost done')).toBeGreaterThan(-1)
})

it('renders progress bar', () => {
  let wrapper = wrap({ item, columnWidths, open: true })
  expect(wrapper.find('ProgressBar').prop('progress')).toBe(50)
})
