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

import MainTemplate from '../../templates/MainTemplate'
import Navigation from '../../organisms/Navigation'
import FilterList from '../../organisms/FilterList'
import PageHeader from '../../organisms/PageHeader'
import AlertModal from '../../organisms/AlertModal'
import MainListItem from '../../molecules/MainListItem'

import migrationItemImage from './images/migration.svg'
import migrationLargeImage from './images/migration-large.svg'

import projectStore from '../../../stores/ProjectStore'
import migrationStore from '../../../stores/MigrationStore'
import endpointStore from '../../../stores/EndpointStore'
import notificationStore from '../../../stores/NotificationStore'
import configLoader from '../../../utils/Config'

import Palette from '../../styleUtils/Palette'
import replicaMigrationFields from '../../organisms/ReplicaMigrationOptions/replicaMigrationFields'
import { MigrationItem } from '../../../@types/MainItem'
import userStore from '../../../stores/UserStore'

const Wrapper = styled.div<any>``

type State = {
  selectedMigrations: MigrationItem[],
  modalIsOpen: boolean,
  showDeleteMigrationModal: boolean,
  showCancelMigrationModal: boolean,
  showRecreateMigrationsModal: boolean,
}
@observer
class MigrationsPage extends React.Component<{ history: any }, State> {
  state: State = {
    showDeleteMigrationModal: false,
    showCancelMigrationModal: false,
    showRecreateMigrationsModal: false,
    selectedMigrations: [],
    modalIsOpen: false,
  }

  pollTimeout: number = 0

  stopPolling: boolean = false

  componentDidMount() {
    document.title = 'Coriolis Migrations'

    projectStore.getProjects()
    endpointStore.getEndpoints({ showLoading: true })
    userStore.getAllUsers({
      showLoading: userStore.users.length === 0,
      quietError: true,
    })

    this.stopPolling = false
    this.pollData()
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout)
    this.stopPolling = true
  }

  getEndpoint(endpointId: string) {
    return endpointStore.endpoints.find(endpoint => endpoint.id === endpointId)
  }

  getFilterItems() {
    return [
      { label: 'All', value: 'all' },
      { label: 'Running', value: 'RUNNING' },
      { label: 'Error', value: 'ERROR' },
      { label: 'Completed', value: 'COMPLETED' },
      { label: 'Canceled', value: 'CANCELED' },
    ]
  }

  getStatus(migrationId: string): string {
    const migration = migrationStore.migrations.find(m => m.id === migrationId)
    return migration ? migration.last_execution_status : ''
  }

  handleProjectChange() {
    endpointStore.getEndpoints({ showLoading: true })
    migrationStore.getMigrations({ showLoading: true })
  }

  handleReloadButtonClick() {
    projectStore.getProjects()
    endpointStore.getEndpoints({ showLoading: true })
    migrationStore.getMigrations({ showLoading: true })
    userStore.getAllUsers({ showLoading: true, quietError: true })
  }

  handleItemClick(item: MigrationItem) {
    if (item.last_execution_status === 'RUNNING') {
      this.props.history.push(`/migrations/${item.id}/tasks`)
    } else {
      this.props.history.push(`/migrations/${item.id}`)
    }
  }

  deleteSelectedMigrations() {
    this.state.selectedMigrations.forEach(migration => {
      migrationStore.delete(migration.id)
    })
    this.setState({ showDeleteMigrationModal: false })
  }

  cancelSelectedMigrations() {
    this.state.selectedMigrations.forEach(migration => {
      const status = this.getStatus(migration.id)
      if (status === 'RUNNING' || status === 'AWAITING_MINION_ALLOCATIONS') {
        migrationStore.cancel(migration.id)
      }
    })
    notificationStore.alert('Canceling migrations')
    this.setState({ showCancelMigrationModal: false })
  }

  async recreateMigrations() {
    notificationStore.alert('Recreating migrations')
    this.setState({ showRecreateMigrationsModal: false })

    await Promise.all(this.state.selectedMigrations.map(async migration => {
      if (migration.replica_id) {
        await migrationStore.migrateReplica(
          migration.replica_id,
          replicaMigrationFields,
          [],
          [],
          migration.user_scripts,
          migration.instance_osmorphing_minion_pool_mappings || {},
        )
      } else {
        await migrationStore.recreateFullCopy(migration as any)
      }
    }))

    migrationStore.getMigrations()
  }

  handleEmptyListButtonClick() {
    this.props.history.push('/wizard/migration')
  }

  handleModalOpen() {
    this.setState({ modalIsOpen: true })
  }

  handleModalClose() {
    this.setState({ modalIsOpen: false }, () => {
      this.pollData()
    })
  }

  searchText(item: MigrationItem, text?: string) {
    let result = false
    if (item.instances[0].toLowerCase().indexOf(text || '') > -1) {
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

  itemFilterFunction(item: MigrationItem, filterStatus?: string | null, filterText?: string) {
    if ((filterStatus !== 'all' && (item.last_execution_status !== filterStatus))
      || !this.searchText(item, filterText)
    ) {
      return false
    }

    return true
  }

  async pollData() {
    if (this.state.modalIsOpen || this.stopPolling) {
      return
    }

    await Promise.all([
      migrationStore.getMigrations({ skipLog: true }),
      endpointStore.getEndpoints({ skipLog: true }),
      userStore.getAllUsers({ skipLog: true, quietError: true }),
    ])
    this.pollTimeout = setTimeout(() => { this.pollData() }, configLoader.config.requestPollTimeout)
  }

  render() {
    let atLeaseOneIsRunning = false
    this.state.selectedMigrations.forEach(migration => {
      const status = this.getStatus(migration.id)
      atLeaseOneIsRunning = atLeaseOneIsRunning || status === 'RUNNING' || status === 'AWAITING_MINION_ALLOCATIONS'
    })
    const BulkActions = [
      {
        label: 'Cancel',
        disabled: !atLeaseOneIsRunning,
        action: () => { this.setState({ showCancelMigrationModal: true }) },
      },
      {
        label: 'Recreate Migrations',
        disabled: atLeaseOneIsRunning,
        color: Palette.primary,
        action: () => { this.setState({ showRecreateMigrationsModal: true }) },
      },
      {
        label: 'Delete Migrations',
        color: Palette.alert,
        action: () => { this.setState({ showDeleteMigrationModal: true }) },
      },
    ]

    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="migrations" />}
          listComponent={(
            <FilterList
              filterItems={this.getFilterItems()}
              selectionLabel="migration"
              loading={migrationStore.loading}
              items={migrationStore.migrations}
              onItemClick={item => { this.handleItemClick(item) }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              onSelectedItemsChange={selectedMigrations => {
                this.setState({ selectedMigrations })
              }}
              dropdownActions={BulkActions}
              renderItemComponent={options => (
                <MainListItem
                  {...options}
                  image={migrationItemImage}
                  endpointType={id => {
                    const endpoint = this.getEndpoint(id)
                    if (endpoint) {
                      return endpoint.type
                    }
                    if (endpointStore.loading) {
                      return 'Loading...'
                    }
                    return 'Not Found'
                  }}
                  getUserName={id => userStore.users.find(u => u.id === id)?.name}
                  userNameLoading={userStore.allUsersLoading}
                />
              )}
              emptyListImage={migrationLargeImage}
              emptyListMessage="It seems like you don’t have any Migrations in this project."
              emptyListExtraMessage="A Coriolis Migration is a full virtual machine migration between two cloud endpoints."
              emptyListButtonLabel="Create a Migration"
              onEmptyListButtonClick={() => { this.handleEmptyListButtonClick() }}
            />
          )}
          headerComponent={(
            <PageHeader
              title="Coriolis Migrations"
              onProjectChange={() => { this.handleProjectChange() }}
              onModalOpen={() => { this.handleModalOpen() }}
              onModalClose={() => { this.handleModalClose() }}
            />
          )}
        />
        {this.state.showDeleteMigrationModal ? (
          <AlertModal
            isOpen
            title="Delete Selected Migrations?"
            message="Are you sure you want to delete the selected migrations?"
            extraMessage="Deleting a Coriolis Migration is permanent!"
            onConfirmation={() => { this.deleteSelectedMigrations() }}
            onRequestClose={() => { this.setState({ showDeleteMigrationModal: false }) }}
          />
        ) : null}
        {this.state.showCancelMigrationModal ? (
          <AlertModal
            isOpen
            title="Cancel Selected Migrations?"
            message="Are you sure you want to cancel the selected migrations?"
            extraMessage="Canceling a Coriolis Migration is permanent!"
            onConfirmation={() => { this.cancelSelectedMigrations() }}
            onRequestClose={() => { this.setState({ showCancelMigrationModal: false }) }}
          />
        ) : null}
        {this.state.showRecreateMigrationsModal ? (
          <AlertModal
            isOpen
            title="Recreate Selected Migrations?"
            message="Are you sure you want to recreate the selected migrations?"
            extraMessage="Migrations created from replicas will be recreated using default options and regular migrations will be recreated using their original source and destination environment options."
            onConfirmation={() => { this.recreateMigrations() }}
            onRequestClose={() => { this.setState({ showRecreateMigrationsModal: false }) }}
          />
        ) : null}
      </Wrapper>
    )
  }
}

export default MigrationsPage
