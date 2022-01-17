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
import TaskItem from '.'

const item: any = {
  progress_updates: [
    { message: 'the task has a progress of 50%', created_at: new Date() },
    { message: 'the task is almost done', created_at: new Date() },
    {
      message: 'Transferring changed areas of Cinder volume \'ca816553-a616-413e-a078-9a19e1da5326\'',
      created_at: new Date(),
      total_steps: 5,
      current_step: 2,
    },
    {
      message: 'Transferring changed areas of Cinder volume \'ca816553-a616-413e-a078-9a19e1da5326\'',
      created_at: new Date(),
      total_steps: 5,
      current_step: 7,
    },
  ],
  exception_details: 'Exception details',
  status: 'RUNNING',
  created_at: new Date(),
  depends_on: ['depends on id'],
  id: 'item-id',
  task_type: 'Task name',
}
const columnWidths = ['26%', '18%', '36%', '20%']

storiesOf('TaskItem', module)
  .add('running', () => (
    <div style={{ width: '800px' }}>
      <TaskItem
        item={item}
        columnWidths={columnWidths}
        open
        onDependsOnClick={() => {}}
      />
    </div>
  ))
  .add('closed', () => (
    <div style={{ width: '800px' }}>
      <TaskItem
        item={item}
        columnWidths={columnWidths}
        onDependsOnClick={() => { }}
        open={false}
      />
    </div>
  ))
  .add('completed', () => {
    const newItem = { ...item }
    newItem.status = 'COMPLETED'
    return (
      <div style={{ width: '800px' }}>
        <TaskItem
          item={newItem}
          columnWidths={columnWidths}
          onDependsOnClick={() => { }}
          open
        />
      </div>
    )
  })
  .add('canceled', () => {
    const newItem = { ...item }
    newItem.status = 'CANCELED'
    return (
      <div style={{ width: '800px' }}>
        <TaskItem
          item={newItem}
          columnWidths={columnWidths}
          onDependsOnClick={() => { }}
          open
        />
      </div>
    )
  })
  .add('error', () => {
    const newItem = { ...item }
    newItem.status = 'ERROR'
    return (
      <div style={{ width: '800px' }}>
        <TaskItem
          item={newItem}
          columnWidths={columnWidths}
          onDependsOnClick={() => { }}
          open
        />
      </div>
    )
  })
