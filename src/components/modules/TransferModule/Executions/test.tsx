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
import TW from '@src/utils/TestWrapper'
import Executions from '.'

const wrap = props => new TW(shallow(

  <Executions {...props} />
), 'executions')

let item = {
  executions: [
    { id: 'execution-1', number: 1, status: 'ERROR', created_at: new Date() },
    { id: 'execution-2', number: 2, status: 'COMPLETED', created_at: new Date() },
    { id: 'execution-3', number: 3, status: 'CANCELED', created_at: new Date() },
    { id: 'execution-4', number: 4, status: 'RUNNING', created_at: new Date() },
  ],
}

describe('Executions Component', () => {
  it('selects last execution by default', () => {
    let wrapper = wrap({ item })
    expect(wrapper.findText('number')).toBe('Execution #4')
  })

  it('selects previous execution on previous click', () => {
    let wrapper = wrap({ item })
    wrapper.find('timeline').simulate('previousClick')
    expect(wrapper.findText('number')).toBe('Execution #3')
    wrapper.find('timeline').simulate('previousClick')
    expect(wrapper.findText('number')).toBe('Execution #2')
  })

  it('selects next execution on next click', () => {
    let wrapper = wrap({ item })
    wrapper.find('timeline').simulate('previousClick')
    wrapper.find('timeline').simulate('previousClick')
    wrapper.find('timeline').simulate('nextClick')
    expect(wrapper.findText('number')).toBe('Execution #3')
  })

  it('doesn\'t select next execution on next click if not possible', () => {
    let wrapper = wrap({ item })
    wrapper.find('timeline').simulate('nextClick')
    expect(wrapper.findText('number')).toBe('Execution #4')
  })

  it('shows cancel button on running executions', () => {
    let wrapper = wrap({ item })
    expect(wrapper.find('cancelButton').length).toBe(1)
    expect(wrapper.find('deleteButton').length).toBe(0)
  })

  it('shows delete button on non-running executions', () => {
    let wrapper = wrap({ item })
    wrapper.find('timeline').simulate('previousClick')
    expect(wrapper.find('cancelButton').length).toBe(0)
    expect(wrapper.find('deleteButton').length).toBe(1)
  })

  it('dispatches cancel click', () => {
    let onCancelExecutionClick = sinon.spy()
    let wrapper = wrap({ item, onCancelExecutionClick })
    wrapper.find('cancelButton').simulate('click')
    expect(onCancelExecutionClick.calledOnce).toBe(true)
  })

  it('dispatches delete click', () => {
    let onDeleteExecutionClick = sinon.spy()
    let wrapper = wrap({ item, onDeleteExecutionClick })
    wrapper.find('timeline').simulate('previousClick')
    wrapper.find('deleteButton').simulate('click')
    expect(onDeleteExecutionClick.calledOnce).toBe(true)
  })

  it('renders no executions', () => {
    let wrapper = wrap({ item: {} })
    expect(wrapper.findText('noExTitle')).toBe('It looks like there are no executions in this replica.')
  })

  it('dispatches execute click', () => {
    let onExecuteClick = sinon.spy()
    let wrapper = wrap({ item: {}, onExecuteClick })
    wrapper.find('executeButton').simulate('click')
    expect(onExecuteClick.calledOnce).toBe(true)
  })
})



