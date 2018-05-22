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
import EndpointListItem from '../../molecules/EndpointListItem'
import AlertModal from '../../organisms/AlertModal'
import Modal from '../../molecules/Modal'
import ChooseProvider from '../../organisms/ChooseProvider'
import Endpoint from '../../organisms/Endpoint'
import type { Endpoint as EndpointType } from '../../../types/Endpoint'

import endpointImage from './images/endpoint-large.svg'

import projectStore from '../../../stores/ProjectStore'
import endpointStore from '../../../stores/EndpointStore'
import migrationStore from '../../../stores/MigrationStore'
import replicaStore from '../../../stores/ReplicaStore'
import providerStore from '../../../stores/ProviderStore'
import LabelDictionary from '../../../utils/LabelDictionary'
import { requestPollTimeout } from '../../../config.js'

const Wrapper = styled.div``

const BulkActions = [
  { label: 'Delete', value: 'delete' },
]

type State = {
  showDeleteEndpointsConfirmation: boolean,
  confirmationItems: ?EndpointType[],
  showChooseProviderModal: boolean,
  showEndpointModal: boolean,
  providerType: ?string,
  showEndpointsInUseModal: boolean,
  modalIsOpen: boolean,
}
@observer
class EndpointsPage extends React.Component<{}, State> {
  pollTimeout: TimeoutID
  stopPolling: boolean

  constructor() {
    super()

    this.state = {
      showDeleteEndpointsConfirmation: false,
      confirmationItems: null,
      showChooseProviderModal: false,
      showEndpointModal: false,
      providerType: null,
      showEndpointsInUseModal: false,
      modalIsOpen: false,
    }
  }

  componentDidMount() {
    document.title = 'Coriolis Endpoints'

    projectStore.getProjects()

    this.stopPolling = false
    this.pollData()
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout)
    this.stopPolling = true
  }

  getFilterItems() {
    let types = [{ label: 'All', value: 'all' }]
    endpointStore.endpoints.forEach(endpoint => {
      if (!types.find(t => t.value === endpoint.type)) {
        types.push({ label: LabelDictionary.get(endpoint.type), value: endpoint.type })
      }
    })

    return types
  }

  getEndpointUsage(endpoint: EndpointType) {
    let replicasCount = replicaStore.replicas.filter(
      r => r.origin_endpoint_id === endpoint.id || r.destination_endpoint_id === endpoint.id).length
    let migrationsCount = migrationStore.migrations.filter(
      r => r.origin_endpoint_id === endpoint.id || r.destination_endpoint_id === endpoint.id).length

    return { migrationsCount, replicasCount }
  }

  handleProjectChange() {
    endpointStore.getEndpoints({ showLoading: true })
    migrationStore.getMigrations()
    replicaStore.getReplicas()
  }

  handleReloadButtonClick() {
    projectStore.getProjects()
    endpointStore.getEndpoints({ showLoading: true })
    migrationStore.getMigrations()
    replicaStore.getReplicas()
  }

  handleItemClick(item: EndpointType) {
    window.location.href = `/#/endpoint/${item.id}`
  }

  handleActionChange(items: EndpointType[], action: string) {
    if (action === 'delete') {
      let endpointsInUse = items.filter(endpoint => {
        const endpointUsage = this.getEndpointUsage(endpoint)
        return endpointUsage.migrationsCount > 0 || endpointUsage.replicasCount > 0
      })

      if (endpointsInUse.length > 0) {
        this.setState({ showEndpointsInUseModal: true })
      } else {
        this.setState({
          showDeleteEndpointsConfirmation: true,
          confirmationItems: items,
        })
      }
    }
  }

  handleCloseDeleteEndpointsConfirmation() {
    this.setState({
      showDeleteEndpointsConfirmation: false,
      confirmationItems: null,
    })
  }

  handleDeleteEndpointsConfirmation() {
    if (this.state.confirmationItems) {
      this.state.confirmationItems.forEach(endpoint => {
        endpointStore.delete(endpoint)
      })
    }
    this.handleCloseDeleteEndpointsConfirmation()
  }

  handleEmptyListButtonClick() {
    providerStore.loadProviders()
    this.setState({ showChooseProviderModal: true })
  }

  handleCloseChooseProviderModal() {
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
    this.setState({ showEndpointModal: false })
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

    Promise.all([endpointStore.getEndpoints(), migrationStore.getMigrations(), replicaStore.getReplicas()]).then(() => {
      this.pollTimeout = setTimeout(() => { this.pollData() }, requestPollTimeout)
    })
  }

  itemFilterFunction(item: any, filterItem?: ?string, filterText?: string) {
    let endpoint: EndpointType = item
    if ((filterItem !== 'all' && (endpoint.type !== filterItem)) ||
      (endpoint.name.toLowerCase().indexOf(filterText || '') === -1 &&
        // $FlowIssue
        endpoint.description.toLowerCase().indexOf(filterText) === -1)
    ) {
      return false
    }

    return true
  }

  render() {
    let items: any = endpointStore.endpoints
    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="endpoints" />}
          listComponent={
            <FilterList
              filterItems={this.getFilterItems()}
              selectionLabel="endpoint"
              loading={endpointStore.loading}
              items={items}
              onItemClick={item => {
                let anyItem: any = item
                let endpoint: EndpointType = anyItem
                this.handleItemClick(endpoint)
              }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              actions={BulkActions}
              onActionChange={(items, action) => {
                let anyItems: any = items
                let endpoints: EndpointType[] = anyItems
                this.handleActionChange(endpoints, action)
              }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              renderItemComponent={options =>
                // $FlowIssue
                (<EndpointListItem
                  {...options}
                  getUsage={endpoint => this.getEndpointUsage(endpoint)}
                />)
              }
              emptyListImage={endpointImage}
              emptyListMessage="You don’t have any Cloud Endpoints in this project."
              emptyListExtraMessage="A Cloud Endpoint is used for the source or target of a Replica/Migration."
              emptyListButtonLabel="Add Endpoint"
              onEmptyListButtonClick={() => { this.handleEmptyListButtonClick() }}
            />
          }
          headerComponent={
            <PageHeader
              title="Coriolis Endpoints"
              onProjectChange={() => { this.handleProjectChange() }}
              onModalOpen={() => { this.handleModalOpen() }}
              onModalClose={() => { this.handleModalClose() }}
            />
          }
        />
        <AlertModal
          isOpen={this.state.showDeleteEndpointsConfirmation}
          title="Delete Endpoints?"
          message="Are you sure you want to delete the selected endpoints?"
          extraMessage="Deleting a Coriolis Cloud Endpoint is permanent!"
          onConfirmation={() => { this.handleDeleteEndpointsConfirmation() }}
          onRequestClose={() => { this.handleCloseDeleteEndpointsConfirmation() }}
        />
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
            deleteOnCancel
            type={this.state.providerType}
            onCancelClick={() => { this.handleCloseEndpointModal() }}
          />
        </Modal>
        <AlertModal
          type="error"
          isOpen={this.state.showEndpointsInUseModal}
          title="Endpoints are in use"
          message="Some of the selected endpoints can't be deleted because they are in use by replicas or migrations."
          extraMessage="You must first delete the replicas or migrations which use these endpoints."
          onRequestClose={() => { this.setState({ showEndpointsInUseModal: false }) }}
        />
      </Wrapper>
    )
  }
}

export default EndpointsPage
