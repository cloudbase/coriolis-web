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
import Executions from '.'

const wrap = props => shallow(<Executions {...props} />)

let item = {
  executions: [
    { id: 'execution-1', number: 1, status: 'ERROR', created_at: new Date() },
    { id: 'execution-2', number: 2, status: 'COMPLETED', created_at: new Date() },
    { id: 'execution-3', number: 3, status: 'CANCELED', created_at: new Date() },
    { id: 'execution-4', number: 4, status: 'RUNNING', created_at: new Date() },
  ],
}

it('selects last execution by default', () => {
  let wrapper = wrap({ item })
  expect(wrapper.html().indexOf('Execution #4')).toBeGreaterThan(-1)
})

it('selects previous execution on previous click', () => {
  let wrapper = wrap({ item })
  wrapper.find('Timeline').simulate('previousClick')
  expect(wrapper.html().indexOf('Execution #3')).toBeGreaterThan(-1)
  wrapper.find('Timeline').simulate('previousClick')
  expect(wrapper.html().indexOf('Execution #2')).toBeGreaterThan(-1)
})

it('selects next execution on next click', () => {
  let wrapper = wrap({ item })
  wrapper.find('Timeline').simulate('previousClick')
  wrapper.find('Timeline').simulate('previousClick')
  wrapper.find('Timeline').simulate('nextClick')
})

it('doesn\'t select next execution on next click if not possible', () => {
  let wrapper = wrap({ item })
  wrapper.find('Timeline').simulate('nextClick')
  expect(wrapper.html().indexOf('Execution #4')).toBeGreaterThan(-1)
})

it('dispatches cancel click', () => {
  let onCancelExecutionClick = sinon.spy()
  let wrapper = wrap({ item, onCancelExecutionClick })
  wrapper.find('Button').simulate('click')
  expect(onCancelExecutionClick.calledOnce).toBe(true)
})

it('dispatches delete click', () => {
  let onDeleteExecutionClick = sinon.spy()
  let wrapper = wrap({ item, onDeleteExecutionClick })
  wrapper.find('Timeline').simulate('previousClick')
  wrapper.find('Button').simulate('click')
  expect(onDeleteExecutionClick.calledOnce).toBe(true)
})

it('renders no executions', () => {
  let wrapper = wrap({ item: {} })
  expect(wrapper.html().indexOf('It looks like there are no executions in this replica')).toBeGreaterThan(-1)
})

it('dispatches execute click', () => {
  let onExecuteClick = sinon.spy()
  let wrapper = wrap({ item: {}, onExecuteClick })
  wrapper.find('Button').simulate('click')
  expect(onExecuteClick.calledOnce).toBe(true)
})
