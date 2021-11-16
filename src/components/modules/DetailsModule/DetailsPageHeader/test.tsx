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
import type { User } from '@src/@types/User'
import DetailsPageHeader from '.'

type Props = {
  user?: User | null,
}

const wrap = (props: Props) => new TW(shallow(
  <DetailsPageHeader
    onUserItemClick={() => { }}
    testMode
    {...props}
  />
), 'dpHeader')

let user = {
  name: 'User name',
  email: 'email@email.com',
  id: 'user',
  project: { id: '', name: '' },
}

describe('DetailsPageHeader Component', () => {
  it('renders with given user', () => {
    let wrapper = wrap({ user })
    expect(wrapper.find('userDropdown').prop('user').name).toBe(user.name)
    expect(wrapper.find('userDropdown').prop('user').email).toBe(user.email)
  })

  it('dispatches user item click', () => {
    let onUserItemClick = sinon.spy()
    let wrapper = wrap({ user, onUserItemClick })
    wrapper.find('userDropdown').simulate('itemClick', { value: '', label: '' })
    expect(onUserItemClick.called).toBe(true)
  })
})



