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
import WizardInstances from '.'

let instances = [
  { id: 'i-1', flavor_name: 'Flavor name', instance_name: 'Instance name 1', num_cpu: 3, memory_mb: 1024 },
  { id: 'i-2', flavor_name: 'Flavor name', instance_name: 'Instance name 2', num_cpu: 3, memory_mb: 1024 },
  { id: 'i-3', flavor_name: 'Flavor name', instance_name: 'Instance name 3', num_cpu: 3, memory_mb: 1024 },
]

storiesOf('WizardInstances', module)
  .add('default', () => (
    <div style={{ width: '800px' }}><WizardInstances instances={instances} currentPage={1} /></div>
  ))
  .add('some selection', () => (
    <div style={{ width: '800px' }}>
      <WizardInstances
        instances={instances}
        currentPage={1}
        selectedInstances={[{ ...instances[1] }]}
      />
    </div>
  ))
  .add('searching', () => (
    <div style={{ width: '800px' }}>
      <WizardInstances
        instances={instances}
        currentPage={1}
        searching
      />
    </div>
  ))
  .add('loading page', () => (
    <div style={{ width: '800px' }}>
      <WizardInstances
        instances={instances}
        currentPage={1}
        loadingPage
      />
    </div>
  ))
  .add('loading', () => (
    <div style={{ width: '800px' }}>
      <WizardInstances
        instances={instances}
        currentPage={1}
        loading
      />
    </div>
  ))
  .add('reloading', () => (
    <div style={{ width: '800px' }}>
      <WizardInstances
        instances={instances}
        currentPage={1}
        reloading
      />
    </div>
  ))
  .add('no instances', () => (
    <div style={{ width: '800px' }}>
      <WizardInstances
        instances={[]}
        currentPage={1}
      />
    </div>
  ))
  .add('search no found', () => (
    <div style={{ width: '800px' }}>
      <WizardInstances
        instances={[]}
        currentPage={1}
        searchNotFound
      />
    </div>
  ))
