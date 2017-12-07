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
import EndpointLogos from './EndpointLogos'

const wrap = props => shallow(<EndpointLogos {...props} />).dive()

it('passes down props', () => {
  let wrapper = wrap({ height: 32, endpoint: 'aws' })
  expect(wrapper.prop('height')).toBe(32)
  let imageInfo = wrapper.findWhere(w => w.name() === 'styled.div' && w.prop('imageInfo')).prop('imageInfo')
  expect(imageInfo.h).toBe(32)
  expect(imageInfo.image).toBe('file')
})
