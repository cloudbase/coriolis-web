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
import Modal from '.'

const wrap = props => shallow(<Modal {...props} />)

it('renders open with title', () => {
  let wrapper = wrap({ isOpen: true, children: <div>Modal</div>, title: 'title' })
  expect(wrapper.childAt(0).contains('title')).toBe(true)
  expect(wrapper.prop('contentLabel')).toBe('title')
  expect(wrapper.prop('isOpen')).toBe(true)
})

it('renders children and add resize handler', () => {
  let wrapper = wrap({ isOpen: true, children: <div>Modal</div>, title: 'title' })
  expect(wrapper.childAt(1).html().indexOf('Modal')).toBeGreaterThan(-1)
  expect(wrapper.childAt(1).prop('onResizeUpdate')).toBeTruthy()
})
