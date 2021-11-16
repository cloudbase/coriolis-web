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
import TestWrapper from '@src/utils/TestWrapper'
import Modal from '.'

const wrap = props => new TestWrapper(shallow(<Modal {...props} />), 'modal')

describe('Modal Component', () => {
  it('renders open with title', () => {
    let wrapper = wrap({ isOpen: true, children: <div>Modal</div>, title: 'the_title' })
    expect(wrapper.findText('title')).toBe('the_title')
    expect(wrapper.prop('contentLabel')).toBe('the_title')
    expect(wrapper.prop('isOpen')).toBe(true)
  })

  it('renders children and add resize handler', () => {
    let wrapper = wrap({ isOpen: true, children: <div data-test-id="modal-child">Modal</div>, title: 'the_title' })
    expect(wrapper.findText('child', true)).toBe('Modal')
    expect(wrapper.find('child').prop('onResizeUpdate')).toBeTruthy()
  })
})



