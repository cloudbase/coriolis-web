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
import TestWrapper from '@src/utils/TestWrapper'
import SearchButton from '.'

const wrap = props => new TestWrapper(shallow(<SearchButton {...props} />), 'searchButton')

describe('SearchButton Component', () => {
  it('uses filter or search icon', () => {
    const getIconId = (w: TestWrapper): string => {
      /* eslint no-underscore-dangle: off */
      const iconSvg = w.find('icon').prop('dangerouslySetInnerHTML').__html
      const iconSvgId = /data--id="(.*?)"/g.exec(iconSvg)
      return iconSvgId ? iconSvgId[1] : ''
    }
    let wrapper = wrap()
    expect(getIconId(wrapper)).toBe('searchButton-searchIcon')

    wrapper = wrap({ useFilterIcon: true })
    expect(getIconId(wrapper)).toBe('searchButton-filterIcon')
  })

  it('handles click', () => {
    let onClick = sinon.spy()
    let wrapper = wrap({ onClick })
    wrapper.simulate('click')
    expect(onClick.calledOnce).toBe(true)
  })
})



