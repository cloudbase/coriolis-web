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
import EndpointListItem from './EndpointListItem'

const wrap = props => shallow(<EndpointListItem {...props} />)

it('renders item properties', () => {
  let wrapper = wrap({
    item: { name: 'name-to-test', description: 'description-to-test' },
    getUsage: () => { return {} },
  })
  expect(wrapper.contains('name-to-test')).toBe(true)
  expect(wrapper.contains('description-to-test')).toBe(true)
})

it('renders usage count', () => {
  let wrapper = wrap({
    item: {},
    getUsage: () => { return { replicasCount: 12, migrationsCount: 11 } },
  })
  expect(wrapper.html().indexOf('11 migrations, 12 replicas') > -1).toBe(true)
})

it('dispatches onClick', () => {
  let onClick = sinon.spy()
  let wrapper = wrap({ item: {}, getUsage: () => { return {} }, onClick })
  wrapper.childAt(1).simulate('click')
  expect(onClick.calledOnce).toBe(true)
})
