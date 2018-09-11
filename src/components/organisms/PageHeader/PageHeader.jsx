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
import type { Project } from '../../../types/Project'
import Dropdown from '../../molecules/Dropdown'
import NewItemDropdown from '../../molecules/NewItemDropdown'
import type { ItemType } from '../../molecules/NewItemDropdown'
import NotificationDropdown from '../../molecules/NotificationDropdown'
import UserDropdown from '../../molecules/UserDropdown'
import Modal from '../../molecules/Modal'
import ChooseProvider from '../../organisms/ChooseProvider'
import Endpoint from '../../organisms/Endpoint'
import UserModal from '../../organisms/UserModal'
import ProjectModal from '../../organisms/ProjectModal'

import projectStore from '../../../stores/ProjectStore'
import userStore from '../../../stores/UserStore'
import notificationStore from '../../../stores/NotificationStore'
import providerStore from '../../../stores/ProviderStore'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const Wrapper = styled.div`
  display: flex;
  margin: 48px 0;
  align-items: center;
`
const Title = styled.div`
  color: ${Palette.black};
  font-size: 32px;
  font-weight: ${StyleProps.fontWeights.light};
  flex-grow: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`
const Controls = styled.div`
  display: flex;

  & > div {
    margin-left: 16px;
  }
`

type Props = {
  title: string,
  onProjectChange?: (project: Project) => void,
  onModalOpen?: () => void,
  onModalClose?: () => void,
}
type State = {
  showChooseProviderModal: boolean,
  showEndpointModal: boolean,
  showUserModal: boolean,
  showProjectModal: boolean,
  providerType: ?string,
}
@observer
class PageHeader extends React.Component<Props, State> {
  state = {
    showChooseProviderModal: false,
    showEndpointModal: false,
    showUserModal: false,
    showProjectModal: false,
    providerType: null,
  }

  pollTimeout: TimeoutID
  stopPolling: boolean

  componentWillMount() {
    this.stopPolling = false
    this.pollData()
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout)
    this.stopPolling = true
  }

  getCurrentProject() {
    let project = userStore.loggedUser && userStore.loggedUser.project ? userStore.loggedUser.project : null
    if (project) {
      return projectStore.projects.find(p => p.id === project.id)
    }

    return null
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case 'signout':
        userStore.logout()
        return
      case 'profile':
        window.location.href = '/#/profile'
        break
      default:
    }
  }

  handleNewItem(item: ItemType) {
    switch (item.value) {
      case 'endpoint':
        providerStore.loadProviders()
        if (this.props.onModalOpen) {
          this.props.onModalOpen()
        }
        this.setState({ showChooseProviderModal: true })
        break
      case 'user':
        projectStore.getProjects()
        if (this.props.onModalOpen) {
          this.props.onModalOpen()
        }
        this.setState({ showUserModal: true })
        break
      case 'project':
        if (this.props.onModalOpen) {
          this.props.onModalOpen()
        }
        this.setState({ showProjectModal: true })
        break
      default:
    }
  }

  handleNotificationsClose() {
    notificationStore.saveSeen()
  }

  handleCloseChooseProviderModal() {
    if (this.props.onModalClose) {
      this.props.onModalClose()
    }
    this.setState({ showChooseProviderModal: false })
  }

  handleProviderClick(providerType: string) {
    this.setState({
      showChooseProviderModal: false,
      showEndpointModal: true,
      providerType,
    })
  }

  handleCloseEndpointModal() {
    if (this.props.onModalClose) {
      this.props.onModalClose()
    }
    this.setState({ showEndpointModal: false })
  }

  handleBackEndpointModal(options?: { autoClose?: boolean }) {
    this.setState({ showChooseProviderModal: !options || !options.autoClose, showEndpointModal: false })
  }

  handleProjectChange(project: Project) {
    userStore.switchProject(project.id).then(() => {
      projectStore.getProjects()
      notificationStore.loadData()

      if (this.props.onProjectChange) {
        this.props.onProjectChange(project)
      }
    })
  }

  handleUserModalClose() {
    if (this.props.onModalClose) {
      this.props.onModalClose()
    }
    this.setState({ showUserModal: false })
  }

  handleUserUpdateClick(user: User) {
    userStore.add(user).then(() => {
      if (this.props.onModalClose) {
        this.props.onModalClose()
      }
      this.setState({ showUserModal: false })
    })
  }

  handleProjectModalClose() {
    if (this.props.onModalClose) {
      this.props.onModalClose()
    }
    this.setState({ showProjectModal: false })
  }

  handleProjectModalUpdateClick(project: Project) {
    projectStore.add(project).then(() => {
      if (this.props.onModalClose) {
        this.props.onModalClose()
      }
      this.setState({ showProjectModal: false })
    })
  }

  pollData() {
    if (
      this.stopPolling ||
      this.state.showChooseProviderModal ||
      this.state.showEndpointModal ||
      this.state.showProjectModal ||
      this.state.showUserModal
    ) {
      return
    }

    notificationStore.loadData().then(() => {
      this.pollTimeout = setTimeout(() => { this.pollData() }, 5000)
    })
  }

  render() {
    return (
      <Wrapper>
        <Title>{this.props.title}</Title>
        <Controls>
          <Dropdown
            selectedItem={this.getCurrentProject()}
            items={projectStore.projects}
            onChange={project => { this.handleProjectChange(project) }}
            noItemsMessage="Loading..."
            labelField="name"
          />
          <NewItemDropdown onChange={item => { this.handleNewItem(item) }} />
          <NotificationDropdown
            items={notificationStore.notificationItems}
            onClose={() => this.handleNotificationsClose()}
          />
          <UserDropdown user={userStore.loggedUser} onItemClick={item => { this.handleUserItemClick(item) }} />
        </Controls>
        <Modal
          isOpen={this.state.showChooseProviderModal}
          title="New Cloud Endpoint"
          onRequestClose={() => { this.handleCloseChooseProviderModal() }}
        >
          <ChooseProvider
            onCancelClick={() => { this.handleCloseChooseProviderModal() }}
            providers={providerStore.providers}
            loading={providerStore.providersLoading}
            onProviderClick={providerName => { this.handleProviderClick(providerName) }}
          />
        </Modal>
        <Modal
          isOpen={this.state.showEndpointModal}
          title="New Cloud Endpoint"
          onRequestClose={() => { this.handleCloseEndpointModal() }}
        >
          <Endpoint
            type={this.state.providerType}
            cancelButtonText="Back"
            onCancelClick={options => { this.handleBackEndpointModal(options) }}
          />
        </Modal>
        {this.state.showUserModal ? (
          <UserModal
            isNewUser
            loading={userStore.updating}
            projects={projectStore.projects}
            onRequestClose={() => { this.handleUserModalClose() }}
            onUpdateClick={user => { this.handleUserUpdateClick(user) }}
          />
        ) : null}
        {this.state.showProjectModal ? (
          <ProjectModal
            isNewProject
            loading={projectStore.updating}
            onRequestClose={() => { this.handleProjectModalClose() }}
            onUpdateClick={project => { this.handleProjectModalUpdateClick(project) }}
          />
        ) : null}
      </Wrapper>
    )
  }
}

export default PageHeader
