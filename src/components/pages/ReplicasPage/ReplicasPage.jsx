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
import Modal from '../../molecules/Modal'
import ReplicaExecutionOptions from '../../organisms/ReplicaExecutionOptions'
import ReplicaMigrationOptions from '../../organisms/ReplicaMigrationOptions'

import type { MainItem } from '../../../types/MainItem'
import type { Action as DropdownAction } from '../../molecules/ActionDropdown'
import type { Field } from '../../../types/Field'

import replicaItemImage from './images/replica.svg'
import replicaLargeImage from './images/replica-large.svg'

import projectStore from '../../../stores/ProjectStore'
import replicaStore from '../../../stores/ReplicaStore'
import migrationStore from '../../../stores/MigrationStore'
import scheduleStore from '../../../stores/ScheduleStore'
import endpointStore from '../../../stores/EndpointStore'
import notificationStore from '../../../stores/NotificationStore'

import Palette from '../../styleUtils/Palette'
import configLoader from '../../../utils/Config'

const Wrapper = styled.div``

const SCHEDULE_POLL_TIMEOUT = 10000

type State = {
  modalIsOpen: boolean,
  selectedReplicas: MainItem[],
  showCancelExecutionModal: boolean,
  showExecutionOptionsModal: boolean,
  showCreateMigrationsModal: boolean,
  showDeleteDisksModal: boolean,
  showDeleteReplicasModal: boolean,
}
@observer
class ReplicasPage extends React.Component<{ history: any }, State> {
  state = {
    modalIsOpen: false,
    selectedReplicas: [],
    showCancelExecutionModal: false,
    showCreateMigrationsModal: false,
    showExecutionOptionsModal: false,
    showDeleteDisksModal: false,
    showDeleteReplicasModal: false,
  }

  pollTimeout: TimeoutID
  stopPolling: boolean
  schedulePolling: boolean
  schedulePollTimeout: TimeoutID

  componentDidMount() {
    document.title = 'Coriolis Replicas'

    projectStore.getProjects()
    endpointStore.getEndpoints({ showLoading: true })

    this.stopPolling = false
    this.pollData()
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout)
    clearTimeout(this.schedulePollTimeout)
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
    ]
  }

  getLastExecution(item: MainItem) {
    let lastExecution = item.executions && item.executions.length ?
      item.executions[item.executions.length - 1] : null

    return lastExecution
  }

  handleProjectChange() {
    replicaStore.getReplicas()
    endpointStore.getEndpoints({ showLoading: true })
  }

  handleReloadButtonClick() {
    projectStore.getProjects()
    replicaStore.getReplicas({ showLoading: true })
    endpointStore.getEndpoints({ showLoading: true })
  }

  handleItemClick(item: MainItem) {
    let lastExecution = this.getLastExecution(item)
    if (lastExecution && lastExecution.status === 'RUNNING') {
      this.props.history.push(`/replica/executions/${item.id}`)
    } else {
      this.props.history.push(`/replica/${item.id}`)
    }
  }

  executeSelectedReplicas(fields: Field[]) {
    this.state.selectedReplicas.forEach(replica => {
      let actualReplica = replicaStore.replicas.find(r => r.id === replica.id)
      if (actualReplica && this.isExecuteEnabled(actualReplica)) {
        replicaStore.execute(replica.id, fields)
      }
    })
    notificationStore.alert('Executing selected replicas')
    this.setState({ showExecutionOptionsModal: false })
  }

  migrateSelectedReplicas(fields: Field[]) {
    notificationStore.alert('Creating migrations from selected replicas')
    Promise.all(this.state.selectedReplicas.map(replica => migrationStore.migrateReplica(replica.id, fields))).then(() => {
      notificationStore.alert('Migrations successfully created from replicas.', 'success')
      this.props.history.push('/migrations')
    })
    this.setState({ showCreateMigrationsModal: false })
  }

  deleteSelectedReplicasDisks() {
    this.state.selectedReplicas.forEach(replica => {
      replicaStore.deleteDisks(replica.id)
    })
    this.setState({ showDeleteDisksModal: false })
    notificationStore.alert('Deleting selected replicas\' disks')
  }

  cancelExecutions() {
    this.state.selectedReplicas.forEach(replica => {
      let actualReplica = replicaStore.replicas.find(r => r.id === replica.id)
      let lastExecution = actualReplica && actualReplica.executions[actualReplica.executions.length - 1]
      if (actualReplica && lastExecution && lastExecution.status === 'RUNNING') {
        replicaStore.cancelExecution(replica.id, lastExecution.id)
      }
    })
    this.setState({ showCancelExecutionModal: false })
  }

  getStatus(replica: ?MainItem): string {
    if (!replica) {
      return ''
    }
    let usableReplica = replica
    if (usableReplica.executions && usableReplica.executions.length) {
      return usableReplica.executions[usableReplica.executions.length - 1].status
    }
    return ''
  }

  isExecuteEnabled(replica: ?MainItem): boolean {
    if (!replica) {
      return false
    }
    let usableReplica = replica
    let originEndpoint = endpointStore.endpoints.find(e => e.id === usableReplica.origin_endpoint_id)
    let targetEndpoint = endpointStore.endpoints.find(e => e.id === usableReplica.destination_endpoint_id)
    return Boolean(originEndpoint && targetEndpoint && this.getStatus(usableReplica) !== 'RUNNING')
  }

  deleteSelectedReplicas() {
    this.state.selectedReplicas.forEach(replica => {
      replicaStore.delete(replica.id)
    })
    this.setState({ showDeleteReplicasModal: false })
  }

  handleEmptyListButtonClick() {
    this.props.history.push('/wizard/replica')
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

    Promise.all([replicaStore.getReplicas(), endpointStore.getEndpoints()]).then(() => {
      if (!this.schedulePolling) {
        this.pollSchedule()
      }
      this.pollTimeout = setTimeout(() => { this.pollData() }, configLoader.config.requestPollTimeout)
    })
  }

  pollSchedule() {
    if (this.state.modalIsOpen || this.stopPolling || replicaStore.replicas.length === 0) {
      return
    }
    this.schedulePolling = true
    scheduleStore.getSchedulesBulk(replicaStore.replicas.map(r => r.id)).then(() => {
      this.schedulePollTimeout = setTimeout(() => {
        this.pollSchedule()
      }, SCHEDULE_POLL_TIMEOUT)
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

  isReplicaScheduled(replicaId: string): boolean {
    let bulkScheduleItem = scheduleStore.bulkSchedules.find(b => b.replicaId === replicaId)
    if (!bulkScheduleItem) {
      return false
    }
    return Boolean(bulkScheduleItem.schedules.find(s => s.enabled))
  }

  render() {
    let atLeastOneHasExecuteEnabled = false
    let atLeaseOneIsRunning = false
    this.state.selectedReplicas.forEach(replica => {
      let storeReplica = replicaStore.replicas.find(r => r.id === replica.id)
      atLeastOneHasExecuteEnabled = atLeastOneHasExecuteEnabled || this.isExecuteEnabled(storeReplica)
      atLeaseOneIsRunning = atLeaseOneIsRunning || this.getStatus(storeReplica) === 'RUNNING'
    })

    const BulkActions: DropdownAction[] = [{
      label: 'Execute',
      action: () => { this.setState({ showExecutionOptionsModal: true }) },
      disabled: !atLeastOneHasExecuteEnabled,
    }, {
      label: 'Cancel',
      disabled: !atLeaseOneIsRunning,
      action: () => { this.setState({ showCancelExecutionModal: true }) },
    }, {
      label: 'Create Migrations',
      color: Palette.primary,
      action: () => { this.setState({ showCreateMigrationsModal: true }) },
    }, {
      label: 'Delete Disks',
      action: () => { this.setState({ showDeleteDisksModal: true }) },
    }, {
      label: 'Delete Replicas',
      color: Palette.alert,
      action: () => { this.setState({ showDeleteReplicasModal: true }) },
    }]

    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="replicas" />}
          listComponent={
            <FilterList
              filterItems={this.getFilterItems()}
              selectionLabel="replica"
              loading={replicaStore.loading}
              items={replicaStore.replicas}
              dropdownActions={BulkActions}
              onItemClick={item => { this.handleItemClick(item) }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              onSelectedItemsChange={selectedReplicas => { this.setState({ selectedReplicas }) }}
              renderItemComponent={options =>
                (<MainListItem
                  {...options}
                  image={replicaItemImage}
                  showScheduleIcon={this.isReplicaScheduled(options.item.id)}
                  endpointType={id => {
                    let endpoint = this.getEndpoint(id)
                    if (endpoint) {
                      return endpoint.type
                    }
                    if (endpointStore.loading) {
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
        {this.state.showDeleteReplicasModal ? (
          <AlertModal
            isOpen
            title="Delete Selected Replicas?"
            message="Are you sure you want to delete the selected replicas?"
            extraMessage="Deleting a Coriolis Replica is permanent!"
            onConfirmation={() => { this.deleteSelectedReplicas() }}
            onRequestClose={() => { this.setState({ showDeleteReplicasModal: false }) }}
          />
        ) : null}
        {this.state.showCancelExecutionModal ? (
          <AlertModal
            isOpen
            title="Cancel Executions?"
            message="Are you sure you want to cancel the selected replicas executions?"
            extraMessage=" "
            onConfirmation={() => { this.cancelExecutions() }}
            onRequestClose={() => { this.setState({ showCancelExecutionModal: false }) }}
          />
        ) : null}
        {this.state.showExecutionOptionsModal ? (
          <Modal
            isOpen
            title="New Executions for Selected Replicas"
            onRequestClose={() => { this.setState({ showExecutionOptionsModal: false }) }}
          >
            <ReplicaExecutionOptions
              onCancelClick={() => { this.setState({ showExecutionOptionsModal: false }) }}
              onExecuteClick={fields => { this.executeSelectedReplicas(fields) }}
            />
          </Modal>
        ) : null}
        {this.state.showCreateMigrationsModal ? (
          <Modal
            isOpen
            title="Create Migrations from Selected Replicas"
            onRequestClose={() => { this.setState({ showCreateMigrationsModal: false }) }}
          >
            <ReplicaMigrationOptions
              onCancelClick={() => { this.setState({ showCreateMigrationsModal: false }) }}
              onMigrateClick={options => { this.migrateSelectedReplicas(options) }}
            />
          </Modal>
        ) : null}
        {this.state.showDeleteDisksModal ? (
          <AlertModal
            isOpen
            title="Delete Selected Replicas Disks?"
            message="Are you sure you want to delete the selected replicas' disks?"
            extraMessage="Deleting Coriolis Replica Disks is permanent!"
            onConfirmation={() => { this.deleteSelectedReplicasDisks() }}
            onRequestClose={() => { this.setState({ showDeleteDisksModal: false }) }}
          />
        ) : null}
      </Wrapper>
    )
  }
}

export default ReplicasPage
