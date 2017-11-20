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
import MigrationDetailsContent from './MigrationDetailsContent'

const wrap = props => shallow(<MigrationDetailsContent {...props} />)

let tasks = [
  {
    progress_updates: [
      { message: 'the task has a progress of 50%', created_at: new Date() },
      { message: 'the task is almost done', created_at: new Date() },
    ],
    exception_details: 'Exception details',
    status: 'RUNNING',
    created_at: new Date(),
    depends_on: ['depends on id'],
    id: 'task-2',
    task_type: 'Task name 2',
  },
]
let endpoints = [
  { id: 'endpoint-1', name: 'Endpoint OPS', type: 'openstack' },
  { id: 'endpoint-2', name: 'Endpoint AZURE', type: 'azure' },
]
let item = {
  origin_endpoint_id: 'endpoint-1',
  destination_endpoint_id: 'endpoint-2',
  id: 'item-id',
  created_at: new Date(2017, 10, 24, 16, 15),
  tasks,
  destination_environment: { description: 'A description' },
  type: 'Migration',
}

it('renders main details page', () => {
  let wrapper = wrap({ endpoints, item, page: '' })
  expect(wrapper.find('MainDetails').prop('item').id).toBe('item-id')
})

it('renders tasks page', () => {
  let wrapper = wrap({ endpoints, item, page: 'tasks' })
  expect(wrapper.find('Tasks').prop('items')[0].id).toBe('task-2')
})

it('renders details loading', () => {
  let wrapper = wrap({ endpoints, item, page: '', detailsLoading: true })
  expect(wrapper.find('MainDetails').prop('loading')).toBe(true)
})

it('dispatches delete click', () => {
  let onDeleteMigrationClick = sinon.spy()
  let wrapper = wrap({ endpoints, item, page: '', onDeleteMigrationClick })
  wrapper.find('MainDetails').prop('bottomControls').props.children.props.onClick()
  expect(onDeleteMigrationClick.calledOnce).toBe(true)
})
