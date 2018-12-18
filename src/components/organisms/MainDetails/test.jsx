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
import moment from 'moment'
import TW from '../../../utils/TestWrapper'
import MainDetails from '.'

const wrap = props => new TW(shallow(
  // $FlowIgnore
  <MainDetails {...props} />
), 'mainDetails')

let endpoints = [
  { id: 'endpoint-1', name: 'Endpoint OPS', type: 'openstack' },
  { id: 'endpoint-2', name: 'Endpoint AZURE', type: 'azure' },
]
let item = {
  origin_endpoint_id: 'endpoint-1',
  destination_endpoint_id: 'endpoint-2',
  id: 'item-id',
  created_at: new Date(2017, 10, 24, 16, 15),
  instances: ['instance_1'],
  type: 'Replica',
  notes: 'A description',
}
let instancesDetails = [
  {
    instance_name: 'instance_1',
    devices: { nics: [{ network_name: 'network_1' }] },
  },
]

describe('MainDetails Component', () => {
  it('renders with endpoint missing', () => {
    let wrapper = wrap({ item: {}, endpoints: [] })
    expect(wrapper.findText('missing-source')).toBe('<StatusIcon />Endpoint is missing')
    expect(wrapper.findText('missing-target')).toBe('<StatusIcon />Endpoint is missing')
  })

  it('renders endpoint info', () => {
    let wrapper = wrap({ item, endpoints, instancesDetails })
    expect(wrapper.find('id').prop('value')).toBe('item-id')
    const localDate = moment(item.created_at).add(-new Date().getTimezoneOffset(), 'minutes')
    expect(wrapper.find('created').prop('value')).toBe(localDate.format('YYYY-MM-DD HH:mm:ss'))
    expect(wrapper.findText('name-source')).toBe('Endpoint OPS')
    expect(wrapper.findText('name-target')).toBe('Endpoint AZURE')
    expect(wrapper.find('description').prop('value')).toBe('A description')
  })

  it('renders endpoints logos', () => {
    let wrapper = wrap({ item, endpoints, instancesDetails })
    expect(wrapper.find('sourceLogo').prop('endpoint')).toBe('openstack')
    expect(wrapper.find('targetLogo').prop('endpoint')).toBe('azure')
  })

  it('renders loading', () => {
    let wrapper = wrap({ item: {}, endpoints: [], loading: true })
    expect(wrapper.find('loading').length).toBe(1)
  })
})
