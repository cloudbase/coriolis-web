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
import TW from '../../../utils/TestWrapper'
import WizardNetworks from '.'

const wrap = props => new TW(shallow(
  
  <WizardNetworks {...props} />
), 'wNetworks')

let networks = [
  { name: 'network 1', value: 'n-1' },
  { name: 'network 2', value: 'n-2' },
]

let instancesDetails = [
  {
    devices: { nics: [{ network_name: 'network 1', id: 'n-1' }] },
    instance_name: 'Instance name 1',
  },
  {
    devices: { nics: [{ network_name: 'network 2', id: 'n-2' }] },
    instance_name: 'Instance name 2',
  },
  {
    devices: { nics: [{ network_name: 'network 3', id: 'n-3' }] },
    instance_name: 'Instance name 3',
  },
]

let selectedNetworks = [
  {
    sourceNic: { id: 'n-2', network_name: 'network 2' },
    targetNetwork: { name: 'network 1' },
  },
]

describe('WizardNetworks Component', () => {
  it('renders correct number of instance details', () => {
    let wrapper = wrap({ networks, instancesDetails })
    expect(wrapper.findPartialId('dropdown-').length).toBe(instancesDetails.length)
  })

  it('renders correct info for instance details', () => {
    let wrapper = wrap({ networks, instancesDetails })
    expect(wrapper.findText('connectedTo-n-1')).toBe('Connected to Instance name 1')
    expect(wrapper.findText('connectedTo-n-2')).toBe('Connected to Instance name 2')
    expect(wrapper.findText('connectedTo-n-3')).toBe('Connected to Instance name 3')
    expect(wrapper.findText('networkName-n-1')).toBe('network 1')
    expect(wrapper.findText('networkName-n-2')).toBe('network 2')
    expect(wrapper.findText('networkName-n-3')).toBe('network 3')
  })

  it('has dropdown with correct number of networks', () => {
    let wrapper = wrap({ networks, instancesDetails })
    expect(wrapper.find('dropdown-n-1').prop('items').length).toBe(networks.length)
    expect(wrapper.find('dropdown-n-2').prop('items').length).toBe(networks.length)
    expect(wrapper.find('dropdown-n-3').prop('items').length).toBe(networks.length)
  })

  it('has dropdown with correct networks info', () => {
    let wrapper = wrap({ networks, instancesDetails })
    expect(wrapper.find('dropdown-n-1').prop('items')[0].name).toBe('network 1')
    expect(wrapper.find('dropdown-n-2').prop('items')[1].name).toBe('network 2')
  })

  it('renders selected networks', () => {
    let wrapper = wrap({ networks, instancesDetails, selectedNetworks })
    expect(wrapper.find('dropdown-n-1').prop('selectedItem')).toBeFalsy()
    expect(wrapper.find('dropdown-n-2').prop('selectedItem').name).toBe('network 1')
    expect(wrapper.find('dropdown-n-3').prop('selectedItem')).toBeFalsy()
    expect(wrapper.find('noNics').length).toBe(0)
  })

  it('renders no nics message', () => {
    let wrapper = wrap({ networks, instancesDetails: [{ ...instancesDetails[0], devices: { nics: [] } }] })
    expect(wrapper.find('noNics').length).toBe(1)
  })
})



