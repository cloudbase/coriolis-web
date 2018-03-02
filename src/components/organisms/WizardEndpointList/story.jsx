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
import WizardEndpointList from '.'

let providers = ['openstack', 'azure', 'aws', 'opc', 'oracle_vm', 'vmware_vsphere']

let endpoints = [
  { id: 'e-1', name: 'An endpoint', type: 'openstack' },
  { id: 'e-2', name: 'Another endpoint', type: 'azure' },
  { id: 'e-3', name: 'Yet another endpoint', type: 'azure' },
]

storiesOf('WizardEndpointList', module)
  .add('default', () => (
    <WizardEndpointList providers={providers} endpoints={endpoints} />
  ))
