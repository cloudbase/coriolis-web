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
import moment from 'moment'
import TW from '@src/utils/TestWrapper'
import EndpointDetailsContent from '.'

import configLoader from '@src/utils/Config'

const wrap = props => new TW(shallow(

  <EndpointDetailsContent usage={{ replicas: [], migrations: [] }}{...props} />
), 'edContent')

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
  beforeAll(() => {

    configLoader.config = { passwordFields: [] }
  })

  it('renders endpoint details', () => {
    let wrapper = wrap({ item })
    expect(wrapper.find('name').prop('value')).toBe(item.name)
    expect(wrapper.find('description').prop('value')).toBe(item.description)
    expect(wrapper.find('created').prop('value'))
      .toBe(moment(item.created_at).add(-new Date().getTimezoneOffset(), 'minutes').format('DD/MM/YYYY HH:mm'))
    expect(wrapper.find('connLoading').length).toBe(0)
  })

  it('renders connection info loading', () => {
    let wrapper = wrap({ item, loading: true })
    expect(wrapper.find('name').prop('value')).toBe(item.name)
    expect(wrapper.find('connLoading').length).toBe(1)
  })

  it('renders simple connection info', () => {
    let wrapper = wrap({ item, connectionInfo, passwordFields: ['password'] })
    expect(wrapper.find('connValue-username').prop('value')).toBe(connectionInfo.username)
    expect(wrapper.find('connPassword').prop('value')).toBe(connectionInfo.password)
    expect(wrapper.find('connValue-details').prop('value')).toBe(connectionInfo.details)
  })

  it('renders boolean as Yes and No', () => {
    let wrapper = wrap({ item, connectionInfo })
    expect(wrapper.find('connValue-boolean_true').prop('value')).toBe('Yes')
    expect(wrapper.find('connValue-boolean_false').prop('value')).toBe('No')
  })

  it('renders nested connection info', () => {
    let wrapper = wrap({ item, connectionInfo })
    expect(wrapper.find('connValue-nested_1').prop('value')).toBe(connectionInfo.nested.nested_1)
    expect(wrapper.find('connValue-nested_2').prop('value')).toBe(connectionInfo.nested.nested_2)
  })

  it('dispatches buttons clicks', () => {
    let onDeleteClick = sinon.spy()
    let onValidateClick = sinon.spy()

    let wrapper = wrap({ item, onDeleteClick, onValidateClick })
    wrapper.find('validateButton').click()
    wrapper.find('deleteButton').click()
    expect(onValidateClick.calledOnce).toBe(true)
    expect(onDeleteClick.calledOnce).toBe(true)
  })
})



