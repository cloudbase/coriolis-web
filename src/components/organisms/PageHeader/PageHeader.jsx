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
import PropTypes from 'prop-types'
import styled from 'styled-components'
import connectToStores from 'alt-utils/lib/connectToStores'

import {
  Dropdown,
  NewItemDropdown,
  NotificationDropdown,
  UserDropdown,
  Modal,
  ChooseProvider,
  Endpoint,
} from 'components'

import ProjectStore from '../../../stores/ProjectStore'
import UserStore from '../../../stores/UserStore'
import UserActions from '../../../actions/UserActions'
import ProviderActions from '../../../actions/ProviderActions'
import ProviderStore from '../../../stores/ProviderStore'
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

class PageHeader extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    onProjectChange: PropTypes.func,
    projectStore: PropTypes.object,
    userStore: PropTypes.object,
    providerStore: PropTypes.object,
  }

  static getStores() {
    return [UserStore, ProjectStore, ProviderStore]
  }

  static getPropsFromStores() {
    return {
      userStore: UserStore.getState(),
      projectStore: ProjectStore.getState(),
      providerStore: ProviderStore.getState(),
    }
  }

  constructor() {
    super()

    this.state = {
      showChooseProviderModal: false,
      showEndpointModal: false,
    }
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

  handleNewItem(item) {
    switch (item.value) {
      case 'migration':
        window.location.href = '/#/wizard/migration'
        break
      case 'replica':
        window.location.href = '/#/wizard/replica'
        break
      case 'endpoint':
        ProviderActions.loadProviders()
        this.setState({ showChooseProviderModal: true })
        break
      default:
    }
  }

  handleCloseChooseProviderModal() {
    this.setState({ showChooseProviderModal: false })
  }

  handleProviderClick(providerType) {
    this.setState({
      showChooseProviderModal: false,
      showEndpointModal: true,
      providerType,
    })
  }

  handleCloseEndpointModal() {
    this.setState({ showEndpointModal: false })
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
          <NotificationDropdown />
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
            onCancelClick={() => { this.handleCloseEndpointModal() }}
          />
        </Modal>
      </Wrapper>
    )
  }
}

export default connectToStores(PageHeader)
