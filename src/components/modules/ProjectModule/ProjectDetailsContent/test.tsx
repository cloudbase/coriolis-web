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
import TW from '@src/utils/TestWrapper'
import type { Project, Role, RoleAssignment } from '@src/@types/Project'
import type { User } from '@src/@types/User'
import ProjectDetailsContent from '.'

type Props = {
  project: ?Project,
  loading: boolean,
  users: User[],
  usersLoading: boolean,
  deleteDisabled: boolean,
  roleAssignments: RoleAssignment[],
  roles: Role[],
  loggedUserId: string,
}
const wrap = (props: Props) => new TW(shallow(
  <ProjectDetailsContent
    onAddMemberClick={() => { }}
    onDeleteClick={() => { }}
    onEditProjectClick={() => { }}
    onEnableUser={() => { }}
    onRemoveUser={() => { }}
    onUserRoleChange={() => { }}
    {...props}
  />
), 'pdContent')
const projects: Project[] = [
  { id: 'project-1', name: 'Project 1' },
  { id: 'project-2', name: 'Project 2' },
]
const users: User[] = [
  { id: 'user-1', name: 'User 1', email: 'email1', project: projects[0] },
  { id: 'user-2', name: 'User 2', email: 'email2', project: projects[1] },
]
const roles: Role[] = [
  { id: 'role-1', name: 'Role 1' },
  { id: 'role-2', name: 'Role 2' },
]
const roleAssignments: RoleAssignment[] = [
  { user: users[0], role: roles[0], scope: { project: projects[0] } },
  { user: users[1], role: roles[1], scope: { project: projects[0] } },
]
describe('ProjectDetailsContent Component', () => {
  it('renders info', () => {
    let wrapper = wrap({
      project: projects[0],
      loading: false,
      users,
      usersLoading: false,
      deleteDisabled: false,
      roleAssignments,
      roles,
      loggedUserId: 'user-1',
    })
    expect(wrapper.find('name').prop('value')).toBe('Project 1')
    expect(wrapper.find('id').prop('value')).toBe('project-1')
    let rows = wrapper.find('members').prop('items')
    expect(rows[0][1].props.selectedItems.length).toBe(1)
    expect(rows[0][1].props.selectedItems[0]).toBe('role-1')
    expect(rows[1][1].props.selectedItems.length).toBe(1)
    expect(rows[1][1].props.selectedItems[0]).toBe('role-2')
  })
})



