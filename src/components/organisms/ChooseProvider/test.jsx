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

// @flow

import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'
import TW from '../../../utils/TestWrapper'
import ChooseProvider from '.'

const wrap = props => new TW(shallow(
  // $FlowIgnore
  <ChooseProvider {...props} />
), 'cProvider')

let providers = ['azure', 'openstack', 'opc', 'oracle_vm', 'vmware_vsphere', 'aws']

describe('ChooseProvider Component', () => {
  it('renders all given providers', () => {
    let wrapper = wrap({ providers })
    providers.forEach(key => {
      expect(wrapper.find(`endpointLogo-${key}`).prop('endpoint')).toBe(key)
    })
  })

  it('dispatches provider click', () => {
    let onProviderClick = sinon.spy()
    let wrapper = wrap({ providers, onProviderClick })
    wrapper.find('endpointLogo-opc').click()
    expect(onProviderClick.calledOnce).toBe(true)
    expect(onProviderClick.args[0][0]).toBe('opc')
  })

  it('dispatches cancel click', () => {
    let onCancelClick = sinon.spy()
    let wrapper = wrap({ providers, onCancelClick })
    wrapper.find('cancelButton').click()
    expect(onCancelClick.calledOnce).toBe(true)
  })
})
