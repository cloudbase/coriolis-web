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
import WizardInstances from './WizardInstances'

const wrap = props => shallow(<WizardInstances {...props} />)

let instances = [
  { id: 'i-1', flavor_name: 'Flavor name', instance_name: 'Instance name 1', num_cpu: 3, memory_mb: 1024 },
  { id: 'i-2', flavor_name: 'Flavor name', instance_name: 'Instance name 2', num_cpu: 3, memory_mb: 1024 },
  { id: 'i-3', flavor_name: 'Flavor name', instance_name: 'Instance name 3', num_cpu: 3, memory_mb: 1024 },
]

it('has correct number of instances', () => {
  let wrapper = wrap({ instances, currentPage: 1 })
  expect(wrapper.find('Styled(Checkbox)').length).toBe(instances.length)
})

it('has correct instances info', () => {
  let wrapper = wrap({ instances, currentPage: 1 })
  expect(wrapper.html().indexOf('Flavor name') > -1).toBe(true)
  expect(wrapper.html().indexOf('Instance name 1') > -1).toBe(true)
  expect(wrapper.html().indexOf('Instance name 2') > -1).toBe(true)
  expect(wrapper.html().indexOf('Instance name 3') > -1).toBe(true)
  expect(wrapper.html().indexOf('1024 MB') > -1).toBe(true)
})

it('renders selected instances', () => {
  let wrapper = wrap({
    instances,
    currentPage: 1,
    selectedInstances: [
      { ...instances[0] },
      { ...instances[2] },
    ],
  })
  expect(wrapper.html().indexOf('2 instances selected') > -1).toBe(true)
  expect(wrapper.find('Styled(Checkbox)').at(0).prop('checked')).toBe(true)
  expect(wrapper.find('Styled(Checkbox)').at(1).prop('checked')).toBe(false)
  expect(wrapper.find('Styled(Checkbox)').at(2).prop('checked')).toBe(true)
})

it('renders current page', () => {
  let wrapper = wrap({ instances, currentPage: 2 })
  expect(wrapper.findWhere(w => w.name() === 'styled.div' && w.prop('number')).html().indexOf('2') > -1).toBe(true)
})

it('renders previous page disabled if page is 1', () => {
  let wrapper = wrap({ instances, currentPage: 1 })
  expect(wrapper.find('Arrow').at(0).prop('disabled')).toBe(true)
})

it('renders previous page disabled if page is greater than 1', () => {
  let wrapper = wrap({ instances, currentPage: 3 })
  expect(wrapper.find('Arrow').at(0).prop('disabled')).toBeFalsy()
})

it('renders loading', () => {
  let wrapper = wrap({ instances, currentPage: 1, loading: true })
  expect(wrapper.find('StatusImage').prop('loading')).toBe(true)
})

it('renders searching', () => {
  let wrapper = wrap({ instances, currentPage: 1, searching: true })
  expect(wrapper.find('SearchInput').prop('loading')).toBe(true)
})

it('renders search not found', () => {
  let wrapper = wrap({ instances: [], currentPage: 1, searchNotFound: true })
  expect(wrapper.html().indexOf('Your search returned no results') > -1).toBe(true)
})

it('renders loading page', () => {
  let wrapper = wrap({ instances, currentPage: 1, loadingPage: true })
  expect(wrapper.findWhere(w => w.name() === 'styled.div' && w.prop('number')).childAt(0).prop('status')).toBe('RUNNING')
})

it('enabled next page', () => {
  let wrapper = wrap({ instances, currentPage: 1, hasNextPage: true })
  expect(wrapper.find('Arrow').at(1).prop('disabled')).toBeFalsy()
})

it('dispatches next and previous page click, if enabled', () => {
  let onNextPageClick = sinon.spy()
  let onPreviousPageClick = sinon.spy()
  let wrapper = wrap({ instances, currentPage: 1, onNextPageClick, onPreviousPageClick })
  wrapper.findWhere(w => w.prop('previous') === true).simulate('click')
  wrapper.findWhere(w => w.prop('next') === true).simulate('click')
  expect(onPreviousPageClick.called).toBe(false)
  expect(onPreviousPageClick.called).toBe(false)
  wrapper = wrap({ instances, currentPage: 2, onNextPageClick, onPreviousPageClick, hasNextPage: true })
  wrapper.findWhere(w => w.prop('previous') === true).simulate('click')
  wrapper.findWhere(w => w.prop('next') === true).simulate('click')
  expect(onPreviousPageClick.called).toBe(true)
  expect(onPreviousPageClick.called).toBe(true)
})

it('dispaches reload click', () => {
  let onReloadClick = sinon.spy()
  let wrapper = wrap({ instances, currentPage: 1, onReloadClick })
  wrapper.find('ReloadButton').simulate('click')
  expect(onReloadClick.calledOnce).toBe(true)
})
