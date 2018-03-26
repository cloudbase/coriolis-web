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

import MainTemplate from '../../templates/MainTemplate'
import Navigation from '../../organisms/Navigation'
import FilterList from '../../organisms/FilterList'
import PageHeader from '../../organisms/PageHeader'
import AlertModal from '../../organisms/AlertModal'
import MainListItem from '../../molecules/MainListItem'
import type { MainItem } from '../../../types/MainItem'

import replicaItemImage from './images/replica.svg'
import replicaLargeImage from './images/replica-large.svg'

import ProjectStore from '../../../stores/ProjectStore'
import ReplicaStore from '../../../stores/ReplicaStore'
import EndpointStore from '../../../stores/EndpointStore'
import NotificationStore from '../../../stores/NotificationStore'
import { requestPollTimeout } from '../../../config'

const Wrapper = styled.div``

const BulkActions = [
  { label: 'Execute', value: 'execute' },
  { label: 'Delete', value: 'delete' },
]

type State = {
  showDeleteReplicaConfirmation: boolean,
  confirmationItems: ?MainItem[],
  modalIsOpen: boolean,
}
@observer
class ReplicasPage extends React.Component<{}, State> {
  pollTimeout: TimeoutID
  stopPolling: boolean

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

    ProjectStore.getProjects()
    EndpointStore.getEndpoints({ showLoading: true })

    this.stopPolling = false
    this.pollData()
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout)
    this.stopPolling = true
  }

  getEndpoint(endpointId: string) {
    return EndpointStore.endpoints.find(endpoint => endpoint.id === endpointId)
  }

  getFilterItems() {
    return [
      { label: 'All', value: 'all' },
      { label: 'Running', value: 'RUNNING' },
      { label: 'Error', value: 'ERROR' },
      { label: 'Completed', value: 'COMPLETED' },
    ]
  }

  getLastExecution(item: MainItem) {
    let lastExecution = item.executions && item.executions.length ?
      item.executions[item.executions.length - 1] : null

    return lastExecution
  }

  handleProjectChange() {
    ReplicaStore.getReplicas()
    EndpointStore.getEndpoints({ showLoading: true })
  }

  handleReloadButtonClick() {
    ProjectStore.getProjects()
    ReplicaStore.getReplicas({ showLoading: true })
    EndpointStore.getEndpoints({ showLoading: true })
  }

  handleItemClick(item: MainItem) {
    let lastExecution = this.getLastExecution(item)
    if (lastExecution && lastExecution.status === 'RUNNING') {
      window.location.href = `/#/replica/executions/${item.id}`
    } else {
      window.location.href = `/#/replica/${item.id}`
    }
  }

  handleActionChange(items: MainItem[], action: string) {
    if (action === 'execute') {
      items.forEach(replica => {
        ReplicaStore.execute(replica.id)
      })
      NotificationStore.notify('Executing replicas')
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
    if (!this.state.confirmationItems) {
      return
    }
    this.state.confirmationItems.forEach(replica => {
      ReplicaStore.delete(replica.id)
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
    if (this.state.modalIsOpen || this.stopPolling) {
      return
    }
    ReplicaStore.getReplicas().then(() => {
      this.pollTimeout = setTimeout(() => { this.pollData() }, requestPollTimeout)
    })
  }

  searchText(item: MainItem, text: ?string) {
    let result = false
    if (item.instances[0].toLowerCase().indexOf(text || '') > -1) {
      return true
    }
    if (item.destination_environment) {
      Object.keys(item.destination_environment).forEach(prop => {
        if (item.destination_environment[prop] && item.destination_environment[prop].toLowerCase
          // $FlowIssue
          && item.destination_environment[prop].toLowerCase().indexOf(text) > -1) {
          result = true
        }
      })
    }
    return result
  }

  itemFilterFunction(item: MainItem, filterStatus?: ?string, filterText?: string) {
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
              loading={ReplicaStore.loading}
              items={ReplicaStore.replicas}
              onItemClick={item => { this.handleItemClick(item) }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              actions={BulkActions}
              onActionChange={(items, action) => { this.handleActionChange(items, action) }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              renderItemComponent={options =>
                (<MainListItem
                  {...options}
                  image={replicaItemImage}
                  endpointType={id => {
                    let endpoint = this.getEndpoint(id)
                    if (endpoint) {
                      return endpoint.type
                    }
                    if (EndpointStore.loading) {
                      return 'Loading...'
                    }
                    return 'Not Found'
                  }}
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
              onProjectChange={() => { this.handleProjectChange() }}
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

export default ReplicasPage
