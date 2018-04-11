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

import migrationItemImage from './images/migration.svg'
import migrationLargeImage from './images/migration-large.svg'

import ProjectStore from '../../../stores/ProjectStore'
import MigrationStore from '../../../stores/MigrationStore'
import EndpointStore from '../../../stores/EndpointStore'
import NotificationStore from '../../../stores/NotificationStore'
import { requestPollTimeout } from '../../../config'

const Wrapper = styled.div``

const BulkActions = [
  { label: 'Cancel', value: 'cancel' },
  { label: 'Delete', value: 'delete' },
]

type State = {
  showDeleteMigrationConfirmation: boolean,
  showCancelMigrationConfirmation: boolean,
  confirmationItems: ?MainItem[],
  modalIsOpen: boolean,
}
@observer
class MigrationsPage extends React.Component<{}, State> {
  pollTimeout: TimeoutID
  stopPolling: boolean

  constructor() {
    super()

    this.state = {
      showDeleteMigrationConfirmation: false,
      showCancelMigrationConfirmation: false,
      confirmationItems: null,
      modalIsOpen: false,
    }
  }

  componentDidMount() {
    document.title = 'Coriolis Migrations'

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

  handleProjectChange() {
    EndpointStore.getEndpoints({ showLoading: true })
    MigrationStore.getMigrations({ showLoading: true })
  }

  handleReloadButtonClick() {
    ProjectStore.getProjects()
    EndpointStore.getEndpoints({ showLoading: true })
    MigrationStore.getMigrations({ showLoading: true })
  }

  handleItemClick(item: MainItem) {
    if (item.status === 'RUNNING') {
      window.location.href = `/#/migration/tasks/${item.id}`
    } else {
      window.location.href = `/#/migration/${item.id}`
    }
  }

  handleActionChange(confirmationItems: MainItem[], action: string) {
    if (action === 'cancel') {
      this.setState({
        showCancelMigrationConfirmation: true,
        confirmationItems,
      })
    } else if (action === 'delete') {
      this.setState({
        showDeleteMigrationConfirmation: true,
        confirmationItems,
      })
    }
  }

  handleCancelMigrationConfirmation() {
    if (!this.state.confirmationItems) {
      return
    }
    this.state.confirmationItems.forEach(migration => {
      MigrationStore.cancel(migration.id)
    })
    NotificationStore.notify('Canceling migrations')
    this.handleCloseCancelMigration()
  }

  handleCloseCancelMigration() {
    this.setState({
      showCancelMigrationConfirmation: false,
      confirmationItems: null,
    })
  }

  handleCloseDeleteMigrationConfirmation() {
    this.setState({
      showDeleteMigrationConfirmation: false,
      confirmationItems: null,
    })
  }

  handleDeleteMigrationConfirmation() {
    if (!this.state.confirmationItems) {
      return
    }
    this.state.confirmationItems.forEach(migration => {
      MigrationStore.delete(migration.id)
    })
    this.handleCloseDeleteMigrationConfirmation()
  }

  handleEmptyListButtonClick() {
    window.location.href = '/#/wizard/migration'
  }

  handleModalOpen() {
    this.setState({ modalIsOpen: true })
  }

  handleModalClose() {
    this.setState({ modalIsOpen: false }, () => {
      this.pollData()
    })
  }

  searchText(item: MainItem, text?: string) {
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
    if ((filterStatus !== 'all' && (item.status !== filterStatus)) ||
      !this.searchText(item, filterText)
    ) {
      return false
    }

    return true
  }

  pollData() {
    if (this.state.modalIsOpen || this.stopPolling) {
      return
    }

    Promise.all([MigrationStore.getMigrations(), EndpointStore.getEndpoints()]).then(() => {
      this.pollTimeout = setTimeout(() => { this.pollData() }, requestPollTimeout)
    })
  }

  render() {
    const renderAlert = () => {
      const isDelete = this.state.showDeleteMigrationConfirmation
      const props = {
        isOpen: this.state.showCancelMigrationConfirmation || this.state.showDeleteMigrationConfirmation,
        title: `${isDelete ? 'Delete' : 'Cancel'} Migrations?`,
        message: `Are you sure you want to ${isDelete ? 'delete' : 'cancel'} the selected migrations?`,
        extraMessage: `${isDelete ? 'Deleting' : 'Canceling'} a Coriolis Migration is permanent!`,
        onConfirmation: () => { isDelete ? this.handleDeleteMigrationConfirmation() : this.handleCancelMigrationConfirmation() },
        onRequestClose: () => { isDelete ? this.handleCloseDeleteMigrationConfirmation() : this.handleCloseCancelMigration() },
      }

      return <AlertModal {...props} />
    }

    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="migrations" />}
          listComponent={
            <FilterList
              filterItems={this.getFilterItems()}
              selectionLabel="migration"
              loading={MigrationStore.loading}
              items={MigrationStore.migrations}
              onItemClick={item => { this.handleItemClick(item) }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              actions={BulkActions}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              onActionChange={(items, action) => { this.handleActionChange(items, action) }}
              renderItemComponent={options =>
                (<MainListItem
                  {...options}
                  image={migrationItemImage}
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
                  useTasksRemaining
                />)
              }
              emptyListImage={migrationLargeImage}
              emptyListMessage="It seems like you don’t have any Migrations in this project."
              emptyListExtraMessage="A Coriolis Migration is a full virtual machine migration between two cloud endpoints."
              emptyListButtonLabel="Create a Migration"
              onEmptyListButtonClick={() => { this.handleEmptyListButtonClick() }}
            />
          }
          headerComponent={
            <PageHeader
              title="Coriolis Migrations"
              onProjectChange={() => { this.handleProjectChange() }}
              onModalOpen={() => { this.handleModalOpen() }}
              onModalClose={() => { this.handleModalClose() }}
            />
          }
        />
        {renderAlert()}
      </Wrapper>
    )
  }
}

export default MigrationsPage
