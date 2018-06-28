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
import TW from '../../../utils/TestWrapper'
import type { Project } from '../../../types/Project'
import type { User } from '../../../types/User'
import UserDetailsContent from '.'

type Props = {
  user: ?User,
  loading: boolean,
  projects: Project[],
  userProjects: Project[],
  isLoggedUser: boolean,
}
const wrap = (props: Props) => new TW(shallow(
  <UserDetailsContent
    onEditClick={() => { }}
    onUpdatePasswordClick={() => { }}
    onDeleteConfirmation={() => { }}
    {...props}
  />
), 'udContent')

const projects: Project[] = [
  { id: 'project-1', name: 'Project 1' },
  { id: 'project-2', name: 'Project 2' },
]
const user: User = { id: 'user-1', name: 'User 1', email: 'email1', project: projects[0] }

describe('UserDetailsContent Component', () => {
  it('renders info', () => {
    let wrapper = wrap({
      user,
      projects,
      userProjects: projects,
      loading: false,
      isLoggedUser: false,
    })
    expect(wrapper.find('name').prop('value')).toBe('User 1')
    expect(wrapper.find('id').prop('value')).toBe('user-1')
    expect(wrapper.find('project-', true).at(0).text(true)).toBe('Project 1')
    expect(wrapper.find('project-', true).at(1).text(true)).toBe('Project 2')
  })
})
