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
import DetailsContentHeader from '.'

const wrap = props => shallow(<DetailsContentHeader {...props} />)

let item = {
  origin_endpoint_id: 'openstack',
  destination_endpoint_id: 'azure',
  instances: ['The instance title'],
  type: 'item type',
  executions: [{ status: 'COMPLETED', created_at: new Date() }],
}

it('renders title', () => {
  let wrapper = wrap({ item })
  expect(wrapper.html().indexOf('The instance title')).toBeGreaterThan(-1)
})

it('renders with no action button', () => {
  let wrapper = wrap({ item })
  expect(wrapper.find('Button').length).toBe(0)
})

it('renders with action button, if there\'s action button handler', () => {
  let wrapper = wrap({ item, buttonLabel: 'action button', onActionButtonClick: () => { } })
  expect(wrapper.find('Button').length).toBe(1)
})

it('dispatches action button click', () => {
  let onActionButtonClick = sinon.spy()
  let wrapper = wrap({ item, buttonLabel: 'action button', onActionButtonClick })
  wrapper.find('Button').simulate('click')
  expect(onActionButtonClick.calledOnce).toBe(true)
})

it('dispatches back button click', () => {
  let onBackButonClick = sinon.spy()
  let wrapper = wrap({ item, onBackButonClick })
  wrapper.childAt(0).simulate('click')
  expect(onBackButonClick.called).toBe(true)
})

it('renders cancel button if status is running', () => {
  let wrapper = wrap({
    item: { ...item, executions: [{ ...item.executions[0], status: 'RUNNING' }] },
  })
  expect(wrapper.find('Button').html().indexOf('Cancel')).toBeGreaterThan(-1)
})

it('dispatches cancel click', () => {
  let onCancelClick = sinon.spy()
  let wrapper = wrap({
    item: { ...item, executions: [{ ...item.executions[0], status: 'RUNNING' }] },
    onCancelClick,
  })
  wrapper.find('Button').simulate('click')
  expect(onCancelClick.args[0][0].status).toBe('RUNNING')
})

it('renders action button label', () => {
  let wrapper = wrap({ item, buttonLabel: 'action button', onActionButtonClick: () => { } })
  expect(wrapper.find('Button').html().indexOf('action button')).toBeGreaterThan(-1)
})

it('renders correct INFO pill', () => {
  let wrapper = wrap({ item, primaryInfoPill: true })
  expect(wrapper.findWhere(w => w.name() === 'StatusPill' && w.prop('status') === 'INFO').prop('primary')).toBe(true)
  expect(wrapper.findWhere(w => w.name() === 'StatusPill' && w.prop('status') === 'INFO').prop('label')).toBe('ITEM TYPE')
  wrapper = wrap({ item, alertInfoPill: true })
  expect(wrapper.findWhere(w => w.name() === 'StatusPill' && w.prop('status') === 'INFO').prop('alert')).toBe(true)
})

it('renders correct STATUS pill', () => {
  let wrapper = wrap({ item })
  expect(wrapper.findWhere(w => w.name() === 'StatusPill' && w.prop('status') === 'COMPLETED').length).toBe(1)
  let newItem = { ...item, executions: [...item.executions] }
  newItem.executions.push({ status: 'RUNNING', created_at: new Date() })
  wrapper = wrap({ item: newItem })
  expect(wrapper.findWhere(w => w.name() === 'StatusPill' && w.prop('status') === 'RUNNING').length).toBe(1)
})

it('renders item description', () => {
  let wrapper = wrap({ item: { ...item, description: 'item description' } })
  expect(wrapper.html().indexOf('item description')).toBeGreaterThan(-1)
})
