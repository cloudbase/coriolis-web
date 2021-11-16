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
import NewItemDropdown from '.'

const wrap = props => new TW(shallow(<NewItemDropdown onChange={() => { }} {...props} />), 'newItemDropdown')

describe('NewItemDropdown Component', () => {
  it('opens list on click', () => {
    let wrapper = wrap()
    expect(wrapper.findPartialId('listItem').length).toBe(0)
    wrapper.find('button').simulate('click')
    expect(wrapper.findPartialId('listItem').length).toBe(3)
  })

  it('dispatches change on item click with correct args', () => {
    let onChange = sinon.spy()
    let wrapper = wrap({ onChange })
    wrapper.find('button').simulate('click')
    wrapper.find('listItem-Endpoint').simulate('click')
    expect(onChange.args[0][0].value).toBe('endpoint')
  })
})



