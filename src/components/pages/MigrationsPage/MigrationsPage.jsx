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

import migrationItemImage from './images/migration.svg'
import migrationLargeImage from './images/migration-large.svg'

import ProjectStore from '../../../stores/ProjectStore'
import UserStore from '../../../stores/UserStore'
import MigrationStore from '../../../stores/MigrationStore'
import EndpointStore from '../../../stores/EndpointStore'
import ProjectActions from '../../../actions/ProjectActions'
import MigrationActions from '../../../actions/MigrationActions'
import EndpointActions from '../../../actions/EndpointActions'
import UserActions from '../../../actions/UserActions'
import Wait from '../../../utils/Wait'
import NotificationActions from '../../../actions/NotificationActions'

const Wrapper = styled.div``

const BulkActions = [
  { label: 'Cancel', value: 'cancel' },
  { label: 'Delete', value: 'delete' },
]

class MigrationsPage extends React.Component {
  static propTypes = {
    projectStore: PropTypes.object,
    migrationStore: PropTypes.object,
    userStore: PropTypes.object,
    endpointStore: PropTypes.object,
  }

  static getStores() {
    return [UserStore, ProjectStore, MigrationStore, EndpointStore]
  }

  static getPropsFromStores() {
    return {
      userStore: UserStore.getState(),
      projectStore: ProjectStore.getState(),
      migrationStore: MigrationStore.getState(),
      endpointStore: EndpointStore.getState(),
    }
  }

  constructor() {
    super()

    this.state = {
      showDeleteMigrationConfirmation: false,
      showCancelMigrationConfirmation: false,
      confirmationItems: null,
    }
  }

  componentDidMount() {
    document.title = 'Coriolis Migrations'

    ProjectActions.getProjects()
    EndpointActions.getEndpoints()
    MigrationActions.getMigrations()
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

  handleProjectChange(project) {
    Wait.for(() => this.props.userStore.user.project.id === project.id, () => {
      ProjectActions.getProjects()
      EndpointActions.getEndpoints()
      MigrationActions.getMigrations({ showLoading: true })
    })

    UserActions.switchProject(project.id)
  }

  handleReloadButtonClick() {
    ProjectActions.getProjects()
    EndpointActions.getEndpoints()
    MigrationActions.getMigrations({ showLoading: true })
  }

  handleItemClick(item) {
    if (item.status === 'RUNNING') {
      window.location.href = `/#/migration/tasks/${item.id}`
    } else {
      window.location.href = `/#/migration/${item.id}`
    }
  }

  handleActionChange(confirmationItems, action) {
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
    this.state.confirmationItems.forEach(migration => {
      MigrationActions.cancel(migration.id)
    })
    NotificationActions.notify('Canceling migrations')
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
    this.state.confirmationItems.forEach(migration => {
      MigrationActions.delete(migration.id)
    })
    this.handleCloseDeleteMigrationConfirmation()
  }

  handleEmptyListButtonClick() {
    window.location.href = '/#/wizard/migration'
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
    if ((filterStatus !== 'all' && (item.status !== filterStatus)) ||
      !this.searchText(item, filterText)
    ) {
      return false
    }

    return true
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
              loading={this.props.migrationStore.loading}
              items={this.props.migrationStore.migrations}
              onItemClick={item => { this.handleItemClick(item) }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              actions={BulkActions}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              onActionChange={(items, action) => { this.handleActionChange(items, action) }}
              renderItemComponent={options =>
                (<MainListItem
                  {...options}
                  image={migrationItemImage}
                  endpointType={id => this.getEndpoint(id).type}
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
              onProjectChange={project => { this.handleProjectChange(project) }}
            />
          }
        />
        {renderAlert()}
      </Wrapper>
    )
  }
}

export default connectToStores(MigrationsPage)
