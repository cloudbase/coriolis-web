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
import DetailsContentHeader from '.'

const wrap = props => new TW(shallow(
  // $FlowIgnore
  <DetailsContentHeader {...props} />
), 'dcHeader')

let item = {
  origin_endpoint_id: 'openstack',
  destination_endpoint_id: 'azure',
  instances: ['The instance title'],
  type: 'item type',
  executions: [{ status: 'COMPLETED', created_at: new Date() }],
}

describe('DetailsContentHeader Component', () => {
  it('renders title', () => {
    let wrapper = wrap({ item })
    expect(wrapper.findText('title')).toBe(item.instances[0])
  })

  it('renders with no action button', () => {
    let wrapper = wrap({ item })
    expect(wrapper.find('actionButton').length).toBe(0)
    expect(wrapper.find('cancelButton').length).toBe(0)
  })

  it('renders with action button, if there are dropdown actions', () => {
    let wrapper = wrap({ item, dropdownActions: [] })
    expect(wrapper.find('actionButton').length).toBe(1)
  })

  // it('dispatches back button click', () => {
  //   let onBackButonClick = sinon.spy()
  //   let wrapper = wrap({ item, onBackButonClick })
  //   wrapper.find('backButton').click()
  //   expect(onBackButonClick.called).toBe(true)
  // })

  it('renders correct INFO pill', () => {
    let wrapper = wrap({ item, primaryInfoPill: true })
    expect(wrapper.find('infoPill').prop('primary')).toBe(true)
    expect(wrapper.find('infoPill').prop('label')).toBe('ITEM TYPE')
    expect(wrapper.find('infoPill').prop('alert')).toBe(undefined)

    wrapper = wrap({ item, alertInfoPill: true })
    expect(wrapper.find('infoPill').prop('alert')).toBe(true)
  })

  it('renders correct STATUS pill', () => {
    let wrapper = wrap({ item })
    expect(wrapper.find('statusPill-', true).prop('status')).toBe('COMPLETED')
    let newItem = { ...item, executions: [...item.executions] }
    newItem.executions.push({ status: 'RUNNING', created_at: new Date() })
    wrapper = wrap({ item: newItem })
    expect(wrapper.find('statusPill-', true).prop('status')).toBe('RUNNING')
  })

  it('renders item description', () => {
    let wrapper = wrap({ item: { ...item, description: 'item description' } })
    expect(wrapper.findText('description')).toBe('item description')
  })
})
