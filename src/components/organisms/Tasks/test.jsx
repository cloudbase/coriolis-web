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
import Tasks from '.'

const wrap = props => shallow(<Tasks {...props} />)

let items = [
  {
    progress_updates: [
      { message: 'the task has a progress of 10%', created_at: new Date() },
    ],
    exception_details: 'Exception details',
    status: 'COMPLETED',
    created_at: new Date(),
    depends_on: ['depends on id'],
    id: 'task-1',
    task_type: 'Task name 1',
  },
  {
    progress_updates: [
      { message: 'the task has a progress of 50%', created_at: new Date() },
      { message: 'the task is almost done', created_at: new Date() },
    ],
    exception_details: 'Exception details',
    status: 'CANCELED',
    created_at: new Date(),
    depends_on: ['depends on id'],
    id: 'task-2',
    task_type: 'Task name 2',
  },
  {
    progress_updates: [
      { message: 'the task has a progress of 50%', created_at: new Date() },
      { message: 'the task is almost done', created_at: new Date() },
    ],
    exception_details: 'Exception details',
    status: 'ERROR',
    created_at: new Date(),
    depends_on: ['depends on id'],
    id: 'task-3',
    task_type: 'Task name 3',
  },
  {
    progress_updates: [
      { message: 'the task has a progress of 50%', created_at: new Date() },
      { message: 'the task is almost done', created_at: new Date() },
    ],
    exception_details: 'Exception details',
    status: 'RUNNING',
    created_at: new Date(),
    depends_on: ['depends on id'],
    id: 'task-4',
    task_type: 'Task name 4',
  },
  {
    progress_updates: [
      { message: 'the task has a progress of 50%', created_at: new Date() },
      { message: 'the task is almost done', created_at: new Date() },
    ],
    exception_details: 'Exception details',
    status: 'PENDING',
    created_at: new Date(),
    depends_on: ['depends on id'],
    id: 'task-5',
    task_type: 'Task name 5',
  },
]

it('renders correct number of task items', () => {
  let wrapper = wrap({ items })
  expect(wrapper.find('TaskItem').length).toBe(items.length)
})

it('renders only running task opened', () => {
  let wrapper = wrap({ items })
  expect(wrapper.find('TaskItem').at(0).prop('open')).toBe(false)
  expect(wrapper.find('TaskItem').at(1).prop('open')).toBe(false)
  expect(wrapper.find('TaskItem').at(2).prop('open')).toBe(false)
  expect(wrapper.find('TaskItem').at(3).prop('open')).toBe(true)
  expect(wrapper.find('TaskItem').at(4).prop('open')).toBe(false)
})

it('renders correct info in task item', () => {
  let wrapper = wrap({ items })
  expect(wrapper.find('TaskItem').at(2).prop('item').id).toBe('task-3')
  expect(wrapper.find('TaskItem').at(4).prop('item').task_type).toBe('Task name 5')
  expect(wrapper.find('TaskItem').at(0).prop('item').status).toBe('COMPLETED')
})
