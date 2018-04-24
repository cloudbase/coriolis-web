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

// @flow

import React from 'react'
import { shallow } from 'enzyme'
import TestWrapper from '../../../utils/TestWrapper'
import StatusImage from '.'

const wrap = props => new TestWrapper(shallow(<StatusImage {...props} />), 'statusImage')

describe('StatusImage Component', () => {
  it('renders with status \'SUCCESS\' prop', () => {
    expect(wrap({ status: 'success' }).prop('status')).toBe('success')
  })

  it('renders progress', () => {
    const wrapper = wrap({ loading: true, loadingProgress: 45 })
    expect(wrapper.find('progressBar').prop('strokeDashoffset')).toBe(165)
    expect(wrapper.findText('progressText')).toBe('45%')
  })
})
