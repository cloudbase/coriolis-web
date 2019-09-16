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
import DetailsTemplate from '../../templates/DetailsTemplate'
import DetailsPageHeader from '../../organisms/DetailsPageHeader'
import DetailsContentHeader from '../../organisms/DetailsContentHeader'
import UserDetailsContent from '../../organisms/UserDetailsContent'
import UserModal from '../../organisms/UserModal'
import AlertModal from '../../organisms/AlertModal'

import userStore from '../../../stores/UserStore'
import projectStore from '../../../stores/ProjectStore'

import Palette from '../../styleUtils/Palette'

import userImage from './images/user.svg'

const Wrapper = styled.div``

type Props = {
  match: { params: { id: string } },
  history: any,
}
type State = {
  showUserModal: boolean,
  editPassword: boolean,
  showDeleteAlert: boolean,
}
@observer
class UserDetailsPage extends React.Component<Props, State> {
  state = {
    showUserModal: false,
    editPassword: false,
    showDeleteAlert: false,
  }

  componentDidMount() {
    document.title = 'User Details'

    this.loadData()
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.match.params.id !== this.props.match.params.id) {
      this.loadData(newProps.match.params.id)
    }
  }

  componentWillUnmount() {
    userStore.clearUserDetails()
    userStore.clearProjects()
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case 'signout':
        userStore.logout()
        break
      default:
    }
  }

  handleEditClick() {
    this.setState({ showUserModal: true })
  }

  async handleDeleteConfirmation() {
    await userStore.delete(this.props.match.params.id)
    this.props.history.push('/users')
  }

  handleUserEditModalClose() {
    this.setState({ showUserModal: false, editPassword: false })
  }

  async handleUserUpdateClick(user: User) {
    await userStore.update(this.props.match.params.id, user)
    userStore.getProjects(this.props.match.params.id)
    this.setState({ showUserModal: false, editPassword: false })
  }

  handleUpdatePasswordClick() {
    this.setState({ showUserModal: true, editPassword: true })
  }

  handleDeleteClick() {
    this.setState({ showDeleteAlert: true })
  }

  loadData(id?: string) {
    projectStore.getProjects()
    userStore.getProjects(id || this.props.match.params.id)
    userStore.getUserInfo(id || this.props.match.params.id)
  }

  render() {
    let dropdownActions = [{
      label: 'Change password',
      color: Palette.primary,
      action: () => { this.handleUpdatePasswordClick() },
    }, {
      label: 'Edit user',
      action: () => { this.handleEditClick() },
    }, {
      label: 'Delete user',
      color: Palette.alert,
      action: () => { this.handleDeleteClick() },
    }]

    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={userStore.loggedUser}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          contentHeaderComponent={<DetailsContentHeader
            item={{ ...userStore.userDetails, description: '' }}
            backLink="/users"
            typeImage={userImage}
            dropdownActions={dropdownActions}
            description={''}
          />}
          contentComponent={<UserDetailsContent
            onDeleteClick={() => { this.handleDeleteClick() }}
            user={userStore.userDetails}
            isLoggedUser={userStore.loggedUser && userStore.userDetails ? userStore.loggedUser.id === userStore.userDetails.id : false}
            loading={userStore.userDetailsLoading}
            userProjects={userStore.projects}
            projects={projectStore.projects}
            onUpdatePasswordClick={() => { this.handleUpdatePasswordClick() }}
          />}
        />
        {this.state.showUserModal && userStore.userDetails ? (
          <UserModal
            user={userStore.userDetails}
            isLoggedUser={userStore.loggedUser && userStore.userDetails ? userStore.loggedUser.id === userStore.userDetails.id : false}
            loading={userStore.updating}
            projects={projectStore.projects}
            editPassword={this.state.editPassword}
            onRequestClose={() => { this.handleUserEditModalClose() }}
            onUpdateClick={user => { this.handleUserUpdateClick(user) }}
          />
        ) : null}
        {this.state.showDeleteAlert ? (
          <AlertModal
            isOpen
            title="Delete User?"
            message="Are you sure you want to delete this user?"
            extraMessage="Deleting a Coriolis User is permanent!"
            onConfirmation={() => { this.handleDeleteConfirmation() }}
            onRequestClose={() => { this.setState({ showDeleteAlert: false }) }}
          />
        ) : null}
      </Wrapper>
    )
  }
}

export default UserDetailsPage
