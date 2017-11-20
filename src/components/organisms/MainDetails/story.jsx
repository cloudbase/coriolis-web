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
import MainDetails from './MainDetails'

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

storiesOf('MainDetails', module)
  .add('default', () => (
    <div style={{ width: '800px' }}><MainDetails endpoints={[]} item={{}} /></div>
  ))
  .add('loading', () => (
    <div style={{ width: '800px' }}><MainDetails loading endpoints={[]} item={{}} /></div>
  ))
  .add('openstack -> azure', () => (
    <div style={{ width: '800px' }}><MainDetails endpoints={endpoints} item={item} /></div>
  ))
