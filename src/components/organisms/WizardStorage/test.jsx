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

import type { Instance } from '../../../types/Instance'
import TW from '../../../utils/TestWrapper'
import Component, { TEST_ID } from '.'
import type { Props } from '.'

const defaultInstance: Instance = {
  id: 'instance1id',
  name: 'instance1name',
  flavor_name: 'instance1flavorname',
  instance_name: 'instance1instancename',
  num_cpu: 2,
  memory_mb: 2048,
  os_type: 'windows',
  devices: {
    nics: [{
      id: 'instance1nic1',
      network_name: 'network1',
      mac_address: 'instance1macaddress',
      network_id: 'network1',
    }],
    disks: [{
      id: 'disk1-id',
      name: 'disk1-name',
      storage_backend_identifier: 'sback2',
    }],
  },
}

const defaultProps: Props = {
  storageBackends: [{
    id: 'sback1',
    name: 'sback1-name',
  }, {
    id: 'sback2',
    name: 'sback2-name',
  }],
  instancesDetails: [defaultInstance],
  storageMap: [{
    type: 'disk',
    source: { id: 'disk1-id' },
    target: { id: 'sback2', name: 'sback2-name' },
  }, {
    type: 'backend',
    source: { id: 'sback2', storage_backend_identifier: 'sback2' },
    target: { id: 'sback1', name: 'sback1-name' },
  }],
  defaultStorage: 'sback1',
  onChange: () => { },
}
const wrap = (props: Props) => new TW(shallow(<Component {...props} />), TEST_ID)

describe('WizardStorage Component', () => {
  it('renders backend mapping', () => {
    let wrapper = wrap(defaultProps)

    expect(wrapper.findText('backend-source')).toBe('sback2')
    expect(wrapper.findText('backend-connectedTo')).toBe('Connected to instance1instancename')

    expect(wrapper.find('backend-destination').prop('selectedItem').id).toBe('sback1')

    expect(wrapper.find('backend-destination').prop('items')[0].id).toBe(null)
    expect(wrapper.find('backend-destination').prop('items')[0].name).toBe('Default')
    expect(wrapper.find('backend-destination').prop('items')[1].id).toBe('sback1')
    expect(wrapper.find('backend-destination').prop('items')[2].id).toBe('sback2')
  })

  it('renders disk mapping', () => {
    let wrapper = wrap(defaultProps)
    expect(wrapper.findText('disk-source')).toBe('disk1-id')
    expect(wrapper.findText('disk-connectedTo')).toBe('Connected to instance1instancename')

    expect(wrapper.find('disk-destination').prop('selectedItem').id).toBe('sback2')

    expect(wrapper.find('disk-destination').prop('items')[0].id).toBe(null)
    expect(wrapper.find('disk-destination').prop('items')[0].name).toBe('Default')
    expect(wrapper.find('disk-destination').prop('items')[1].id).toBe('sback1')
    expect(wrapper.find('disk-destination').prop('items')[2].id).toBe('sback2')
  })

  it('renders no storage message', () => {
    let newProps: Props = { ...defaultProps }
    newProps.storageBackends = []
    let wrapper = wrap(newProps)
    expect(wrapper.find('noStorage').length).toBe(1)
    wrapper = wrap(defaultProps)
    expect(wrapper.find('noStorage').length).toBe(0)
  })

  it('dispatches change', () => {
    let newProps: Props = { ...defaultProps, onChange: sinon.spy() }
    let wrapper = wrap(newProps)
    wrapper.find('disk-destination').simulate('change', { id: 'sback2', name: 'sback2-name' })

    let arg = newProps.onChange.args[0]

    expect(arg[0].id).toBe('disk1-id')
    expect(arg[1].id).toBe('sback2')
    expect(arg[2]).toBe('disk')
  })
})
