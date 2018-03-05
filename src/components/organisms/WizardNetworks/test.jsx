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
import WizardNetworks from '.'

const wrap = props => shallow(<WizardNetworks {...props} />)

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

it('renders correct number of instance details', () => {
  let wrapper = wrap({ networks, instancesDetails })
  expect(wrapper.find('Dropdown').length).toBe(instancesDetails.length)
})

it('renders correct info for instance details', () => {
  let wrapper = wrap({ networks, instancesDetails })
  expect(wrapper.html().indexOf('Connected to Instance name 1') > -1).toBe(true)
  expect(wrapper.html().indexOf('Connected to Instance name 2') > -1).toBe(true)
  expect(wrapper.html().indexOf('network 1') > -1).toBe(true)
  expect(wrapper.html().indexOf('network 2') > -1).toBe(true)
})

it('has dropdown with correct number of networks', () => {
  let wrapper = wrap({ networks, instancesDetails })
  expect(wrapper.find('Dropdown').at(0).prop('items').length).toBe(networks.length)
})

it('has dropdown with correct networks info', () => {
  let wrapper = wrap({ networks, instancesDetails })
  expect(wrapper.find('Dropdown').at(0).prop('items')[0].name).toBe('network 1')
  expect(wrapper.find('Dropdown').at(0).prop('items')[1].name).toBe('network 2')
})

it('renders selected networks', () => {
  let wrapper = wrap({ networks, instancesDetails, selectedNetworks })
  expect(wrapper.find('Dropdown').at(0).prop('selectedItem')).toBeFalsy()
  expect(wrapper.find('Dropdown').at(1).prop('selectedItem')).toBe('network 1')
  expect(wrapper.find('Dropdown').at(2).prop('selectedItem')).toBeFalsy()
})

it('renders no nics message', () => {
  let wrapper = wrap({ networks, instancesDetails: [{ ...instancesDetails[0], devices: { nics: [] } }] })
  expect(wrapper.html().indexOf('No networks were found') > -1).toBe(true)
})
