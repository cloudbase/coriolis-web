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
import { DetailsPageHeader } from '../../organisms/DetailsPageHeader'
import DetailsContentHeader from '../../organisms/DetailsContentHeader'
import ProjectDetailsContent from '../../organisms/ProjectDetailsContent'
import ProjectModal from '../../organisms/ProjectModal'
import ProjectMemberModal from '../../organisms/ProjectMemberModal'

import projectStore from '../../../stores/ProjectStore'
import userStore from '../../../stores/UserStore'
import notificationStore from '../../../stores/NotificationStore'

import projectImage from './images/project.svg'

const Wrapper = styled.div``

type Props = {
  match: { params: { id: string } }
}
type State = {
  showProjectModal: boolean,
  showAddMemberModal: boolean,
  addingMember: boolean,
}
@observer
class ProjectDetailsPage extends React.Component<Props, State> {
  state = {
    showProjectModal: false,
    showAddMemberModal: false,
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

  handleBackButtonClick() {
    window.location.href = '/#/projects'
  }

  handleEnableUser(user: User) {
    let enabled = !user.enabled
    // $FlowIgnore
    userStore.update(user.id, { enabled }).then(() => {
      projectStore.getUsers(this.props.match.params.id)
    })
  }

  handleUserRoleChange(user: User, roleId: string, toggled: boolean) {
    let projectId = this.props.match.params.id
    let operation: Promise<void>
    if (toggled) {
      operation = projectStore.assignUserRole(projectId, user.id, roleId)
    } else {
      operation = projectStore.removeUserRole(projectId, user.id, roleId)
    }
    operation.then(() => {
      projectStore.getRoleAssignments()
    })
  }

  handleRemoveUser(user: User) {
    let roles = projectStore.roleAssignments
      .filter(a => a.scope.project.id === this.props.match.params.id)
      .filter(a => a.user.id === user.id)
    let oldRoleId = roles.length > 0 ? roles[0].role.id : ''
    projectStore.removeUser(this.props.match.params.id, user.id, oldRoleId)
  }

  handleEditProjectClick() {
    this.setState({ showProjectModal: true })
  }

  handleProjectModalClose() {
    this.setState({ showProjectModal: false })
  }

  handleProjectUpdateClick(project: Project) {
    projectStore.update(this.props.match.params.id, project).then(() => {
      this.setState({ showProjectModal: false })
    })
  }

  handleDeleteConfirmation() {
    projectStore.delete(this.props.match.params.id).then(() => {
      if (
        userStore.loggedUser &&
        this.props.match.params.id === userStore.loggedUser.project.id &&
        projectStore.projects.length > 0
      ) {
        userStore.switchProject(projectStore.projects[0].id).then(() => {
          projectStore.getProjects()
          window.location.href = '#/projects'
        })
      } else {
        window.location.href = '#/projects'
      }
    })
  }

  handleAddMemberClick() {
    userStore.getAllUsers().then(() => {
      this.setState({ showAddMemberModal: true })
    })
  }

  handleAddMember(user: User, isNew: boolean, roles: Role[]) {
    const assign = (userId: string) => {
      Promise.all(roles.map(r => {
        return userStore.assignUserToProjectWithRole(userId, this.props.match.params.id, r.id)
      })).catch(e => {
        notificationStore.notify('Error while assigning role to user', 'error')
        console.error(e)
      }).then(() => {
        this.loadData()
        this.setState({ addingMember: false, showAddMemberModal: false })
      })
    }

    this.setState({ addingMember: true })

    if (!isNew) {
      assign(user.id)
      return
    }

    userStore.add(user).then((addedUser: ?User) => {
      if (addedUser) {
        assign(addedUser.id)
      }
    })
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
    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={userStore.loggedUser}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          contentHeaderComponent={<DetailsContentHeader
            item={{ ...projectStore.projectDetails, description: '' }}
            onBackButonClick={() => { this.handleBackButtonClick() }}
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
            deleteDisabled={projectStore.projects.length === 1}
            loggedUserId={userStore.loggedUser ? userStore.loggedUser.id : ''}
            onEnableUser={user => { this.handleEnableUser(user) }}
            onRemoveUser={user => { this.handleRemoveUser(user) }}
            onEditProjectClick={() => { this.handleEditProjectClick() }}
            onDeleteConfirmation={() => { this.handleDeleteConfirmation() }}
            onAddMemberClick={() => { this.handleAddMemberClick() }}
            onUserRoleChange={(user, roleId, toggled) => { this.handleUserRoleChange(user, roleId, toggled) }}
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
      </Wrapper>
    )
  }
}

export default ProjectDetailsPage
