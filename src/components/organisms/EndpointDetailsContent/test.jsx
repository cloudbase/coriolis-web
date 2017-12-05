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
import EndpointDetailsContent from './EndpointDetailsContent'

const wrap = props => shallow(<EndpointDetailsContent {...props} />)

let item = {
  name: 'endpoint_name',
  type: 'openstack',
  description: 'endpoint_description',
  created_at: new Date(2017, 10, 24, 13, 56),
}

let connectionInfo = {
  username: 'username',
  password: 'password123',
  details: 'other details',
  boolean_true: true,
  boolean_false: false,
  nested: {
    nested_1: 'nested_first',
    nested_2: 'nested_second',
  },
}

it('renders endpoint details', () => {
  let wrapper = wrap({ item })
  expect(wrapper.html().indexOf('endpoint_name')).toBeGreaterThan(-1)
  expect(wrapper.html().indexOf('openstack')).toBeGreaterThan(-1)
  expect(wrapper.html().indexOf('endpoint_description')).toBeGreaterThan(-1)
  expect(wrapper.html().indexOf('24/11/2017 15:56')).toBeGreaterThan(-1)
})

it('renders connection info loading', () => {
  let wrapper = wrap({ item, loading: true })
  expect(wrapper.html().indexOf('endpoint_name')).toBeGreaterThan(-1)
  expect(wrapper.find('StatusImage').prop('loading')).toBe(true)
})

it('renders simple connection info', () => {
  let wrapper = wrap({ item, connectionInfo })
  expect(wrapper.html().indexOf('username')).toBeGreaterThan(-1)
  expect(wrapper.find('PasswordValue').prop('value')).toBe('password123')
  expect(wrapper.html().indexOf('other details')).toBeGreaterThan(-1)
})

it('renders boolean as Yes and No', () => {
  let wrapper = wrap({ item, connectionInfo })
  let yesResults = wrapper.findWhere(w => w.html().indexOf('Boolean True') > -1)
  expect(yesResults.at(yesResults.length - 2).html().indexOf('Yes')).toBeGreaterThan(-1)
  let noResults = wrapper.findWhere(w => w.html().indexOf('Boolean False') > -1)
  expect(noResults.at(noResults.length - 2).html().indexOf('No')).toBeGreaterThan(-1)
})

it('renders nested connection info', () => {
  let wrapper = wrap({ item, connectionInfo })
  expect(wrapper.html().indexOf('Nested 1')).toBeGreaterThan(-1)
  expect(wrapper.html().indexOf('nested_first')).toBeGreaterThan(-1)
  expect(wrapper.html().indexOf('nested_second')).toBeGreaterThan(-1)
  expect(wrapper.html().indexOf('Nested 2')).toBeGreaterThan(-1)
})

it('dispatches button clicks', () => {
  let onDeleteClick = sinon.spy()
  let onValidateClick = sinon.spy()
  let onEditClick = sinon.spy()

  let wrapper = wrap({ item, onDeleteClick, onValidateClick, onEditClick })
  wrapper.findWhere(w => w.name() === 'Button' && w.html().indexOf('Edit') > -1).simulate('click')
  wrapper.findWhere(w => w.name() === 'Button' && w.html().indexOf('Validate') > -1).simulate('click')
  wrapper.findWhere(w => w.name() === 'Button' && w.html().indexOf('Delete') > -1).simulate('click')
  expect(onEditClick.calledOnce).toBe(true)
  expect(onValidateClick.calledOnce).toBe(true)
  expect(onDeleteClick.calledOnce).toBe(true)
})
