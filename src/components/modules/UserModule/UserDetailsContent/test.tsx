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

import type { User } from '@src/@types/User'
import type { Project } from '@src/@types/Project'
import TW from '@src/utils/TestWrapper'
import Component, { TEST_ID } from '.'
import type { Props } from '.'

const anotherProject: Project = {
  id: 'project2-id',
  name: 'project2-name',
  enabled: false,
  description: 'project2-description',
}

const defaultProject: Project = {
  id: 'project-id',
  name: 'project-name',
  enabled: true,
  description: 'project-description',
}

const defaultUser: User = {
  project: defaultProject,
  email: 'user@email.com',
  name: 'name',
  id: 'id',
  description: 'description',
  enabled: true,
  project_id: 'project-id',
  domain_id: 'default',
  isAdmin: true,
  password: 'password',
}
const defaultProps: Props = {
  user: defaultUser,
  loading: false,
  projects: [defaultProject, anotherProject],
  userProjects: [defaultProject, anotherProject],
  isLoggedUser: true,
  onDeleteClick: () => { },
  onUpdatePasswordClick: () => { },
}
const wrap = (props: Props) => new TW(shallow(<Component {...props} />), TEST_ID)

describe('UserDetailsContent Component', () => {
  it('renders info', () => {
    let wrapper = wrap(defaultProps)
    expect(wrapper.find('name').prop('value')).toBe(defaultUser.name)
    expect(wrapper.find('id').prop('value')).toBe(defaultUser.id)
    expect(wrapper.find('email').prop('value')).toBe(defaultUser.email)
    expect(wrapper.find('primaryProject').prop('value')).toBe(defaultProject.name)
    expect(wrapper.findText('enabled')).toBe('Yes')
  })

  it('renders project membership', () => {
    let wrapper = wrap(defaultProps)
    expect(wrapper.find('project-project-id').prop('to')).toBe('/project/project-id')
    expect(wrapper.find('project-project2-id').prop('to')).toBe('/project/project2-id')
  })

  it('dispatches delete an update clicks', () => {
    let newProps: Props = { ...defaultProps }
    newProps.onDeleteClick = sinon.spy()
    newProps.onUpdatePasswordClick = sinon.spy()
    let wrapper = wrap(newProps)
    let deleteButton = wrapper.find('deleteUserButton')
    deleteButton.simulate('click')
    let updateButton = wrapper.find('updateButton')
    updateButton.simulate('click')

    expect(newProps.onDeleteClick.called).toBe(true)
    expect(newProps.onUpdatePasswordClick.called).toBe(true)
  })

  it('has delete disabled if is the logged in user', () => {
    let wrapper = wrap(defaultProps)
    expect(wrapper.find('deleteUserButton').prop('disabled')).toBe(true)
    wrapper = wrap({ ...defaultProps, isLoggedUser: false })
    expect(wrapper.find('deleteUserButton').prop('disabled')).toBe(false)
  })
})



