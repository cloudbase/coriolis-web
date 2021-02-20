/*
Copyright (C) 2020  Cloudbase Solutions SRL
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

import WizardStorage from '.'

const instancesDetails: any = [
  {
    id: '1',
    devices: {
      nics: [],
      disks: [
        {
          id: 'disk-1',
          name: 'Disk 1',
          storage_backend_identifier: 'backend-1',
        },
      ],
    },
    instance_name: 'Instance name 1',
    flavor_name: 'Instance name 1',
    name: 'Instance name 1',
    num_cpu: 2,
    memory_mb: 1024,
    os_type: 'windows',
  },
  {
    id: '2',
    devices: {
      nics: [],
      disks: [],
    },
    instance_name: 'Instance name 2',
    flavor_name: 'Instance name 2',
    name: 'Instance name 2',
    num_cpu: 4,
    memory_mb: 2048,
    os_type: 'linux',
  },
]
const storageBackends: any = [
  {
    id: 'backend-1',
    name: 'Backend 1',
  },
  {
    id: 'backend-2',
    name: 'Backend 2',
  },
]
storiesOf('WizardStorage', module)
  .add('page', () => (
    <WizardStorage
      storageBackends={storageBackends}
      instancesDetails={instancesDetails}
      storageMap={null}
      defaultStorageLayout="page"
      defaultStorage={{ value: 'backend-1' }}
      onDefaultStorageChange={() => { }}
      onChange={() => { }}
    />
  ))
  .add('modal', () => (
    <WizardStorage
      storageBackends={storageBackends}
      instancesDetails={instancesDetails}
      storageMap={null}
      defaultStorageLayout="modal"
      defaultStorage={{ value: 'backend-1' }}
      onDefaultStorageChange={() => { }}
      onChange={() => { }}
    />
  ))
