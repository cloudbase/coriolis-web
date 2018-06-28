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
import sinon from 'sinon'
import TW from '../../../utils/TestWrapper'
import type { User } from '../../../types/User'
import type { Project, Role } from '../../../types/Project'
import ProjectMemberModal from '.'

type Props = {
  loading: boolean,
  users: User[],
  projects: Project[],
  onRequestClose: () => void,
  onAddClick: (user: User, isNew: boolean, roles: Role[]) => void,
  roles: Role[],
}
const wrap = (props: Props) => new TW(shallow(<ProjectMemberModal {...props} />), 'pmModal')
const users: User[] = [
  { id: 'user-1', name: 'User 1', email: '', project: { id: '', name: '' } },
  { id: 'user-2', name: 'User 2', email: '', project: { id: '', name: '' } },
]
const projects: Project[] = [
  { id: 'project-1', name: 'Project 1' },
  { id: 'project-2', name: 'Project 2' },
]
const roles: Role[] = [
  { id: 'role-1', name: 'Role 1' },
  { id: 'role-2', name: 'Role 2' },
  { id: 'role-3', name: 'Role 3' },
]
describe('ProjectMemberModal Component', () => {
  it('renders existing user form', () => {
    let wrapper = wrap({
      loading: false,
      users,
      projects,
      roles,
      onRequestClose: () => { },
      onAddClick: () => { },
    })
    expect(wrapper.find('users').prop('items')[1].value).toBe(users[1].id)
    expect(wrapper.find('roles').prop('items')[1].value).toBe(roles[1].id)
    expect(wrapper.find('users').prop('highlight')).toBe(false)
    expect(wrapper.find('roles').prop('highlight')).toBe(false)
    expect(wrapper.find('users').prop('disabled')).toBe(false)
    expect(wrapper.find('roles').prop('disabled')).toBe(false)
  })

  it('highlights required fields in existing user form', () => {
    let wrapper = wrap({
      loading: false,
      users,
      projects,
      roles,
      onRequestClose: () => { },
      onAddClick: () => { },
    })
    expect(wrapper.find('users').length).toBe(1)
    wrapper.find('addButton').click()
    expect(wrapper.find('users').prop('highlight')).toBe(true)
    expect(wrapper.find('roles').prop('highlight')).toBe(true)
  })

  it('renders new user form and highlights required', () => {
    let wrapper = wrap({
      loading: false,
      users,
      projects,
      roles,
      onRequestClose: () => { },
      onAddClick: () => { },
    })
    wrapper.find('formToggle').simulate('change', { value: 'new' })
    expect(wrapper.find('users').length).toBe(0)
    expect(wrapper.find('field-username').prop('highlight')).toBe(false)
    expect(wrapper.find('field-description').prop('highlight')).toBe(false)
    expect(wrapper.find('field-Primary Project').prop('highlight')).toBe(false)
    expect(wrapper.find('roles').prop('highlight')).toBe(false)
    expect(wrapper.find('field-password').prop('highlight')).toBe(false)
    expect(wrapper.find('field-confirm_password').prop('highlight')).toBe(false)
    expect(wrapper.find('field-Email').prop('highlight')).toBe(false)
    wrapper.find('addButton').click()
    expect(wrapper.find('field-username').prop('highlight')).toBe(true)
    expect(wrapper.find('field-description').prop('highlight')).toBe(false)
    expect(wrapper.find('field-Primary Project').prop('highlight')).toBe(false)
    expect(wrapper.find('roles').prop('highlight')).toBe(true)
    expect(wrapper.find('field-password').prop('highlight')).toBe(true)
    expect(wrapper.find('field-confirm_password').prop('highlight')).toBe(false)
    expect(wrapper.find('field-Email').prop('highlight')).toBe(false)
  })

  it('dispatches add click with correct data', () => {
    let onAddClick = sinon.spy()
    let wrapper = wrap({
      loading: false,
      users,
      projects,
      roles,
      onRequestClose: () => { },
      onAddClick,
    })
    wrapper.find('formToggle').simulate('change', { value: 'new' })
    wrapper.find('field-username').simulate('change', 'new-username')
    wrapper.find('roles').simulate('change', 'role-2')
    wrapper.find('roles').simulate('change', 'role-1')
    wrapper.find('roles').simulate('change', 'role-2')
    wrapper.find('roles').simulate('change', 'role-3')
    wrapper.find('field-password').simulate('change', 'new-password')
    wrapper.find('field-confirm_password').simulate('change', 'new-password')
    wrapper.find('addButton').click()
    let userArg = onAddClick.args[0][0]
    let rolesArg: Role[] = onAddClick.args[0][2]
    expect(userArg.name).toBe('new-username')
    expect(userArg.password).toBe('new-password')
    expect(rolesArg.length).toBe(2)
    expect(rolesArg[0].id).toBe('role-1')
    expect(rolesArg[1].id).toBe('role-3')
  })

  it('disabled on loading', () => {
    let wrapper = wrap({
      loading: true,
      users,
      projects,
      roles,
      onRequestClose: () => { },
      onAddClick: () => { },
    })
    expect(wrapper.find('users').prop('disabled')).toBe(true)
    expect(wrapper.find('roles').prop('disabled')).toBe(true)
  })
})
