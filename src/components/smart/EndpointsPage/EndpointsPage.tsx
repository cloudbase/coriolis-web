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
import styled from 'styled-components'
import { observer } from 'mobx-react'

import MainTemplate from '../../modules/TemplateModule/MainTemplate/MainTemplate'
import Navigation from '../../modules/NavigationModule/Navigation/Navigation'
import FilterList from '../../ui/Lists/FilterList/FilterList'
import PageHeader from '../../ui/PageHeader/PageHeader'
import EndpointListItem from '../../modules/EndpointModule/EndpointListItem/EndpointListItem'
import AlertModal from '../../ui/AlertModal/AlertModal'
import Modal from '../../ui/Modal/Modal'
import ChooseProvider from '../../modules/EndpointModule/ChooseProvider/ChooseProvider'
import EndpointModal from '../../modules/EndpointModule/EndpointModal/EndpointModal'
import type { Endpoint as EndpointType } from '../../../@types/Endpoint'

import endpointImage from './images/endpoint-large.svg'

import projectStore from '../../../stores/ProjectStore'
import userStore from '../../../stores/UserStore'
import endpointStore from '../../../stores/EndpointStore'
import migrationStore from '../../../stores/MigrationStore'
import replicaStore from '../../../stores/ReplicaStore'
import providerStore from '../../../stores/ProviderStore'
import EndpointDuplicateOptions from '../../modules/EndpointModule/EndpointDuplicateOptions/EndpointDuplicateOptions'

import configLoader from '../../../utils/Config'
import { ThemePalette } from '../../Theme'
import { ProviderTypes } from '../../../@types/Providers'
import regionStore from '../../../stores/RegionStore'

const Wrapper = styled.div<any>``

type State = {
  selectedEndpoints: EndpointType[],
  showChooseProviderModal: boolean,
  showEndpointModal: boolean,
  providerType: ProviderTypes | null,
  showEndpointsInUseModal: boolean,
  modalIsOpen: boolean,
  showDeleteEndpointsModal: boolean,
  showDuplicateModal: boolean,
  duplicating: boolean,
  uploadedEndpoint: EndpointType | null,
  multiValidating: boolean,
}
@observer
class EndpointsPage extends React.Component<{ history: any }, State> {
  state: State = {
    showChooseProviderModal: false,
    showEndpointModal: false,
    providerType: null,
    showEndpointsInUseModal: false,
    modalIsOpen: false,
    showDuplicateModal: false,
    duplicating: false,
    showDeleteEndpointsModal: false,
    selectedEndpoints: [],
    uploadedEndpoint: null,
    multiValidating: false,
  }

  pollTimeout: number = 0

  stopPolling: boolean = false

  componentDidMount() {
    document.title = 'Coriolis Endpoints'

    projectStore.getProjects()

    this.stopPolling = false
    this.pollData(true)
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout)
    this.stopPolling = true
  }

  getFilterItems() {
    const types = [{ label: 'All', value: 'all' }]
    endpointStore.endpoints.forEach(endpoint => {
      if (!types.find(t => t.value === endpoint.type)) {
        types.push({ label: configLoader.config.providerNames[endpoint.type], value: endpoint.type })
      }
    })

    return types
  }

  getEndpointUsage(endpointId: string) {
    const replicasCount = replicaStore.replicas.filter(
      r => r.origin_endpoint_id === endpointId || r.destination_endpoint_id === endpointId,
    ).length
    const migrationsCount = migrationStore.migrations.filter(
      r => r.origin_endpoint_id === endpointId || r.destination_endpoint_id === endpointId,
    ).length

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
    this.props.history.push(`/endpoints/${item.id}`)
  }

  async duplicate(projectId: string) {
    this.setState({ modalIsOpen: false, duplicating: true })

    const shouldSwitchProject = projectId !== (userStore.loggedUser ? userStore.loggedUser.project.id : '')
    const endpoints = endpointStore.endpoints
      .filter(e => this.state.selectedEndpoints.find(se => se.id === e.id))

    await endpointStore.duplicate({
      shouldSwitchProject,
      endpoints,
      onSwitchProject: async () => {
        await userStore.switchProject(projectId)
        this.handleProjectChange()
      },
    })
    this.pollData(true)
    this.setState({ showDuplicateModal: false, duplicating: false })
  }

  deleteSelectedEndpoints() {
    this.state.selectedEndpoints.forEach(endpoint => {
      endpointStore.delete(endpoint)
    })
    this.setState({ showDeleteEndpointsModal: false })
  }

  handleEmptyListButtonClick() {
    providerStore.loadProviders()
    regionStore.getRegions()
    this.setState({ showChooseProviderModal: true })
  }

  handleRemoveEndpoint(endpoint: EndpointType) {
    endpointStore.delete(endpoint)
  }

  async handleValidateMultipleEndpoints(endpoints: EndpointType[]) {
    this.setState({ multiValidating: true })
    const addedEndpoints = await endpointStore.addMultiple(endpoints)
    await endpointStore.validateMultiple(addedEndpoints)
    this.setState({ multiValidating: false })
  }

  handleResetValidation() {
    endpointStore.resetMultiValidation()
  }

  handleCloseChooseProviderModal() {
    this.setState({ showChooseProviderModal: false })
  }

  handleProviderClick(providerType: ProviderTypes) {
    this.setState({
      showChooseProviderModal: false,
      showEndpointModal: true,
      uploadedEndpoint: null,
      providerType,
    })
  }

  handleUploadEndpoint(endpoint: EndpointType) {
    endpointStore.setConnectionInfo(endpoint.connection_info)
    this.setState({
      showChooseProviderModal: false,
      showEndpointModal: true,
      providerType: endpoint.type,
      uploadedEndpoint: endpoint,
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

  handleExportToJson() {
    if (this.state.selectedEndpoints.length === 1) {
      endpointStore.exportToJson(this.state.selectedEndpoints[0])
    } else {
      endpointStore.exportToZip(this.state.selectedEndpoints)
    }
  }

  handleDeleteAction() {
    const endpointsInUse = this.state.selectedEndpoints.filter(endpoint => {
      const endpointUsage = this.getEndpointUsage(endpoint.id)
      return endpointUsage.migrationsCount > 0 || endpointUsage.replicasCount > 0
    })

    if (endpointsInUse.length > 0) {
      this.setState({ showEndpointsInUseModal: true })
    } else {
      this.setState({ showDeleteEndpointsModal: true })
    }
  }

  async pollData(showLoading: boolean = false) {
    if (this.state.modalIsOpen || this.stopPolling) {
      return
    }

    await Promise.all([
      endpointStore.getEndpoints({ showLoading, skipLog: true }),
      migrationStore.getMigrations({ skipLog: true }),
      replicaStore.getReplicas({ skipLog: true }),
    ])
    this.pollTimeout = window.setTimeout(() => { this.pollData() }, configLoader.config.requestPollTimeout)
  }

  itemFilterFunction(item: any, filterItem?: string | null, filterText?: string) {
    const endpoint: EndpointType = item
    const usableFilterText = filterText || ''
    if ((filterItem !== 'all' && (endpoint.type !== filterItem))
      || (endpoint.name.toLowerCase().indexOf(usableFilterText) === -1
      && (!endpoint.description || endpoint.description.toLowerCase()
        .indexOf(usableFilterText) === -1))
    ) {
      return false
    }

    return true
  }

  render() {
    const items: any = endpointStore.endpoints
    const selectedProjectId = userStore.loggedUser ? userStore.loggedUser.project.id : ''
    const BulkActions = [{
      label: 'Duplicate',
      action: () => { this.setState({ showDuplicateModal: true, modalIsOpen: true }) },

    }, {
      label: 'Download .endpoint files',
      action: () => { this.handleExportToJson() },
    }, {
      label: 'Delete Endpoint',
      color: ThemePalette.alert,
      action: () => { this.handleDeleteAction() },
    }]

    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="endpoints" />}
          listComponent={(
            <FilterList
              filterItems={this.getFilterItems()}
              selectionLabel="endpoint"
              loading={endpointStore.loading}
              items={items}
              onItemClick={item => {
                const anyItem: any = item
                const endpoint: EndpointType = anyItem
                this.handleItemClick(endpoint)
              }}
              dropdownActions={BulkActions}
              onSelectedItemsChange={selectedEndpoints => { this.setState({ selectedEndpoints }) }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              renderItemComponent={options => (
                <EndpointListItem
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...options}
                  getUsage={endpoint => this.getEndpointUsage(endpoint.id)}
                />
              )}
              emptyListImage={endpointImage}
              emptyListMessage="You don’t have any Cloud Endpoints in this project."
              emptyListExtraMessage="A Cloud Endpoint is used for the source or target of a Replica/Migration."
              emptyListButtonLabel="Add Endpoint"
              onEmptyListButtonClick={() => { this.handleEmptyListButtonClick() }}
            />
          )}
          headerComponent={(
            <PageHeader
              title="Coriolis Endpoints"
              onProjectChange={() => { this.handleProjectChange() }}
              onModalOpen={() => { this.handleModalOpen() }}
              onModalClose={() => { this.handleModalClose() }}
            />
          )}
        />
        {this.state.showDeleteEndpointsModal ? (
          <AlertModal
            isOpen
            title="Delete Endpoints?"
            message="Are you sure you want to delete the selected endpoints?"
            extraMessage="Deleting a Coriolis Cloud Endpoint is permanent!"
            onConfirmation={() => { this.deleteSelectedEndpoints() }}
            onRequestClose={() => { this.setState({ showDeleteEndpointsModal: false }) }}
          />
        ) : null}
        <Modal
          isOpen={this.state.showChooseProviderModal}
          title="New Cloud Endpoint"
          onRequestClose={() => { this.handleCloseChooseProviderModal() }}
        >
          <ChooseProvider
            onCancelClick={() => { this.handleCloseChooseProviderModal() }}
            regions={regionStore.regions}
            providers={providerStore.providerNames}
            loading={providerStore.providersLoading || regionStore.loading}
            onUploadEndpoint={endpoint => { this.handleUploadEndpoint(endpoint) }}
            onProviderClick={providerName => { this.handleProviderClick(providerName) }}
            multiValidating={this.state.multiValidating}
            onValidateMultipleEndpoints={endpoints => {
              this.handleValidateMultipleEndpoints(endpoints)
            }}
            multiValidation={endpointStore.multiValidation}
            onRemoveEndpoint={e => { this.handleRemoveEndpoint(e) }}
            onResetValidation={() => { this.handleResetValidation() }}
          />
        </Modal>
        <Modal
          isOpen={this.state.showEndpointModal}
          title="New Cloud Endpoint"
          onRequestClose={() => { this.handleCloseEndpointModal() }}
        >
          <EndpointModal
            type={this.state.providerType}
            onCancelClick={() => { this.handleCloseEndpointModal() }}
            endpoint={this.state.uploadedEndpoint}
            isNewEndpoint={Boolean(this.state.uploadedEndpoint)}
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
        {this.state.showDuplicateModal ? (
          <Modal
            isOpen
            title="Duplicate Endpoint"
            onRequestClose={() => { this.setState({ showDuplicateModal: false }) }}
          >
            <EndpointDuplicateOptions
              duplicating={this.state.duplicating}
              projects={projectStore.projects}
              selectedProjectId={selectedProjectId}
              onCancelClick={() => { this.setState({ showDuplicateModal: false }) }}
              onDuplicateClick={projectId => { this.duplicate(projectId) }}
            />
          </Modal>
        ) : null}
      </Wrapper>
    )
  }
}

export default EndpointsPage
