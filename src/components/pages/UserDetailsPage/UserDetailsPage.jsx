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

import userStore from '../../../stores/UserStore'
import projectStore from '../../../stores/ProjectStore'

import userImage from './images/user.svg'

const Wrapper = styled.div``

type Props = {
  match: { params: { id: string } }
}
type State = {
  showUserModal: boolean,
  editPassword: boolean,
}
@observer
class UserDetailsPage extends React.Component<Props, State> {
  state = {
    showUserModal: false,
    editPassword: false,
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

  handleBackButtonClick() {
    window.location.href = '/#/users'
  }

  handleEditClick() {
    this.setState({ showUserModal: true })
  }

  handleDeleteConfirmation() {
    userStore.delete(this.props.match.params.id).then(() => {
      window.location.href = '/#/users'
    })
  }

  handleUserEditModalClose() {
    this.setState({ showUserModal: false, editPassword: false })
  }

  handleUserUpdateClick(user: User) {
    userStore.update(this.props.match.params.id, user).then(() => {
      userStore.getProjects(this.props.match.params.id)
      this.setState({ showUserModal: false, editPassword: false })
    })
  }

  handleUpdatePasswordClick() {
    this.setState({ showUserModal: true, editPassword: true })
  }

  loadData(id?: string) {
    projectStore.getProjects()
    userStore.getProjects(id || this.props.match.params.id)
    userStore.getUserInfo(id || this.props.match.params.id)
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
            item={{ ...userStore.userDetails, description: '' }}
            onBackButonClick={() => { this.handleBackButtonClick() }}
            typeImage={userImage}
            description={''}
          />}
          contentComponent={<UserDetailsContent
            onDeleteConfirmation={() => { this.handleDeleteConfirmation() }}
            user={userStore.userDetails}
            isLoggedUser={userStore.loggedUser && userStore.userDetails ? userStore.loggedUser.id === userStore.userDetails.id : false}
            loading={userStore.userDetailsLoading}
            userProjects={userStore.projects}
            projects={projectStore.projects}
            onEditClick={() => { this.handleEditClick() }}
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
      </Wrapper>
    )
  }
}

export default UserDetailsPage
