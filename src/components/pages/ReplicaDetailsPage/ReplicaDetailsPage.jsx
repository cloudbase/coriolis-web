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

import DetailsTemplate from '../../templates/DetailsTemplate'
import DetailsPageHeader from '../../organisms/DetailsPageHeader'
import DetailsContentHeader from '../../organisms/DetailsContentHeader'
import ReplicaDetailsContent from '../../organisms/ReplicaDetailsContent'
import Modal from '../../molecules/Modal'
import ReplicaExecutionOptions from '../../organisms/ReplicaExecutionOptions'
import AlertModal from '../../organisms/AlertModal'
import EditReplica from '../../organisms/EditReplica'
import ReplicaMigrationOptions from '../../organisms/ReplicaMigrationOptions'

import type { MainItem } from '../../../types/MainItem'
import type { InstanceScript } from '../../../types/Instance'
import type { Execution } from '../../../types/Execution'
import type { Schedule } from '../../../types/Schedule'
import type { Field } from '../../../types/Field'
import type { Action as DropdownAction } from '../../molecules/ActionDropdown'

import replicaStore from '../../../stores/ReplicaStore'
import migrationStore from '../../../stores/MigrationStore'
import userStore from '../../../stores/UserStore'
import endpointStore from '../../../stores/EndpointStore'
import scheduleStore from '../../../stores/ScheduleStore'
import instanceStore from '../../../stores/InstanceStore'
import networkStore from '../../../stores/NetworkStore'
import notificationStore from '../../../stores/NotificationStore'
import providerStore from '../../../stores/ProviderStore'
import configLoader from '../../../utils/Config'
import utils from '../../../utils/ObjectUtils'
import { providerTypes } from '../../../constants'

import replicaImage from './images/replica.svg'
import Palette from '../../styleUtils/Palette'

const Wrapper = styled.div``

type Props = {
  match: any,
  history: any,
}
type State = {
  showOptionsModal: boolean,
  showMigrationModal: boolean,
  showEditModal: boolean,
  showDeleteExecutionConfirmation: boolean,
  showForceCancelConfirmation: boolean,
  showDeleteReplicaConfirmation: boolean,
  showDeleteReplicaDisksConfirmation: boolean,
  confirmationItem: ?MainItem | ?Execution,
  showCancelConfirmation: boolean,
  isEditable: boolean,
  pausePolling: boolean,
}
@observer
class ReplicaDetailsPage extends React.Component<Props, State> {
  state = {
    showOptionsModal: false,
    showMigrationModal: false,
    showEditModal: false,
    showDeleteExecutionConfirmation: false,
    showDeleteReplicaConfirmation: false,
    showDeleteReplicaDisksConfirmation: false,
    confirmationItem: null,
    showCancelConfirmation: false,
    showForceCancelConfirmation: false,
    isEditable: false,
    pausePolling: false,
  }

  stopPolling: ?boolean

  componentWillMount() {
    document.title = 'Replica Details'

    let loadReplica = async () => {
      await endpointStore.getEndpoints({ showLoading: true })
      await this.loadReplicaWithInstances(this.props.match.params.id, true)
      let details = replicaStore.replicaDetails
      if (!details) {
        return
      }
      let endpoint = endpointStore.endpoints.find(e => e.id === details.destination_endpoint_id)
      if (!endpoint) {
        return
      }
      // This allows the values to be displayed with their allocated names instead of their IDs
      await providerStore.loadOptionsSchema({
        providerName: endpoint.type,
        optionsType: 'destination',
        useCache: true,
        quietError: true,
      })
      await providerStore.getOptionsValues({
        optionsType: 'destination',
        endpointId: details.destination_endpoint_id,
        providerName: endpoint.type,
        envData: details.destination_environment,
        useCache: true,
        quietError: true,
      })
    }
    loadReplica()

    scheduleStore.getSchedules(this.props.match.params.id)
    this.pollData(true)
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.match.params.id !== this.props.match.params.id) {
      this.loadReplicaWithInstances(newProps.match.params.id, true)
      scheduleStore.getSchedules(newProps.match.params.id)
    }
  }

  componentWillUnmount() {
    replicaStore.clearDetails()
    scheduleStore.clearUnsavedSchedules()
    this.stopPolling = true
  }

  async loadIsEditable(replicaDetails: MainItem) {
    let targetEndpointId = replicaDetails.destination_endpoint_id
    let sourceEndpointId = replicaDetails.origin_endpoint_id
    await providerStore.loadProviders()
    await utils.waitFor(() => endpointStore.endpoints.length > 0)
    let sourceEndpoint = endpointStore.endpoints.find(e => e.id === sourceEndpointId)
    let targetEndpoint = endpointStore.endpoints.find(e => e.id === targetEndpointId)
    if (!sourceEndpoint || !targetEndpoint || !providerStore.providers) {
      return
    }
    let sourceProviderTypes = providerStore.providers[sourceEndpoint.type]
    let targetProviderTypes = providerStore.providers[targetEndpoint.type]
    let isEditable = sourceProviderTypes && targetProviderTypes ?
      !!sourceProviderTypes.types.find(t => t === providerTypes.SOURCE_UPDATE)
      && !!targetProviderTypes.types.find(t => t === providerTypes.TARGET_UPDATE)
      : false

    this.setState({ isEditable })
  }

  async loadReplicaWithInstances(replicaId: string, cache: boolean) {
    await replicaStore.getReplica(replicaId, { showLoading: true })
    let details = replicaStore.replicaDetails
    if (!details) {
      return
    }
    this.loadIsEditable(details)
    networkStore.loadNetworks(details.destination_endpoint_id, details.destination_environment, {
      quietError: true,
      cache,
    })

    let targetEndpoint = endpointStore.endpoints.find(e => e.id === details.destination_endpoint_id)
    instanceStore.loadInstancesDetails({
      endpointId: details.origin_endpoint_id,
      // $FlowIgnore
      instancesInfo: details.instances.map(n => ({ instance_name: n })),
      cache,
      quietError: false,
      env: details.source_environment,
      targetProvider: targetEndpoint ? targetEndpoint.type : '',
    })
  }

  getLastExecution() {
    if (replicaStore.replicaDetails && replicaStore.replicaDetails.executions && replicaStore.replicaDetails.executions.length) {
      return replicaStore.replicaDetails.executions[replicaStore.replicaDetails.executions.length - 1]
    }

    return null
  }

  getStatus() {
    let lastExecution = this.getLastExecution()
    return lastExecution && lastExecution.status
  }

  isExecuteDisabled() {
    let originEndpoint = endpointStore.endpoints.find(e => replicaStore.replicaDetails && e.id === replicaStore.replicaDetails.origin_endpoint_id)
    let targetEndpoint = endpointStore.endpoints.find(e => replicaStore.replicaDetails && e.id === replicaStore.replicaDetails.destination_endpoint_id)

    return Boolean(!originEndpoint || !targetEndpoint || this.getStatus() === 'RUNNING' || this.getStatus() === 'CANCELLING')
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case 'signout':
        userStore.logout()
        break
      default:
    }
  }

  handleExecuteClick() {
    this.setState({ showOptionsModal: true })
  }

  handleCloseOptionsModal() {
    this.setState({ showOptionsModal: false })
  }

  handleDeleteExecutionConfirmation() {
    if (!this.state.confirmationItem) {
      return
    }
    replicaStore.deleteExecution(replicaStore.replicaDetails ? replicaStore.replicaDetails.id : '', this.state.confirmationItem.id)
    this.handleCloseExecutionConfirmation()
  }

  handleDeleteExecutionClick(execution: ?Execution) {
    this.setState({
      showDeleteExecutionConfirmation: true,
      confirmationItem: execution,
    })
  }

  handleCloseExecutionConfirmation() {
    this.setState({
      showDeleteExecutionConfirmation: false,
      confirmationItem: null,
    })
  }

  handleDeleteReplicaClick() {
    this.setState({ showDeleteReplicaConfirmation: true })
  }

  handleDeleteReplicaDisksClick() {
    this.setState({ showDeleteReplicaDisksConfirmation: true })
  }

  handleDeleteReplicaConfirmation() {
    this.setState({ showDeleteReplicaConfirmation: false })
    this.props.history.push('/replicas')
    replicaStore.delete(replicaStore.replicaDetails ? replicaStore.replicaDetails.id : '')
  }

  handleCloseDeleteReplicaConfirmation() {
    this.setState({ showDeleteReplicaConfirmation: false })
  }

  handleDeleteReplicaDisksConfirmation() {
    this.setState({ showDeleteReplicaDisksConfirmation: false })
    replicaStore.deleteDisks(replicaStore.replicaDetails ? replicaStore.replicaDetails.id : '')
    this.props.history.push(`/replica/executions/${replicaStore.replicaDetails ? replicaStore.replicaDetails.id : ''}`)
  }

  handleCloseDeleteReplicaDisksConfirmation() {
    this.setState({ showDeleteReplicaDisksConfirmation: false })
  }

  handleCloseMigrationModal() {
    this.setState({ showMigrationModal: false, pausePolling: false })
  }

  handleCreateMigrationClick() {
    this.setState({ showMigrationModal: true, pausePolling: true })
  }

  handleReplicaEditClick() {
    this.setState({ showEditModal: true, pausePolling: true })
  }

  handleAddScheduleClick(schedule: Schedule) {
    scheduleStore.addSchedule(this.props.match.params.id, schedule)
  }

  handleScheduleChange(scheduleId: ?string, data: Schedule, forceSave?: boolean) {
    let oldData = scheduleStore.schedules.find(s => s.id === scheduleId)
    let unsavedData = scheduleStore.unsavedSchedules.find(s => s.id === scheduleId)

    if (scheduleId) {
      scheduleStore.updateSchedule(this.props.match.params.id, scheduleId, data, oldData, unsavedData, forceSave)
    }
  }

  handleScheduleSave(schedule: Schedule) {
    if (schedule.id) {
      scheduleStore.updateSchedule(this.props.match.params.id, schedule.id, schedule, schedule, schedule, true)
    }
  }

  handleScheduleRemove(scheduleId: ?string) {
    if (scheduleId) {
      scheduleStore.removeSchedule(this.props.match.params.id, scheduleId)
    }
  }

  handleCancelLastExecutionClick(force?: boolean) {
    this.handleCancelExecution(this.getLastExecution(), force)
  }

  handleCancelExecution(confirmationItem: ?Execution, force: ?boolean) {
    if (force) {
      this.setState({ confirmationItem, showForceCancelConfirmation: true })
    } else {
      this.setState({ confirmationItem, showCancelConfirmation: true })
    }
  }

  handleCloseCancelConfirmation() {
    this.setState({
      showForceCancelConfirmation: false,
      showCancelConfirmation: false,
    })
  }

  handleCancelConfirmation(force?: boolean) {
    if (!this.state.confirmationItem) {
      return
    }
    replicaStore.cancelExecution(
      replicaStore.replicaDetails ? replicaStore.replicaDetails.id : '',
      this.state.confirmationItem.id,
      force
    )
    this.setState({
      showForceCancelConfirmation: false,
      showCancelConfirmation: false,
    })
  }

  migrateReplica(options: Field[], uploadedScripts: InstanceScript[]) {
    this.migrate(options, uploadedScripts)
    this.handleCloseMigrationModal()
  }

  async migrate(options: Field[], uploadedScripts: InstanceScript[]) {
    let migration = await migrationStore.migrateReplica(
      replicaStore.replicaDetails ? replicaStore.replicaDetails.id : '',
      options,
      uploadedScripts
    )
    notificationStore.alert('Migration successfully created from replica.', 'success', {
      action: {
        label: 'View Migration Status',
        callback: () => {
          this.props.history.push(`/migration/tasks/${migration.id}`)
        },
      },
    })
  }

  executeReplica(fields: Field[]) {
    replicaStore.execute(replicaStore.replicaDetails ? replicaStore.replicaDetails.id : '', fields)
    this.handleCloseOptionsModal()
    this.props.history.push(`/replica/executions/${replicaStore.replicaDetails ? replicaStore.replicaDetails.id : ''}`)
  }

  async pollData(showLoading: boolean) {
    if (this.state.pausePolling || this.stopPolling) {
      return
    }

    if (!this.props.match.params.page) {
      replicaStore.getReplica(this.props.match.params.id, { showLoading, skipLog: true })
    }

    await replicaStore.getReplicaExecutions(this.props.match.params.id, { showLoading, skipLog: true })
    setTimeout(() => { this.pollData(false) }, configLoader.config.requestPollTimeout)
  }

  closeEditModal() {
    this.setState({ showEditModal: false, pausePolling: false }, () => {
      this.pollData(false)
    })
  }

  handleEditReplicaReload() {
    this.loadReplicaWithInstances(this.props.match.params.id, false)
  }

  handleUpdateComplete(redirectTo: string) {
    if (!replicaStore.replicaDetails) {
      return
    }

    this.props.history.push(redirectTo)
    this.closeEditModal()
  }

  renderEditReplica() {
    let sourceEndpoint = endpointStore.endpoints
      .find(e => replicaStore.replicaDetails && e.id === replicaStore.replicaDetails.origin_endpoint_id)
    let destinationEndpoint = endpointStore.endpoints
      .find(e => replicaStore.replicaDetails && e.id === replicaStore.replicaDetails.destination_endpoint_id)

    if (!this.state.showEditModal || !replicaStore.replicaDetails || !destinationEndpoint || !sourceEndpoint) {
      return null
    }

    return (
      <EditReplica
        isOpen
        type="replica"
        sourceEndpoint={sourceEndpoint}
        onUpdateComplete={url => { this.handleUpdateComplete(url) }}
        onRequestClose={() => { this.closeEditModal() }}
        replica={replicaStore.replicaDetails}
        destinationEndpoint={destinationEndpoint}
        instancesDetails={instanceStore.instancesDetails}
        instancesDetailsLoading={instanceStore.loadingInstancesDetails}
        networks={networkStore.networks}
        networksLoading={networkStore.loading}
        onReloadClick={() => { this.handleEditReplicaReload() }}
      />
    )
  }

  render() {
    let dropdownActions: DropdownAction[] = [
      {
        label: 'Execute',
        action: () => { this.handleExecuteClick() },
        hidden: this.isExecuteDisabled(),
      },
      {
        label: 'Cancel',
        hidden: this.getStatus() !== 'RUNNING',
        action: () => { this.handleCancelLastExecutionClick() },
      },
      {
        label: 'Force Cancel',
        hidden: this.getStatus() !== 'CANCELLING',
        action: () => { this.handleCancelLastExecutionClick(true) },
      },
      {
        label: 'Create Migration',
        color: Palette.primary,
        action: () => { this.handleCreateMigrationClick() },
      },
      {
        label: 'Edit',
        title: !this.state.isEditable ? 'At least one of the providers doesn\'t support editing' : null,
        action: () => { this.handleReplicaEditClick() },
        disabled: !this.state.isEditable,
      },
      {
        label: 'Delete Disks',
        action: () => { this.handleDeleteReplicaDisksClick() },
      },
      {
        label: 'Delete Replica',
        color: Palette.alert,
        action: () => { this.handleDeleteReplicaClick() },
      },
    ]

    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={userStore.loggedUser}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          contentHeaderComponent={<DetailsContentHeader
            item={replicaStore.replicaDetails}
            dropdownActions={dropdownActions}
            backLink="/replicas"
            typeImage={replicaImage}
            alertInfoPill
          />}
          contentComponent={<ReplicaDetailsContent
            item={replicaStore.replicaDetails}
            instancesDetails={instanceStore.instancesDetails}
            instancesDetailsLoading={instanceStore.loadingInstancesDetails}
            endpoints={endpointStore.endpoints}
            scheduleStore={scheduleStore}
            networks={networkStore.networks}
            detailsLoading={replicaStore.detailsLoading || endpointStore.loading}
            destinationSchema={providerStore.destinationSchema}
            destinationSchemaLoading={providerStore.destinationSchemaLoading
              || providerStore.destinationOptionsPrimaryLoading
              || providerStore.destinationOptionsSecondaryLoading}
            executionsLoading={replicaStore.executionsLoading}
            page={this.props.match.params.page || ''}
            onCancelExecutionClick={(e, f) => { this.handleCancelExecution(e, f) }}
            onDeleteExecutionClick={execution => { this.handleDeleteExecutionClick(execution) }}
            onExecuteClick={() => { this.handleExecuteClick() }}
            onCreateMigrationClick={() => { this.handleCreateMigrationClick() }}
            onDeleteReplicaClick={() => { this.handleDeleteReplicaClick() }}
            onAddScheduleClick={schedule => { this.handleAddScheduleClick(schedule) }}
            onScheduleChange={(scheduleId, data, forceSave) => { this.handleScheduleChange(scheduleId, data, forceSave) }}
            onScheduleRemove={scheduleId => { this.handleScheduleRemove(scheduleId) }}
            onScheduleSave={s => { this.handleScheduleSave(s) }}
          />}
        />
        <Modal
          isOpen={this.state.showOptionsModal}
          title="New Execution"
          onRequestClose={() => { this.handleCloseOptionsModal() }}
        >
          <ReplicaExecutionOptions
            onCancelClick={() => { this.handleCloseOptionsModal() }}
            onExecuteClick={fields => { this.executeReplica(fields) }}
          />
        </Modal>
        {this.state.showMigrationModal ? (
          <Modal
            isOpen
            title="Create Migration from Replica"
            onRequestClose={() => { this.handleCloseMigrationModal() }}
          >
            <ReplicaMigrationOptions
              loadingInstances={instanceStore.loadingInstancesDetails}
              instances={instanceStore.instancesDetails}
              onCancelClick={() => { this.handleCloseMigrationModal() }}
              onMigrateClick={(o, s) => { this.migrateReplica(o, s) }}
            />
          </Modal>
        ) : null}
        <AlertModal
          isOpen={this.state.showDeleteExecutionConfirmation}
          title="Delete Execution?"
          message="Are you sure you want to delete this execution?"
          extraMessage="Deleting a Coriolis Execution is permanent!"
          onConfirmation={() => { this.handleDeleteExecutionConfirmation() }}
          onRequestClose={() => { this.handleCloseExecutionConfirmation() }}
        />
        <AlertModal
          isOpen={this.state.showDeleteReplicaConfirmation}
          title="Delete Replica?"
          message="Are you sure you want to delete this replica?"
          extraMessage="Deleting a Coriolis Replica is permanent!"
          onConfirmation={() => { this.handleDeleteReplicaConfirmation() }}
          onRequestClose={() => { this.handleCloseDeleteReplicaConfirmation() }}
        />
        <AlertModal
          isOpen={this.state.showDeleteReplicaDisksConfirmation}
          title="Delete Replica Disks?"
          message="Are you sure you want to delete this replica's disks?"
          extraMessage="Deleting Coriolis Replica Disks is permanent!"
          onConfirmation={() => { this.handleDeleteReplicaDisksConfirmation() }}
          onRequestClose={() => { this.handleCloseDeleteReplicaDisksConfirmation() }}
        />
        <AlertModal
          isOpen={this.state.showCancelConfirmation}
          title="Cancel Execution?"
          message="Are you sure you want to cancel the current execution?"
          extraMessage=" "
          onConfirmation={() => { this.handleCancelConfirmation() }}
          onRequestClose={() => { this.handleCloseCancelConfirmation() }}
        />
        <AlertModal
          isOpen={this.state.showForceCancelConfirmation}
          title="Force Cancel Execution?"
          message="Are you sure you want to force cancel the current execution?"
          extraMessage={`
The execution is currently being cancelled.
Would you like to force its cancellation?
Note that this may lead to scheduled cleanup tasks being forcibly skipped, and thus manual cleanup of temporary resources on the source/destination platforms may be required.`
          }
          onConfirmation={() => { this.handleCancelConfirmation(true) }}
          onRequestClose={() => { this.handleCloseCancelConfirmation() }}
        />
        {this.renderEditReplica()}
      </Wrapper>
    )
  }
}

export default ReplicaDetailsPage
