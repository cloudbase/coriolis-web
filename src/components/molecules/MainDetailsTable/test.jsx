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

import type { MainItem } from '../../../types/MainItem'
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
      id: 'instance1disk1',
      name: 'instance1disk1name',
      storage_backend_identifier: 'asdaf',
    }],
  },
}

const defaultItem: MainItem = {
  id: 'id',
  executions: [],
  name: 'name',
  notes: 'notes',
  status: 'COMPLETED',
  tasks: [],
  created_at: new Date(2019, 2, 18, 13, 19, 10),
  updated_at: new Date(2019, 2, 19, 14, 18, 55),
  origin_endpoint_id: 'origin',
  destination_endpoint_id: 'destination',
  instances: ['instance1'],
  type: 'replica',
  info: {
    instance1: {
      export_info: { devices: { nics: [{ network_name: 'network1' }, { network_name: 'network2' }] } },
    },
  },
  destination_environment: { option1: 'value1' },
  transfer_result: {
    instance1: defaultInstance,
  },
  storage_mappings: {
    backend_mappings: [{
      destination: 'asdaf',
      source: 'asdaf1',
    }],
    default: 'asdaf',
    disk_mappings: [{
      destination: 'asdaf',
      disk_id: 'instance1disk1',
    }],
  },
  network_map: {
    network1: 'network2',
  },
}

const defaultProps: Props = {
  item: defaultItem,
  instancesDetails: [defaultInstance],
}
const wrap = (props: Props) => new TW(shallow(<Component {...props} />), TEST_ID)

describe('MainDetailsTable Component', () => {
  it('renders basic info', () => {
    let wrapper = wrap(defaultProps)
    defaultProps.instancesDetails.forEach(i => {
      expect(wrapper.findText(`instanceName-${i.name}`)).toBe(i.name)
    })
    expect(wrapper.findText('source-instance')).toBe('instance1')
    expect(wrapper.findText('destination-instance')).toBe('instance1')

    expect(wrapper.findText('source-network')).toBe('instance1macaddress')
    expect(wrapper.findText('destination-network')).toBe('network2')

    expect(wrapper.findText('source-storage')).toBe('instance1disk1')
    expect(wrapper.findText('destination-storage')).toBe('instance1disk1name')
  })
})
