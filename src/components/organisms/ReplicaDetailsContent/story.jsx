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
import ReplicaDetailsContent from '.'

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
let endpoints = [
  { id: 'endpoint-1', name: 'Endpoint OPS', type: 'openstack' },
  { id: 'endpoint-2', name: 'Endpoint AZURE', type: 'azure' },
]
let item = {
  origin_endpoint_id: 'endpoint-1',
  destination_endpoint_id: 'endpoint-2',
  id: 'item-id',
  created_at: new Date(2017, 10, 24, 16, 15),
  info: { instance: { export_info: { devices: { nics: [{ network_name: 'map_1' }] } } } },
  destination_environment: {
    description: 'A description',
    network_map: {
      map_1: 'Mapping 1',
    },
  },
  type: 'Replica',
  executions: [
    { id: 'execution-1', status: 'ERROR', created_at: new Date() },
    { id: 'execution-2', status: 'COMPLETED', created_at: new Date() },
    { id: 'execution-2-1', status: 'CANCELED', created_at: new Date() },
    { id: 'execution-3', status: 'RUNNING', created_at: new Date(), tasks },
  ],
}

storiesOf('ReplicaDetailsContent', module)
  .add('default', () => (
    <ReplicaDetailsContent item={item} endpoints={endpoints} page="" />
  ))
  .add('details loading', () => (
    <ReplicaDetailsContent item={item} endpoints={endpoints} page="" detailsLoading />
  ))
  .add('executions', () => (
    <ReplicaDetailsContent item={item} endpoints={endpoints} page="executions" />
  ))
  .add('schedule', () => (
    <ReplicaDetailsContent
      item={item}
      endpoints={endpoints}
      page="schedule"
      scheduleStore={{ schedules: [] }}
    />
  ))
