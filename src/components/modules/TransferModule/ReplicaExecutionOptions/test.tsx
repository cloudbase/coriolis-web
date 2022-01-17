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
import ReplicaExecutionOptions from '.'

import { executionOptions } from '@src/constants'

const wrap = props => new TW(shallow(<ReplicaExecutionOptions {...props} />), 'reOptions')

describe('ReplicaExecutionOptions Component', () => {
  it('renders executionOptions from config', () => {
    let wrapper = wrap()
    executionOptions.forEach(option => {
      expect(wrapper.find(`option-${option.name}`).prop('name')).toBe(option.name)
    })
  })

  it('renders executionOptions with default values', () => {
    let wrapper = wrap()
    executionOptions.forEach(option => {
      expect(wrapper.find(`option-${option.name}`).prop('value')).toBe(option.defaultValue || undefined)
    })
  })

  it('renders executionOptions with given values', () => {
    let wrapper = wrap({ options: { shutdown_instances: true } })
    expect(wrapper.find('option-shutdown_instances').prop('value')).toBe(true)
  })

  it('dispaches cancel click', () => {
    let onCancelClick = sinon.spy()
    let wrapper = wrap({ onCancelClick })
    wrapper.find('cancelButton').click()
    expect(onCancelClick.calledOnce).toBe(true)
  })

  it('renders custom execution button label', () => {
    let wrapper = wrap({ executionLabel: 'custom_exec' })
    expect(wrapper.find('execButton').shallow.dive().dive().text()).toBe('custom_exec')
  })

  it('dispaches execution click', () => {
    let onExecuteClick = sinon.spy()
    let wrapper = wrap({ onExecuteClick })
    wrapper.find('execButton').click()
    expect(onExecuteClick.args[0][0][0].name).toBe(executionOptions[0].name)
  })
})



