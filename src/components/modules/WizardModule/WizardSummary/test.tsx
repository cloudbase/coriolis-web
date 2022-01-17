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
import TW from '@src/utils/TestWrapper'
import WizardSummary from '.'

const wrap = props => new TW(shallow(

  <WizardSummary storageMap={[]} instancesDetails={[]} sourceSchema={[]} destinationSchema={[]} {...props} />
), 'wSummary')

let schedules = [
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
]

let data = {
  destOptions: {
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
}

describe('WizardSummary Component', () => {
  it('renders overview section', () => {
    let wrapper = wrap({ data, wizardType: 'replica' })
    expect(wrapper.findText('source')).toBe('source name')
    expect(wrapper.find('sourcePill').prop('label')).toBe('OPENSTACK')
    expect(wrapper.findText('target')).toBe('target name')
    expect(wrapper.find('targetPill').prop('label')).toBe('AZURE')
    expect(wrapper.find('typePill').prop('label')).toBe('REPLICA')
  })

  it('renders instances section', () => {
    let wrapper = wrap({ data, wizardType: 'replica' })
    expect(wrapper.findText('instance-i-1')).toBe('name')
  })

  it('renders networks section', () => {
    let wrapper = wrap({ data, wizardType: 'replica' })
    expect(wrapper.findText('networkSource')).toBe('n-1')
    expect(wrapper.findText('networkTarget')).toBe('target network')
  })

  it('renders options section', () => {
    let wrapper = wrap({ data, wizardType: 'replica' })
    expect(wrapper.findText('optionLabel-description')).toBe('Description')
    expect(wrapper.findText('optionValue-description')).toBe('A description')
    expect(wrapper.findText('optionLabel-field_name')).toBe('Field Name')
    expect(wrapper.findText('optionValue-field_name')).toBe('Field name value')
  })

  it('renders schedule section', () => {
    let wrapper = wrap({ data, schedules, wizardType: 'replica' })
    expect(wrapper.findText(`scheduleItem-${schedules[0].id}`))
      .toBe('Every February, every 14th, every Wednesday, at 17:00 UTC')
  })
})




