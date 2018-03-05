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
import connectToStores from 'alt-utils/lib/connectToStores'

import Dropdown from '../../molecules/Dropdown'
import NewItemDropdown from '../../molecules/NewItemDropdown'
import type { ItemType } from '../../molecules/NewItemDropdown'
import NotificationDropdown from '../../molecules/NotificationDropdown'
import UserDropdown from '../../molecules/UserDropdown'
import Modal from '../../molecules/Modal'
import ChooseProvider from '../../organisms/ChooseProvider'
import Endpoint from '../../organisms/Endpoint'

import ProjectStore from '../../../stores/ProjectStore'
import UserStore from '../../../stores/UserStore'
import UserActions from '../../../actions/UserActions'
import NotificationActions from '../../../actions/NotificationActions'
import NotificationStore from '../../../stores/NotificationStore'
import ProviderActions from '../../../actions/ProviderActions'
import ProviderStore from '../../../stores/ProviderStore'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import type { Project } from '../../../types/Project'

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
  onProjectChange: (project: Project) => void,
  onModalOpen: () => void,
  onModalClose: () => void,
  projectStore: any,
  userStore: any,
  providerStore: any,
  notificationStore: any,
}
type State = {
  showChooseProviderModal: boolean,
  showEndpointModal: boolean,
  providerType?: string,
}
class PageHeader extends React.Component<Props, State> {
  static getStores() {
    return [UserStore, ProjectStore, ProviderStore, NotificationStore]
  }

  static getPropsFromStores(): $Shape<Props> {
    return {
      userStore: UserStore.getState(),
      projectStore: ProjectStore.getState(),
      providerStore: ProviderStore.getState(),
      notificationStore: NotificationStore.getState(),
    }
  }

  constructor() {
    super()

    this.state = {
      showChooseProviderModal: false,
      showEndpointModal: false,
    }
  }

  componentDidMount() {
    NotificationActions.loadNotifications()
  }

  getCurrentProject() {
    if (this.props.userStore.user && this.props.userStore.user.project) {
      return this.props.projectStore.projects.find(p => p.id === this.props.userStore.user.project.id)
    }

    return null
  }

  handleUserItemClick(item) {
    switch (item.value) {
      case 'signout':
        UserActions.logout()
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
        ProviderActions.loadProviders()
        if (this.props.onModalOpen) {
          this.props.onModalOpen()
        }
        this.setState({ showChooseProviderModal: true })
        break
      default:
    }
  }

  handleNotificationsClose() {
    NotificationActions.clearNotifications()
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

  handleBackEndpointModal(options) {
    this.setState({ showChooseProviderModal: !options || !options.autoClose, showEndpointModal: false })
  }

  render() {
    return (
      <Wrapper>
        <Title>{this.props.title}</Title>
        <Controls>
          <Dropdown
            selectedItem={this.getCurrentProject()}
            items={this.props.projectStore.projects}
            onChange={this.props.onProjectChange}
            noItemsMessage="Loading..."
            labelField="name"
          />
          <NewItemDropdown onChange={item => { this.handleNewItem(item) }} />
          <NotificationDropdown items={this.props.notificationStore.persistedNotifications} onClose={() => this.handleNotificationsClose()} />
          <UserDropdown user={this.props.userStore.user} onItemClick={item => { this.handleUserItemClick(item) }} />
        </Controls>
        <Modal
          isOpen={this.state.showChooseProviderModal}
          title="New Cloud Endpoint"
          onRequestClose={() => { this.handleCloseChooseProviderModal() }}
        >
          <ChooseProvider
            onCancelClick={() => { this.handleCloseChooseProviderModal() }}
            providers={this.props.providerStore.providers}
            loading={this.props.providerStore.providersLoading}
            onProviderClick={providerName => { this.handleProviderClick(providerName) }}
          />
        </Modal>
        <Modal
          isOpen={this.state.showEndpointModal}
          title="New Cloud Endpoint"
          onRequestClose={() => { this.handleCloseEndpointModal() }}
        >
          <Endpoint
            deleteOnCancel
            type={this.state.providerType}
            cancelButtonText="Back"
            onCancelClick={options => { this.handleBackEndpointModal(options) }}
          />
        </Modal>
      </Wrapper>
    )
  }
}

export default connectToStores(PageHeader)
