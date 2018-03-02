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
import MainDetails from '.'

const wrap = props => shallow(<MainDetails {...props} />)

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
}

it('renders with endpoint missing', () => {
  let wrapper = wrap({ item: {}, endpoints: [] })
  expect(wrapper.html().indexOf('Endpoint is missing') > -1).toBe(true)
})

it('renders endpoint info', () => {
  let wrapper = wrap({ item, endpoints })
  expect(wrapper.find('CopyValue').prop('value')).toBe('item-id')
  expect(wrapper.html().indexOf('2017-11-24 18:15:00') > -1).toBe(true)
  expect(wrapper.html().indexOf('Endpoint OPS') > -1).toBe(true)
  expect(wrapper.html().indexOf('Endpoint AZURE') > -1).toBe(true)
  expect(wrapper.html().indexOf('A description') > -1).toBe(true)
})

it('renders endpoints logos', () => {
  let wrapper = wrap({ item, endpoints })
  expect(wrapper.find('EndpointLogos').at(0).prop('endpoint')).toBe('openstack')
  expect(wrapper.find('EndpointLogos').at(1).prop('endpoint')).toBe('azure')
})

it('renders network_map', () => {
  let wrapper = wrap({ item, endpoints })
  let tableItems = wrapper.find('Styled(Table)').prop('items')
  expect(tableItems.length).toBe(1)
  expect(tableItems[0].length).toBe(4)
  expect(tableItems[0][0]).toBe('map_1')
  expect(tableItems[0][1][0]).toBe('instance')
  expect(tableItems[0][2]).toBe('Mapping 1')
  expect(tableItems[0][3]).toBe('Existing network')
})

it('renders loading', () => {
  let wrapper = wrap({ item: {}, endpoints: [], loading: true })
  expect(wrapper.find('StatusImage').prop('loading')).toBe(true)
})
