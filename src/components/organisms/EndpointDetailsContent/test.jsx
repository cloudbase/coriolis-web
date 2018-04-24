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

// @flow

import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'
import moment from 'moment'
import EndpointDetailsContent from '.'

// $FlowIgnore
const wrap = props => shallow(<EndpointDetailsContent usage={{ replicas: [], migrations: [] }}{...props} />)

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

describe('EndpointDetailsContent Component', () => {
  it('renders endpoint details', () => {
    let wrapper = wrap({ item })

    expect(wrapper.findWhere(w => w.prop('data-test-id') === 'name').prop('value')).toBe(item.name)
    expect(wrapper.findWhere(w => w.prop('data-test-id') === 'type').prop('value')).toBe(item.type)
    expect(wrapper.findWhere(w => w.prop('data-test-id') === 'description').prop('value')).toBe(item.description)
    expect(wrapper.findWhere(w => w.prop('data-test-id') === 'created').prop('value'))
      .toBe(moment(item.created_at).add(-new Date().getTimezoneOffset(), 'minutes').format('DD/MM/YYYY HH:mm'))
  })

  it('renders connection info loading', () => {
    let wrapper = wrap({ item, loading: true })
    expect(wrapper.find('CopyValue').findWhere(c => c.prop('value') === 'endpoint_name').length).toBe(1)
    expect(wrapper.find('StatusImage').prop('loading')).toBe(true)
  })

  it('renders simple connection info', () => {
    let wrapper = wrap({ item, connectionInfo })
    expect(wrapper.find('CopyValue').findWhere(c => c.prop('value') === 'username').length).toBe(1)
    expect(wrapper.find('PasswordValue').prop('value')).toBe('password123')
    expect(wrapper.find('CopyValue').findWhere(c => c.prop('value') === 'other details').length).toBe(1)
  })

  it('renders boolean as Yes and No', () => {
    let wrapper = wrap({ item, connectionInfo })
    expect(wrapper.findWhere(w => w.prop('data-test-id') === 'value-boolean_true').prop('value')).toBe('Yes')
    expect(wrapper.findWhere(w => w.prop('data-test-id') === 'value-boolean_false').prop('value')).toBe('No')
  })

  it('renders nested connection info', () => {
    let wrapper = wrap({ item, connectionInfo })
    expect(wrapper.html().indexOf('Nested 1')).toBeGreaterThan(-1)
    expect(wrapper.find('CopyValue').findWhere(c => c.prop('value') === 'nested_first').length).toBe(1)
    expect(wrapper.html().indexOf('Nested 2')).toBeGreaterThan(-1)
    expect(wrapper.find('CopyValue').findWhere(c => c.prop('value') === 'nested_second').length).toBe(1)
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
})
