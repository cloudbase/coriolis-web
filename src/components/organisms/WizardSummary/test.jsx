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
import WizardSummary from '.'

const wrap = props => shallow(<WizardSummary {...props} />)

let data = {
  options: {
    description: 'A description',
    field_name: 'Field name value',
  },
  selectedInstances: [
    { flavor_name: 'flavor_name', id: 'i-1', name: 'name', num_cpu: 2, memory_mb: 1024 },
  ],
  networks: [
    {
      sourceNic: { id: 's-1', network_name: 'n-1' },
      targetNetwork: { name: 'target network' },
    },
  ],
  source: {
    type: 'openstack',
    name: 'source name',
  },
  target: {
    type: 'azure',
    name: 'target name',
  },
  schedules: [
    {
      id: 's-1',
      schedule: {
        month: 2,
        dom: 14,
        dow: 3,
        minute: 0,
        hour: 17,
      },
    },
  ],
}

it('renders overview section', () => {
  let wrapper = wrap({ data, wizardType: 'replica' })
  expect(wrapper.html().indexOf('source name') > -1).toBe(true)
  expect(wrapper.find('StatusPill').at(0).prop('label')).toBe('OPENSTACK')
  expect(wrapper.html().indexOf('target name') > -1).toBe(true)
  expect(wrapper.find('StatusPill').at(1).prop('label')).toBe('AZURE')
  expect(wrapper.find('StatusPill').at(2).prop('label')).toBe('REPLICA')
})

it('renders instances section', () => {
  let wrapper = wrap({ data, wizardType: 'replica' })
  expect(wrapper.html().indexOf('flavor_name') > -1).toBe(true)
})

it('renders networks section', () => {
  let wrapper = wrap({ data, wizardType: 'replica' })
  expect(wrapper.html().indexOf('target network') > -1).toBe(true)
  expect(wrapper.html().indexOf('n-1') > -1).toBe(true)
})

it('renders options section', () => {
  let wrapper = wrap({ data, wizardType: 'replica' })
  expect(wrapper.html().indexOf('Description') > -1).toBe(true)
  expect(wrapper.html().indexOf('A description') > -1).toBe(true)
  expect(wrapper.html().indexOf('Field Name') > -1).toBe(true)
  expect(wrapper.html().indexOf('Field name value') > -1).toBe(true)
})

it('renders schedule section', () => {
  let wrapper = wrap({ data, wizardType: 'replica' })
  expect(wrapper.html().indexOf('Every February, every 14th, every Wednesday, at 17:00') > -1).toBe(true)
})
