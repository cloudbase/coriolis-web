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
import Modal from '../../molecules/Modal'
import ReplicaExecutionOptions from '../../organisms/ReplicaExecutionOptions'
import ReplicaMigrationOptions from '../../organisms/ReplicaMigrationOptions'
import DeleteReplicaModal from '../../molecules/DeleteReplicaModal'

import type { Action as DropdownAction } from '../../molecules/ActionDropdown'
import type { Field } from '../../../@types/Field'
import type { InstanceScript } from '../../../@types/Instance'

import replicaItemImage from './images/replica.svg'
import replicaLargeImage from './images/replica-large.svg'

import projectStore from '../../../stores/ProjectStore'
import replicaStore from '../../../stores/ReplicaStore'
import migrationStore from '../../../stores/MigrationStore'
import scheduleStore from '../../../stores/ScheduleStore'
import instanceStore from '../../../stores/InstanceStore'
import endpointStore from '../../../stores/EndpointStore'
import notificationStore from '../../../stores/NotificationStore'

import Palette from '../../styleUtils/Palette'
import configLoader from '../../../utils/Config'
import { ReplicaItem } from '../../../@types/MainItem'
import userStore from '../../../stores/UserStore'

const Wrapper = styled.div<any>``

const SCHEDULE_POLL_TIMEOUT = 10000

type State = {
  modalIsOpen: boolean,
  selectedReplicas: ReplicaItem[],
  showCancelExecutionModal: boolean,
  showExecutionOptionsModal: boolean,
  showCreateMigrationsModal: boolean,
  showDeleteDisksModal: boolean,
  showDeleteReplicasModal: boolean,
}
@observer
class ReplicasPage extends React.Component<{ history: any }, State> {
  state: State = {
    modalIsOpen: false,
    selectedReplicas: [],
    showCancelExecutionModal: false,
    showCreateMigrationsModal: false,
    showExecutionOptionsModal: false,
    showDeleteDisksModal: false,
    showDeleteReplicasModal: false,
  }

  pollTimeout: number = 0

  stopPolling: boolean = false

  schedulePolling: boolean = false

  schedulePollTimeout: number = 0

  paginatedReplicaIds: string[] = []

  componentDidMount() {
    document.title = 'Coriolis Replicas'

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

  getStatus(replica?: ReplicaItem | null): string {
    return replica?.last_execution_status || ''
  }

  handleProjectChange() {
    replicaStore.getReplicas()
    endpointStore.getEndpoints({ showLoading: true })
  }

  handleReloadButtonClick() {
    projectStore.getProjects()
    replicaStore.getReplicas({ showLoading: true })
    endpointStore.getEndpoints({ showLoading: true })
    userStore.getAllUsers({ showLoading: true, quietError: true })
  }

  handleItemClick(item: ReplicaItem) {
    if (item.last_execution_status === 'RUNNING') {
      this.props.history.push(`/replicas/${item.id}/executions`)
    } else {
      this.props.history.push(`/replicas/${item.id}`)
    }
  }

  handlePaginatedItemsChange(paginatedReplicas: ReplicaItem[]) {
    this.paginatedReplicaIds = paginatedReplicas.map(r => r.id)
  }

  executeSelectedReplicas(fields: Field[]) {
    this.state.selectedReplicas.forEach(replica => {
      const actualReplica = replicaStore.replicas.find(r => r.id === replica.id)
      if (actualReplica && this.isExecuteEnabled(actualReplica)) {
        replicaStore.execute(replica.id, fields)
      }
    })
    notificationStore.alert('Executing selected replicas')
    this.setState({ showExecutionOptionsModal: false })
  }

  migrateSelectedReplicas(fields: Field[], uploadedScripts: InstanceScript[]) {
    notificationStore.alert('Creating migrations from selected replicas')
    this.migrate(fields, uploadedScripts)
    this.setState({ showCreateMigrationsModal: false, modalIsOpen: false })
  }

  async migrate(fields: Field[], uploadedScripts: InstanceScript[]) {
    await Promise.all(this.state.selectedReplicas
      .map(replica => migrationStore.migrateReplica(
        replica.id,
        fields,
        uploadedScripts.filter(s => !s.instanceId
          || replica.instances.find(i => i === s.instanceId)),
        [],
        replica.user_scripts,
        replica.instance_osmorphing_minion_pool_mappings || {},
      )))
    notificationStore.alert('Migrations successfully created from replicas.', 'success')
    this.props.history.push('/migrations')
  }

  handleShowDeleteReplicas() {
    replicaStore.loadHaveReplicasDisks(this.state.selectedReplicas)
    this.setState({ showDeleteReplicasModal: true })
  }

  deleteReplicasDisks(replicas: ReplicaItem[]) {
    replicas.forEach(replica => {
      replicaStore.deleteDisks(replica.id)
    })
    this.setState({ showDeleteDisksModal: false, showDeleteReplicasModal: false })
    notificationStore.alert('Deleting selected replicas\' disks')
  }

  cancelExecutions() {
    this.state.selectedReplicas.forEach(replica => {
      const actualReplica = replicaStore.replicas.find(r => r.id === replica.id)
      if (actualReplica?.last_execution_status === 'RUNNING' || actualReplica?.last_execution_status === 'AWAITING_MINION_ALLOCATIONS') {
        replicaStore.cancelExecution({ replicaId: replica.id })
      }
    })
    this.setState({ showCancelExecutionModal: false })
  }

  isExecuteEnabled(replica?: ReplicaItem | null): boolean {
    if (!replica) {
      return false
    }
    const usableReplica = replica
    const originEndpoint = endpointStore.endpoints
      .find(e => e.id === usableReplica.origin_endpoint_id)
    const targetEndpoint = endpointStore.endpoints
      .find(e => e.id === usableReplica.destination_endpoint_id)
    const status = this.getStatus(usableReplica)
    return Boolean(originEndpoint && targetEndpoint && status !== 'RUNNING' && status !== 'AWAITING_MINION_ALLOCATIONS')
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

  handleShowCreateMigrationsModal() {
    instanceStore.loadInstancesDetailsBulk(replicaStore.replicas.map(r => ({
      endpointId: r.origin_endpoint_id,
      instanceIds: r.instances,
      env: r.source_environment,
    })))

    this.setState({ showCreateMigrationsModal: true, modalIsOpen: true })
  }

  async pollData() {
    if (this.state.modalIsOpen || this.stopPolling) {
      return
    }

    await Promise.all([
      replicaStore.getReplicas({ skipLog: true }),
      endpointStore.getEndpoints({ skipLog: true }),
      userStore.getAllUsers({ skipLog: true, quietError: true }),
    ])
    if (!this.schedulePolling) {
      this.pollSchedule()
    }
    this.pollTimeout = setTimeout(() => { this.pollData() }, configLoader.config.requestPollTimeout)
  }

  async pollSchedule() {
    if (this.state.modalIsOpen || this.stopPolling || replicaStore.replicas.length === 0) {
      return
    }
    this.schedulePolling = true
    await scheduleStore.getSchedulesBulk(this.paginatedReplicaIds)
    this.schedulePollTimeout = setTimeout(() => {
      this.pollSchedule()
    }, SCHEDULE_POLL_TIMEOUT)
  }

  searchText(item: ReplicaItem, text?: string | null) {
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

  itemFilterFunction(item: ReplicaItem, filterStatus?: string | null, filterText?: string) {
    if ((filterStatus !== 'all' && item.last_execution_status !== filterStatus)
      || !this.searchText(item, filterText)
    ) {
      return false
    }

    return true
  }

  isReplicaScheduled(replicaId: string): boolean {
    const bulkScheduleItem = scheduleStore.bulkSchedules.find(b => b.replicaId === replicaId)
    if (!bulkScheduleItem) {
      return false
    }
    return Boolean(bulkScheduleItem.schedules.find(s => s.enabled))
  }

  render() {
    let atLeastOneHasExecuteEnabled = false
    let atLeaseOneIsRunning = false
    this.state.selectedReplicas.forEach(replica => {
      const storeReplica = replicaStore.replicas.find(r => r.id === replica.id)
      atLeastOneHasExecuteEnabled = atLeastOneHasExecuteEnabled
        || this.isExecuteEnabled(storeReplica)
      const status = this.getStatus(storeReplica)
      atLeaseOneIsRunning = atLeaseOneIsRunning || status === 'RUNNING' || status === 'AWAITING_MINION_ALLOCATIONS'
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
      action: () => { this.handleShowCreateMigrationsModal() },
    }, {
      label: 'Delete Disks',
      action: () => { this.setState({ showDeleteDisksModal: true }) },
    }, {
      label: 'Delete Replicas',
      color: Palette.alert,
      action: () => { this.handleShowDeleteReplicas() },
    }]

    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="replicas" />}
          listComponent={(
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
              onPaginatedItemsChange={paginatedReplicas => { this.handlePaginatedItemsChange(paginatedReplicas) }}
              renderItemComponent={options => (
                <MainListItem
                  {...options}
                  image={replicaItemImage}
                  showScheduleIcon={this.isReplicaScheduled(options.item.id)}
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
              emptyListImage={replicaLargeImage}
              emptyListMessage="It seems like you don’t have any Replicas in this project."
              emptyListExtraMessage="The Coriolis Replica is obtained by replicating incrementally the virtual machines data from the source cloud endpoint to the target."
              emptyListButtonLabel="Create a Replica"
              onEmptyListButtonClick={() => { this.handleEmptyListButtonClick() }}
            />
          )}
          headerComponent={(
            <PageHeader
              title="Coriolis Replicas"
              onProjectChange={() => { this.handleProjectChange() }}
              onModalOpen={() => { this.handleModalOpen() }}
              onModalClose={() => { this.handleModalClose() }}
            />
          )}
        />
        {this.state.showDeleteReplicasModal ? (
          <DeleteReplicaModal
            isMultiReplicaSelection
            hasDisks={replicaStore.replicasWithDisks.length > 0}
            loading={replicaStore.replicasWithDisksLoading}
            onRequestClose={() => { this.setState({ showDeleteReplicasModal: false }) }}
            onDeleteReplica={() => { this.deleteSelectedReplicas() }}
            onDeleteDisks={() => {
              this.deleteReplicasDisks(replicaStore.replicasWithDisks)
            }}
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
            onRequestClose={() => {
              this.setState({ showCreateMigrationsModal: false, modalIsOpen: false })
            }}
          >
            <ReplicaMigrationOptions
              transferItem={null}
              minionPools={[]}
              instances={instanceStore.instancesDetails}
              loadingInstances={instanceStore.loadingInstancesDetails}
              onCancelClick={() => {
                this.setState({ showCreateMigrationsModal: false, modalIsOpen: false })
              }}
              onMigrateClick={(options, s) => { this.migrateSelectedReplicas(options, s) }}
            />
          </Modal>
        ) : null}
        {this.state.showDeleteDisksModal ? (
          <AlertModal
            isOpen
            title="Delete Selected Replicas Disks?"
            message="Are you sure you want to delete the selected replicas' disks?"
            extraMessage="Deleting Coriolis Replica Disks is permanent!"
            onConfirmation={() => { this.deleteReplicasDisks(this.state.selectedReplicas) }}
            onRequestClose={() => { this.setState({ showDeleteDisksModal: false }) }}
          />
        ) : null}
      </Wrapper>
    )
  }
}

export default ReplicasPage
