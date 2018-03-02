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
import { storiesOf } from '@storybook/react'
import Executions from '.'

let tasks = [
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
    status: 'RUNNING',
    created_at: new Date(),
    depends_on: ['depends on id'],
    id: 'task-2',
    task_type: 'Task name 2',
  },
]

let item = {
  executions: [
    { id: 'execution-1', status: 'ERROR', created_at: new Date() },
    { id: 'execution-2', status: 'COMPLETED', created_at: new Date() },
    { id: 'execution-2-1', status: 'CANCELED', created_at: new Date() },
    { id: 'execution-3', status: 'RUNNING', created_at: new Date(), tasks },
  ],
}

storiesOf('Executions', module)
  .add('default', () => (
    <div style={{ width: '800px' }}><Executions item={item} /></div>
  ))
  .add('no executions', () => (
    <div style={{ width: '800px' }}><Executions item={{}} /></div>
  ))
