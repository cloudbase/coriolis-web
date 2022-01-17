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
import type { Project } from '@src/@types/Project'
import type { User } from '@src/@types/User'
import UserModal from '.'

type Props = {
  user?: User,
  isLoggedUser?: boolean,
  loading: boolean,
  isNewUser?: boolean,
  projects: Project[],
  editPassword?: boolean,
  onRequestClose: () => void,
  onUpdateClick: (user: User) => void,
}

const wrap = (props: Props) => new TW(shallow(<UserModal {...props} />), 'userModal')
const projects: Project[] = [
  { id: 'project-1', name: 'Project 1' },
  { id: 'project-2', name: 'Project 2' },
]
describe('UserModal Component', () => {
  it('doesn\'t dispatch click if required fields are not filled', () => {
    let onUpdateClick = sinon.spy()
    let wrapper = wrap({
      isNewUser: true,
      isLoggedUser: false,
      loading: false,
      projects,
      onRequestClose: () => { },
      onUpdateClick,
    })
    expect(wrapper.findText('updateButton', false, true)).toBe('New User')
    wrapper.find('updateButton').click()
    expect(onUpdateClick.called).toBe(false)
    expect(wrapper.find('field-username').prop('highlight')).toBe(true)
    expect(wrapper.find('field-new_password').prop('highlight')).toBe(true)
  })

  it('dispatches click if project is filled', () => {
    let onUpdateClick = sinon.spy()
    let wrapper = wrap({
      user: { id: 'user-1', name: 'User 1', email: 'email', project: projects[0] },
      isNewUser: false,
      isLoggedUser: false,
      loading: false,
      projects,
      onRequestClose: () => { },
      onUpdateClick,
    })
    expect(wrapper.findText('updateButton', false, true)).toBe('Update User')
    wrapper.find('updateButton').click()
    expect(onUpdateClick.called).toBe(true)
  })

  it('has disabled fields on loading', () => {
    let wrapper = wrap({
      user: { id: 'user-1', name: 'User 1', email: 'email', project: projects[0] },
      isNewUser: false,
      isLoggedUser: false,
      loading: true,
      projects,
      onRequestClose: () => { },
      onUpdateClick: () => { },
    })
    expect(wrapper.find('updateButton').prop('disabled')).toBe(true)
    expect(wrapper.find('field-username').prop('disabled')).toBe(true)
    expect(wrapper.find('field-new_password').length).toBe(0)
    expect(wrapper.find('field-confirm_password').length).toBe(0)
  })

  it('renders change password form', () => {
    let wrapper = wrap({
      user: { id: 'user-1', name: 'User 1', email: 'email', project: projects[0] },
      isNewUser: false,
      isLoggedUser: false,
      loading: true,
      projects,
      editPassword: true,
      onRequestClose: () => { },
      onUpdateClick: () => { },
    })

    expect(wrapper.findText('updateButton', false, true)).toBe('Change Password')
    expect(wrapper.find('field-new_password').length).toBe(1)
    expect(wrapper.find('field-confirm_password').length).toBe(1)
  })
})



