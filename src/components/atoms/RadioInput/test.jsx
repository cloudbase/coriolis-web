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
import RadioInput from '.'

const wrap = props => shallow(<RadioInput {...props} />)

it('renders the given label', () => {
  let wrapper = wrap({ label: 'test' })
  let doc = new DOMParser().parseFromString(wrapper.html(), 'text/xml')
  expect(doc.firstChild.querySelector('div').innerHTML).toBe('test')
})
