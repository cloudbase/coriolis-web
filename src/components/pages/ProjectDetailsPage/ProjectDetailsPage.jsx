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
import styled from 'styled-components'
import { observer } from 'mobx-react'

import type { User } from '../../../types/User'
import type { Project, Role } from '../../../types/Project'
import DetailsTemplate from '../../templates/DetailsTemplate'
import DetailsPageHeader from '../../organisms/DetailsPageHeader'
import DetailsContentHeader from '../../organisms/DetailsContentHeader'
import ProjectDetailsContent from '../../organisms/ProjectDetailsContent'
import ProjectModal from '../../organisms/ProjectModal'
import ProjectMemberModal from '../../organisms/ProjectMemberModal'
import AlertModal from '../../organisms/AlertModal'

import projectStore from '../../../stores/ProjectStore'
import userStore from '../../../stores/UserStore'

import Palette from '../../styleUtils/Palette'

import projectImage from './images/project.svg'

const Wrapper = styled.div``

type Props = {
  match: { params: { id: string } },
  history: any,
}
type State = {
  showProjectModal: boolean,
  showAddMemberModal: boolean,
  showDeleteProjectAlert: boolean,
  addingMember: boolean,
}
@observer
class ProjectDetailsPage extends React.Component<Props, State> {
  state = {
    showProjectModal: false,
    showAddMemberModal: false,
    showDeleteProjectAlert: false,
    addingMember: false,
  }

  componentDidMount() {
    document.title = 'Project Details'

    this.loadData()
  }

  componentWillUnmount() {
    projectStore.clearProjectDetails()
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case 'signout':
        userStore.logout()
        break
      default:
    }
  }

  async handleEnableUser(user: User) {
    let enabled = !user.enabled
    // $FlowIgnore
    await userStore.update(user.id, { enabled })
    projectStore.getUsers(this.props.match.params.id)
  }

  async handleUserRoleChange(user: User, roleId: string, toggled: boolean) {
    let projectId = this.props.match.params.id
    if (toggled) {
      await projectStore.assignUserRole(projectId, user.id, roleId)
    } else {
      await projectStore.removeUserRole(projectId, user.id, roleId)
    }
    projectStore.getRoleAssignments()
  }

  handleRemoveUser(user: User) {
    let roles = projectStore.roleAssignments
      .filter(a => a.scope.project && a.scope.project.id === this.props.match.params.id)
      .filter(a => a.user.id === user.id)
      .map(ra => ra.role.id)
    projectStore.removeUser(this.props.match.params.id, user.id, roles)
  }

  handleEditProjectClick() {
    this.setState({ showProjectModal: true })
  }

  handleProjectModalClose() {
    this.setState({ showProjectModal: false })
  }

  async handleProjectUpdateClick(project: Project) {
    await projectStore.update(this.props.match.params.id, project)
    this.setState({ showProjectModal: false })
  }

  async handleDeleteConfirmation() {
    this.setState({ showDeleteProjectAlert: false })

    await projectStore.delete(this.props.match.params.id)
    if (
      userStore.loggedUser &&
      this.props.match.params.id === userStore.loggedUser.project.id &&
      projectStore.projects.length > 0
    ) {
      await userStore.switchProject(projectStore.projects[0].id)
      projectStore.getProjects()
      this.props.history.push('/projects')
    } else {
      this.props.history.push('/projects')
    }
  }

  async handleAddMemberClick() {
    await userStore.getAllUsers()
    this.setState({ showAddMemberModal: true })
  }

  async handleAddMember(user: User, isNew: boolean, roles: Role[]) {
    const assign = async (userId: string) => {
      await Promise.all(roles.map(async r => {
        await userStore.assignUserToProjectWithRole(userId, this.props.match.params.id, r.id)
      }))
      this.loadData()
      this.setState({ addingMember: false, showAddMemberModal: false })
    }

    this.setState({ addingMember: true })

    if (!isNew) {
      assign(user.id)
      return
    }

    let addedUser: ?User = await userStore.add(user)
    if (addedUser) {
      assign(addedUser.id)
    }
  }

  handleDeleteProjectClick() {
    this.setState({ showDeleteProjectAlert: true })
  }

  loadData() {
    const projectId = this.props.match.params.id
    projectStore.getProjects()
    projectStore.getProjectDetails(projectId)
    projectStore.getUsers(projectId, true)
    projectStore.getRoleAssignments()
    projectStore.getRoles()
  }

  render() {
    let dropdownActions = [{
      label: 'Add Member',
      color: Palette.primary,
      action: () => { this.handleAddMemberClick() },
    }, {
      label: 'Edit Project',
      action: () => { this.handleEditProjectClick() },
    }, {
      label: 'Delete Project',
      color: Palette.alert,
      action: () => { this.handleDeleteProjectClick() },
    }]

    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={userStore.loggedUser}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          contentHeaderComponent={<DetailsContentHeader
            item={{ ...projectStore.projectDetails, description: '' }}
            backLink="/projects"
            dropdownActions={dropdownActions}
            typeImage={projectImage}
            description={''}
          />}
          contentComponent={<ProjectDetailsContent
            project={projectStore.projectDetails}
            loading={projectStore.loading}
            users={projectStore.users}
            usersLoading={projectStore.usersLoading}
            roleAssignments={projectStore.roleAssignments}
            roles={projectStore.roles}
            loggedUserId={userStore.loggedUser ? userStore.loggedUser.id : ''}
            onEnableUser={user => { this.handleEnableUser(user) }}
            onRemoveUser={user => { this.handleRemoveUser(user) }}
            onAddMemberClick={() => { this.handleAddMemberClick() }}
            onUserRoleChange={(user, roleId, toggled) => { this.handleUserRoleChange(user, roleId, toggled) }}
            onDeleteClick={() => this.handleDeleteProjectClick()}
          />}
        />
        {this.state.showProjectModal ? (
          <ProjectModal
            loading={projectStore.updating}
            project={projectStore.projectDetails}
            onRequestClose={() => { this.handleProjectModalClose() }}
            onUpdateClick={project => { this.handleProjectUpdateClick(project) }}
          />
        ) : null}
        {this.state.showAddMemberModal ? (
          <ProjectMemberModal
            loading={this.state.addingMember}
            roles={projectStore.roles}
            projects={projectStore.projects}
            users={userStore.users.filter(u => !projectStore.users.find(pu => pu.id === u.id))}
            onAddClick={(user, isNew, roles) => { this.handleAddMember(user, isNew, roles) }}
            onRequestClose={() => { this.setState({ showAddMemberModal: false }) }}
          />
        ) : null}
        {this.state.showDeleteProjectAlert && projectStore.projects.length > 1 ? (
          <AlertModal
            isOpen
            title="Delete Project?"
            message="Are you sure you want to delete this project?"
            extraMessage="Deleting a Coriolis Project is permanent!"
            onConfirmation={() => { this.handleDeleteConfirmation() }}
            onRequestClose={() => { this.setState({ showDeleteProjectAlert: false }) }}
          />
        ) : this.state.showDeleteProjectAlert && projectStore.projects.length === 1 ? (
          <AlertModal
            isOpen
            type="error"
            title="Error deleting project"
            message="The project can't be deleted"
            extraMessage="You can't delete the last project since you'll no longer be able to log in"
            onRequestClose={() => { this.setState({ showDeleteProjectAlert: false }) }}
          />
        ) : null}
      </Wrapper>
    )
  }
}

export default ProjectDetailsPage
