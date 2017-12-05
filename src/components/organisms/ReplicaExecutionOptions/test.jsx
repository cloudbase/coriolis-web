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
import ReplicaExecutionOptions from './ReplicaExecutionOptions'

import { executionOptions } from '../../../config'

const wrap = props => shallow(<ReplicaExecutionOptions {...props} />)


it('renders executionOptions from config', () => {
  let wrapper = wrap()
  expect(wrapper.find('Styled(WizardOptionsField)').length).toBe(executionOptions.length)
  expect(wrapper.find('Styled(WizardOptionsField)').at(0).prop('name')).toBe(executionOptions[0].name)
})

it('renders executionOptions with default values', () => {
  let wrapper = wrap()
  expect(wrapper.find('Styled(WizardOptionsField)').at(0).prop('value')).toBe(executionOptions[0].value)
})

it('renders executionOptions with given values', () => {
  let wrapper = wrap({ options: { shutdown_instances: true } })
  expect(wrapper.find('Styled(WizardOptionsField)').at(0).prop('value')).toBe(true)
})

it('dispaches cancel click', () => {
  let onCancelClick = sinon.spy()
  let wrapper = wrap({ onCancelClick })
  wrapper.findWhere(w => w.name() === 'Button' && w.html().indexOf('Cancel') > -1).simulate('click')
  expect(onCancelClick.calledOnce).toBe(true)
})

it('renders custom execution button label', () => {
  let wrapper = wrap({ executionLabel: 'custom_exec' })
  expect(wrapper.findWhere(w => w.name() === 'Button' && w.html().indexOf('custom_exec') > -1).length).toBe(1)
})

it('dispaches execution click', () => {
  let onExecuteClick = sinon.spy()
  let wrapper = wrap({ onExecuteClick })
  wrapper.findWhere(w => w.name() === 'Button' && w.html().indexOf('Execute') > -1).simulate('click')
  expect(onExecuteClick.args[0][0][0].name).toBe(executionOptions[0].name)
})
