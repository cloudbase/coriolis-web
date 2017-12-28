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
import PropTypes from 'prop-types'
import connectToStores from 'alt-utils/lib/connectToStores'

import {
  DetailsTemplate,
  DetailsPageHeader,
  DetailsContentHeader,
  ReplicaDetailsContent,
  Modal,
  ReplicaExecutionOptions,
  AlertModal,
  ReplicaMigrationOptions,
} from 'components'

import Wait from '../../../utils/Wait'
import ReplicaStore from '../../../stores/ReplicaStore'
import UserStore from '../../../stores/UserStore'
import UserActions from '../../../actions/UserActions'
import ReplicaActions from '../../../actions/ReplicaActions'
import MigrationActions from '../../../actions/MigrationActions'
import EndpointStore from '../../../stores/EndpointStore'
import EndpointActions from '../../../actions/EndpointActions'
import ScheduleActions from '../../../actions/ScheduleActions'
import ScheduleStore from '../../../stores/ScheduleStore'
import { requestPollTimeout } from '../../../config'

import replicaImage from './images/replica.svg'

const Wrapper = styled.div``

class ReplicaDetailsPage extends React.Component {
  static propTypes = {
    match: PropTypes.object,
    replicaStore: PropTypes.object,
    endpointStore: PropTypes.object,
    userStore: PropTypes.object,
    scheduleStore: PropTypes.object,
  }

  static getStores() {
    return [ReplicaStore, EndpointStore, UserStore, ScheduleStore]
  }

  static getPropsFromStores() {
    return {
      replicaStore: ReplicaStore.getState(),
      endpointStore: EndpointStore.getState(),
      userStore: UserStore.getState(),
      scheduleStore: ScheduleStore.getState(),
    }
  }

  constructor() {
    super()

    this.state = {
      showOptionsModal: false,
      showMigrationModal: false,
      showDeleteExecutionConfirmation: false,
      showDeleteReplicaConfirmation: false,
      confirmationItem: null,
      showCancelConfirmation: false,
    }
  }

  componentDidMount() {
    document.title = 'Replica Details'

    ReplicaActions.getReplica(this.props.match.params.id)
    EndpointActions.getEndpoints()
    ScheduleActions.getSchedules(this.props.match.params.id)
    this.pollData()
    this.pollInterval = setInterval(() => { this.pollData() }, requestPollTimeout)
  }

  componentWillUnmount() {
    ReplicaActions.clearDetails()
    clearInterval(this.pollInterval)
  }

  isActionButtonDisabled() {
    let originEndpoint = this.props.endpointStore.endpoints.find(e => e.id === this.props.replicaStore.replicaDetails.origin_endpoint_id)
    let targetEndpoint = this.props.endpointStore.endpoints.find(e => e.id === this.props.replicaStore.replicaDetails.destination_endpoint_id)
    let lastExecution = this.props.replicaStore.replicaDetails.executions && this.props.replicaStore.replicaDetails.executions.length
      && this.props.replicaStore.replicaDetails.executions[this.props.replicaStore.replicaDetails.executions.length - 1]
    let status = lastExecution && lastExecution.status

    return Boolean(!originEndpoint || !targetEndpoint || status === 'RUNNING')
  }

  handleUserItemClick(item) {
    switch (item.value) {
      case 'signout':
        UserActions.logout()
        return
      case 'profile':
        window.location.href = '/#/profile'
        break
      default:
    }
  }

  handleBackButtonClick() {
    window.location.href = '/#/replicas'
  }

  handleActionButtonClick() {
    this.setState({ showOptionsModal: true })
  }

  handleCloseOptionsModal() {
    this.setState({ showOptionsModal: false })
  }

  handleDeleteExecutionConfirmation() {
    ReplicaActions.deleteExecution(this.props.replicaStore.replicaDetails.id, this.state.confirmationItem.id)
    this.handleCloseExecutionConfirmation()
  }

  handleDeleteExecutionClick(execution) {
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

  handleDeleteReplicaConfirmation() {
    this.setState({ showDeleteReplicaConfirmation: false })
    window.location.href = '/#/replicas'
    ReplicaActions.delete(this.props.replicaStore.replicaDetails.id)
  }

  handleCloseDeleteReplicaConfirmation() {
    this.setState({ showDeleteReplicaConfirmation: false })
  }

  handleCloseMigrationModal() {
    this.setState({ showMigrationModal: false })
  }

  handleCreateMigrationClick() {
    this.setState({ showMigrationModal: true })
  }

  handleAddScheduleClick(schedule) {
    ScheduleActions.addSchedule(this.props.match.params.id, schedule)
  }

  handleScheduleChange(scheduleId, data) {
    let oldData = this.props.scheduleStore.schedules.find(s => s.id === scheduleId)
    ScheduleActions.updateSchedule(this.props.match.params.id, scheduleId, data, oldData)
  }

  handleScheduleRemove(scheduleId) {
    ScheduleActions.removeSchedule(this.props.match.params.id, scheduleId)
  }

  handleCancelExecutionClick(confirmationItem) {
    this.setState({ confirmationItem, showCancelConfirmation: true })
  }

  handleCloseCancelConfirmation() {
    this.setState({ showCancelConfirmation: false })
  }

  handleCancelConfirmation() {
    this.setState({ showCancelConfirmation: false })
    ReplicaActions.cancelExecution(this.props.replicaStore.replicaDetails.id, this.state.confirmationItem.id)
  }

  migrateReplica(options) {
    MigrationActions.migrateReplica(this.props.replicaStore.replicaDetails.id, options)
    this.handleCloseMigrationModal()
  }

  executeReplica(fields) {
    ReplicaActions.execute(this.props.replicaStore.replicaDetails.id, fields)
    this.handleCloseOptionsModal()
    window.location.href = `/#/replica/executions/${this.props.replicaStore.replicaDetails.id}`
  }

  pollData() {
    Wait.for(() => this.props.replicaStore.replicaDetails.id === this.props.match.params.id,
      () => { ReplicaActions.getReplicaExecutions(this.props.match.params.id) })
  }

  render() {
    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={this.props.userStore.user}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          contentHeaderComponent={<DetailsContentHeader
            item={this.props.replicaStore.replicaDetails}
            onBackButonClick={() => { this.handleBackButtonClick() }}
            onActionButtonClick={() => { this.handleActionButtonClick() }}
            onCancelClick={execution => { this.handleCancelExecutionClick(execution) }}
            actionButtonDisabled={this.isActionButtonDisabled()}
            typeImage={replicaImage}
            alertInfoPill
            buttonLabel="Execute Now"
          />}
          contentComponent={<ReplicaDetailsContent
            item={this.props.replicaStore.replicaDetails}
            endpoints={this.props.endpointStore.endpoints}
            scheduleStore={this.props.scheduleStore}
            detailsLoading={this.props.replicaStore.detailsLoading || this.props.endpointStore.loading}
            page={this.props.match.params.page || ''}
            onCancelExecutionClick={execution => { this.handleCancelExecutionClick(execution) }}
            onDeleteExecutionClick={execution => { this.handleDeleteExecutionClick(execution) }}
            onExecuteClick={() => { this.handleActionButtonClick() }}
            onCreateMigrationClick={() => { this.handleCreateMigrationClick() }}
            onDeleteReplicaClick={() => { this.handleDeleteReplicaClick() }}
            onAddScheduleClick={schedule => { this.handleAddScheduleClick(schedule) }}
            onScheduleChange={(scheduleId, data) => { this.handleScheduleChange(scheduleId, data) }}
            onScheduleRemove={scheduleId => { this.handleScheduleRemove(scheduleId) }}
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
        <Modal
          isOpen={this.state.showMigrationModal}
          title="Create Migration from Replica"
          onRequestClose={() => { this.handleCloseMigrationModal() }}
        >
          <ReplicaMigrationOptions
            onCancelClick={() => { this.handleCloseMigrationModal() }}
            onMigrateClick={options => { this.migrateReplica(options) }}
          />
        </Modal>
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
          isOpen={this.state.showCancelConfirmation}
          title="Cancel Execution?"
          message="Are you sure you want to cancel the current execution?"
          extraMessage=" "
          onConfirmation={() => { this.handleCancelConfirmation() }}
          onRequestClose={() => { this.handleCloseCancelConfirmation() }}
        />
      </Wrapper>
    )
  }
}

export default connectToStores(ReplicaDetailsPage)
