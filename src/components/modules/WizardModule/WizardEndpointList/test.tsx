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
import WizardEndpointList from '.'

const wrap = props => new TW(shallow(

  <WizardEndpointList {...props} />
), 'wEndpointList')

let providers = ['openstack', 'azure', 'aws', 'opc', 'oracle_vm', 'vmware_vsphere']

let endpoints = [
  { id: 'e-1', name: 'An endpoint', type: 'openstack' },
  { id: 'e-2', name: 'Another endpoint', type: 'azure' },
  { id: 'e-3', name: 'Yet another endpoint', type: 'azure' },
]

describe('WizardEndpointList Component', () => {
  it('renders correct number of providers', () => {
    let wrapper = wrap({ endpoints, providers })
    expect(wrapper.findPartialId('logo-').length).toBe(providers.length)
  })

  it('renders correct providers type', () => {
    let wrapper = wrap({ endpoints, providers })
    expect(wrapper.find(`logo-${providers[0]}`).prop('endpoint')).toBe(providers[0])
    expect(wrapper.find(`logo-${providers[1]}`).prop('endpoint')).toBe(providers[1])
    expect(wrapper.find(`logo-${providers[2]}`).prop('endpoint')).toBe(providers[2])
    expect(wrapper.find(`logo-${providers[3]}`).prop('endpoint')).toBe(providers[3])
    expect(wrapper.find(`logo-${providers[4]}`).prop('endpoint')).toBe(providers[4])
    expect(wrapper.find(`logo-${providers[5]}`).prop('endpoint')).toBe(providers[5])
  })

  it('has providers with correct enpoints available', () => {
    let wrapper = wrap({ endpoints, providers })
    expect(wrapper.find('dropdown-openstack').prop('items').length).toBe(2)
    expect(wrapper.find('dropdown-openstack').prop('items')[0].id).toBe('e-1')
    expect(wrapper.find('dropdown-azure').prop('items').length).toBe(3)
    expect(wrapper.find('dropdown-azure').prop('items')[0].id).toBe('e-2')
    expect(wrapper.find('dropdown-azure').prop('items')[1].id).toBe('e-3')
  })

  it('renders add new', () => {
    let wrapper = wrap({ endpoints, providers })
    expect(wrapper.find('addButton-opc').length).toBe(1)
    expect(wrapper.find('addButton-aws').length).toBe(1)
    expect(wrapper.find('addButton-oracle_vm').length).toBe(1)
    expect(wrapper.find('addButton-vmware_vsphere').length).toBe(1)
    expect(wrapper.find('addButton-openstack').length).toBe(0)
    expect(wrapper.find('addButton-azure').length).toBe(0)
  })

  // it('renders loading', () => {
  //   let wrapper = wrap({ endpoints, providers, loading: true })
  //   expect(wrapper.find('StatusImage').prop('loading')).toBe(true)
  // })

  // it('renders dropdown as primary if endpoint is selected', () => {
  //   let wrapper = wrap({ endpoints, providers, selectedEndpoint: { ...endpoints[1] } })
  //   expect(wrapper.find('Dropdown').at(1).prop('primary')).toBe(true)
  //   expect(wrapper.find('Dropdown').at(0).prop('primary')).toBe(false)
  // })

  // it('doesn\'t render endpoint if another endpoint is supplied', () => {
  //   let wrapper = wrap({ endpoints, providers, otherEndpoint: { ...endpoints[1] } })
  //   expect(wrapper.find('Dropdown').at(1).prop('items').length).toBe(2)
  //   expect(wrapper.find('Dropdown').at(1).prop('items')[0].id).toBe('e-3')
  //   expect(wrapper.find('Dropdown').at(1).prop('items')[1].id).toBe('addNew')
  // })
})



