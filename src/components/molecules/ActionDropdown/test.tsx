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
import sinon from 'sinon'
import { shallow, mount } from 'enzyme'

import TW from '../../../utils/TestWrapper'
import ActionDropdown, { TEST_ID } from '.'
import type { Props, Action } from '.'

const defaultActions: Action[] = [
  { label: 'Action1', action: () => { } },
  { label: 'Action2', action: () => { }, color: 'red' },
  { label: 'Action3', action: () => { }, disabled: true },
  { label: 'Action4', action: () => { }, hidden: true },
  { label: 'Action5', action: () => { } },
]
const defaultProps: Props = {
  label: 'Actions',
  actions: defaultActions,
}

const wrap = (props: Props) => new TW(shallow(<ActionDropdown {...props} />), TEST_ID)
const domWrap = (props: Props) => new TW(mount(<ActionDropdown {...props} />), TEST_ID)

describe('ActionDropdown Component', () => {
  it('renders the dropdown button with the correct label', () => {
    let wrapper = wrap(defaultProps)
    expect(wrapper.find('dropdownButton').prop('value')).toBe(defaultProps.label)
  })

  it('opens list on click', () => {
    let wrapper = domWrap(defaultProps)
    expect(wrapper.findDiv('list').length).toBe(0)
    wrapper.findDiv('dropdownButton').simulate('click')
    expect(wrapper.findDiv('list').length).toBe(1)
  })

  it('renders only visible actions labels', () => {
    let wrapper = domWrap(defaultProps)
    wrapper.findDiv('dropdownButton').simulate('click')
    defaultActions.forEach(a => {
      if (a.hidden) {
        expect(wrapper.findDiv(`listItem-${a.label}`).length).toBe(0)
      } else {
        expect(wrapper.findDiv(`listItem-${a.label}`).length).toBe(1)
        expect(wrapper.findDiv(`listItem-${a.label}`).text()).toBe(a.label)
      }
    })
  })

  it('renders correct props for all actions', () => {
    let wrapper = domWrap(defaultProps)
    wrapper.findDiv('dropdownButton').simulate('click')
    defaultActions.filter(a => !a.hidden).forEach(a => {
      expect(wrapper.findDiv(`listItem-${a.label}`).prop('color')).toBe(a.color)
      expect(wrapper.findDiv(`listItem-${a.label}`).prop('disabled')).toBe(a.disabled)
    })
  })

  it('dispaches correct actions on action click', () => {
    let props: Props = { ...defaultProps }
    let enabledAction = props.actions[1]
    let disabledAction = props.actions[2]
    enabledAction.action = sinon.spy()
    disabledAction.action = sinon.spy()

    let wrapper = domWrap(props)
    wrapper.findDiv('dropdownButton').simulate('click')

    let enabledActionWrapper = wrapper.findDiv(`listItem-${enabledAction.label}`)
    let disabledActionWrapper = wrapper.findDiv(`listItem-${disabledAction.label}`)
    enabledActionWrapper.simulate('click')
    disabledActionWrapper.simulate('click')
    expect(enabledAction.action.called).toBe(true)
    expect(disabledAction.action.called).toBe(false)
  })
})



