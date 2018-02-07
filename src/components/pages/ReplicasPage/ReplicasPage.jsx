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

import { MainTemplate, Navigation, FilterList, PageHeader, AlertModal, MainListItem } from 'components'

import replicaItemImage from './images/replica.svg'
import replicaLargeImage from './images/replica-large.svg'

import ProjectStore from '../../../stores/ProjectStore'
import UserStore from '../../../stores/UserStore'
import ReplicaStore from '../../../stores/ReplicaStore'
import EndpointStore from '../../../stores/EndpointStore'
import ProjectActions from '../../../actions/ProjectActions'
import ReplicaActions from '../../../actions/ReplicaActions'
import EndpointActions from '../../../actions/EndpointActions'
import UserActions from '../../../actions/UserActions'
import Wait from '../../../utils/Wait'
import NotificationActions from '../../../actions/NotificationActions'
import { requestPollTimeout } from '../../../config'

const Wrapper = styled.div``

const BulkActions = [
  { label: 'Execute', value: 'execute' },
  { label: 'Delete', value: 'delete' },
]

class ReplicasPage extends React.Component {
  static propTypes = {
    projectStore: PropTypes.object,
    replicaStore: PropTypes.object,
    userStore: PropTypes.object,
    endpointStore: PropTypes.object,
  }

  static getStores() {
    return [UserStore, ProjectStore, ReplicaStore, EndpointStore]
  }

  static getPropsFromStores() {
    return {
      userStore: UserStore.getState(),
      projectStore: ProjectStore.getState(),
      replicaStore: ReplicaStore.getState(),
      endpointStore: EndpointStore.getState(),
    }
  }

  constructor() {
    super()

    this.state = {
      showDeleteReplicaConfirmation: false,
      confirmationItems: null,
      modalIsOpen: false,
    }
  }

  componentDidMount() {
    document.title = 'Coriolis Replicas'

    ProjectActions.getProjects()
    EndpointActions.getEndpoints()

    this.pollData()
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout)
  }

  getEndpoint(endpointId) {
    if (!this.props.endpointStore.endpoints || this.props.endpointStore.endpoints === 0) {
      return {}
    }

    return this.props.endpointStore.endpoints.find(endpoint => endpoint.id === endpointId) || {}
  }

  getFilterItems() {
    return [
      { label: 'All', value: 'all' },
      { label: 'Running', value: 'RUNNING' },
      { label: 'Error', value: 'ERROR' },
      { label: 'Completed', value: 'COMPLETED' },
    ]
  }

  getLastExecution(item) {
    let lastExecution = item.executions && item.executions.length ?
      item.executions[item.executions.length - 1] : null

    return lastExecution
  }

  handleProjectChange(project) {
    Wait.for(() => this.props.userStore.user.project.id === project.id, () => {
      ProjectActions.getProjects()
      ReplicaActions.getReplicas()
      EndpointActions.getEndpoints()
    })

    UserActions.switchProject(project.id)
  }

  handleReloadButtonClick() {
    ProjectActions.getProjects()
    ReplicaActions.getReplicas({ showLoading: true })
    EndpointActions.getEndpoints()
  }

  handleItemClick(item) {
    let lastExecution = this.getLastExecution(item)
    if (lastExecution && lastExecution.status === 'RUNNING') {
      window.location.href = `/#/replica/executions/${item.id}`
    } else {
      window.location.href = `/#/replica/${item.id}`
    }
  }

  handleActionChange(items, action) {
    if (action === 'execute') {
      items.forEach(replica => {
        ReplicaActions.execute(replica.id)
      })
      NotificationActions.notify('Executing replicas')
    } else if (action === 'delete') {
      this.setState({
        showDeleteReplicaConfirmation: true,
        confirmationItems: items,
      })
    }
  }

  handleCloseDeleteReplicaConfirmation() {
    this.setState({
      showDeleteReplicaConfirmation: false,
      confirmationItems: null,
    })
  }

  handleDeleteReplicaConfirmation() {
    this.state.confirmationItems.forEach(replica => {
      ReplicaActions.delete(replica.id)
    })
    this.handleCloseDeleteReplicaConfirmation()
  }

  handleEmptyListButtonClick() {
    window.location.href = '/#/wizard/replica'
  }

  handleModalOpen() {
    this.setState({ modalIsOpen: true })
  }

  handleModalClose() {
    this.setState({ modalIsOpen: false }, () => {
      this.pollData()
    })
  }

  pollData() {
    if (this.state.modalIsOpen) {
      return
    }
    ReplicaActions.getReplicas().promise.then(() => {
      this.pollTimeout = setTimeout(() => { this.pollData() }, requestPollTimeout)
    })
  }

  searchText(item, text) {
    let result = false
    if (item.instances[0].toLowerCase().indexOf(text) > -1) {
      return true
    }
    if (item.destination_environment) {
      Object.keys(item.destination_environment).forEach(prop => {
        if (item.destination_environment[prop] && item.destination_environment[prop].toLowerCase
          && item.destination_environment[prop].toLowerCase().indexOf(text) > -1) {
          result = true
        }
      })
    }
    return result
  }

  itemFilterFunction(item, filterStatus, filterText) {
    let lastExecution = this.getLastExecution(item)
    if ((filterStatus !== 'all' && (!lastExecution || lastExecution.status !== filterStatus)) ||
      !this.searchText(item, filterText)
    ) {
      return false
    }

    return true
  }

  render() {
    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="replicas" />}
          listComponent={
            <FilterList
              filterItems={this.getFilterItems()}
              selectionLabel="replica"
              loading={this.props.replicaStore.loading}
              items={this.props.replicaStore.replicas}
              onItemClick={item => { this.handleItemClick(item) }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              actions={BulkActions}
              onActionChange={(items, action) => { this.handleActionChange(items, action) }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              renderItemComponent={options =>
                (<MainListItem
                  {...options}
                  image={replicaItemImage}
                  endpointType={id => this.getEndpoint(id).type}
                />)
              }
              emptyListImage={replicaLargeImage}
              emptyListMessage="It seems like you don’t have any Replicas in this project."
              emptyListExtraMessage="The Coriolis Replica is obtained by replicating incrementally the virtual machines data from the source cloud endpoint to the target."
              emptyListButtonLabel="Create a Replica"
              onEmptyListButtonClick={() => { this.handleEmptyListButtonClick() }}
            />
          }
          headerComponent={
            <PageHeader
              title="Coriolis Replicas"
              onProjectChange={project => { this.handleProjectChange(project) }}
              onModalOpen={() => { this.handleModalOpen() }}
              onModalClose={() => { this.handleModalClose() }}
            />
          }
        />
        <AlertModal
          isOpen={this.state.showDeleteReplicaConfirmation}
          title="Delete Replicas?"
          message="Are you sure you want to delete the selected replicas?"
          extraMessage="Deleting a Coriolis Replica is permanent!"
          onConfirmation={() => { this.handleDeleteReplicaConfirmation() }}
          onRequestClose={() => { this.handleCloseDeleteReplicaConfirmation() }}
        />
      </Wrapper>
    )
  }
}

export default connectToStores(ReplicasPage)
