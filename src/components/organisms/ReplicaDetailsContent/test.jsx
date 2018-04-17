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
import ReplicaDetailsContent from '.'

const wrap = props => shallow(<ReplicaDetailsContent {...props} />)

let endpoints = [
  { id: 'endpoint-1', name: 'Endpoint OPS', type: 'openstack' },
  { id: 'endpoint-2', name: 'Endpoint AZURE', type: 'azure' },
]
let item = {
  origin_endpoint_id: 'endpoint-1',
  destination_endpoint_id: 'endpoint-2',
  id: 'item-id',
  created_at: new Date(2017, 10, 24, 16, 15),
  destination_environment: { description: 'A description' },
  type: 'Replica',
  executions: [
    { id: 'execution-1', status: 'ERROR', created_at: new Date() },
    { id: 'execution-2', status: 'COMPLETED', created_at: new Date() },
    { id: 'execution-2-1', status: 'CANCELED', created_at: new Date() },
    { id: 'execution-3', status: 'RUNNING', created_at: new Date() },
  ],
}

it('renders main details page', () => {
  let wrapper = wrap({ endpoints, item, page: '' })
  expect(wrapper.find('MainDetails').prop('item').id).toBe('item-id')
})

it('renders executions page', () => {
  let wrapper = wrap({ endpoints, item, page: 'executions' })
  expect(wrapper.find('Executions').prop('item').executions[1].id).toBe('execution-2')
})

it('renders details loading', () => {
  let wrapper = wrap({ endpoints, item, page: '', detailsLoading: true })
  expect(wrapper.find('MainDetails').prop('loading')).toBe(true)
})

it('renders schedule page', () => {
  let wrapper = wrap({ endpoints, item, page: 'schedule', scheduleStore: { schedules: [] } })
  expect(wrapper.find('Schedule').prop('schedules').length).toBe(0)
})

it('has `Create migration` button disabled if endpoint is missing', () => {
  let wrapper = wrap({ endpoints, item: null, page: '' })
  expect(wrapper.find('MainDetails').prop('bottomControls').props.children[0].props.children.props.disabled).toBe(true)
})

it('has `Create migration` button enabled if the last status is completed', () => {
  let newItem = {
    ...item,
    executions: [...item.executions, { id: 'execution-4', status: 'COMPLETED', created_at: new Date() }],
  }
  let wrapper = wrap({ endpoints, item: newItem, page: '' })
  expect(wrapper.find('MainDetails').prop('bottomControls').props.children[0].props.children.props.disabled).toBe(false)
})

it('dispaches create migration click', () => {
  let onCreateMigrationClick = sinon.spy()
  let wrapper = wrap({ endpoints, item, page: '', onCreateMigrationClick })
  wrapper.find('MainDetails').prop('bottomControls').props.children[0].props.children.props.onClick()
  expect(onCreateMigrationClick.calledOnce).toBe(true)
})

it('has `Create migration` button disabled if endpoint is missing and last status is completed', () => {
  let newItem = {
    ...item,
    origin_endpoint_id: 'missing',
    executions: [...item.executions, { id: 'execution-4', status: 'COMPLETED', created_at: new Date() }],
  }
  let wrapper = wrap({ endpoints, item: newItem, page: '' })
  expect((wrapper.find('MainDetails').prop('bottomControls').props.children[0].props.children.props.disabled)).toBe(true)
})

it('dispatches delete click', () => {
  let onDeleteReplicaClick = sinon.spy()
  let wrapper = wrap({ endpoints, item, page: '', onDeleteReplicaClick })
  wrapper.find('MainDetails').prop('bottomControls').props.children[1].props.children[1].props.onClick()
  expect(onDeleteReplicaClick.calledOnce).toBe(true)
})
