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
import sinon from 'sinon'
import TestWrapper from '../../../utils/TestWrapper'
import MainListItem from '.'

const wrap = props => new TestWrapper(shallow(
  
  <MainListItem {...props} />
), 'mainListItem')

let item = {
  origin_endpoint_id: 'openstack',
  destination_endpoint_id: 'azure',
  instances: ['instance name'],
  executions: [{ status: 'COMPLETED', created_at: new Date() }],
}
let endpointType = id => id

describe('MainListItem Component', () => {
  it('renders with given status', () => {
    let wrapper = wrap({ item, endpointType })
    expect(wrapper.findPartialId('statusPill').at(0).prop('status')).toBe('COMPLETED')
  })

  it('renders with given endpoints', () => {
    let wrapper = wrap({ item, endpointType })
    expect(wrapper.find('sourceLogo').prop('endpoint')).toBe(item.origin_endpoint_id)
    expect(wrapper.find('destLogo').prop('endpoint')).toBe(item.destination_endpoint_id)
  })

  it('renders with selected', () => {
    let wrapper = wrap({ item, endpointType, selected: true })
    expect(wrapper.find('checkbox').prop('checked')).toBe(true)
  })

  it('dispatched item click', () => {
    let onClick = sinon.spy()
    let wrapper = wrap({ item, endpointType, onClick })
    wrapper.find('content').simulate('click')
    expect(onClick.calledOnce).toBe(true)
  })
})



