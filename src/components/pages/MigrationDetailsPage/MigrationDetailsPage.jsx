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
import MigrationDetailsContent from '../../organisms/MigrationDetailsContent'
import AlertModal from '../../organisms/AlertModal'
import EditReplica from '../../organisms/EditReplica'

import migrationStore from '../../../stores/MigrationStore'
import userStore from '../../../stores/UserStore'
import endpointStore from '../../../stores/EndpointStore'
import notificationStore from '../../../stores/NotificationStore'
import networkStore from '../../../stores/NetworkStore'
import instanceStore from '../../../stores/InstanceStore'
import configLoader from '../../../utils/Config'

import migrationImage from './images/migration.svg'
import Palette from '../../styleUtils/Palette'

const Wrapper = styled.div``

type Props = {
  match: any,
  history: any,
}
type State = {
  showDeleteMigrationConfirmation: boolean,
  showCancelConfirmation: boolean,
  showEditModal: boolean,
}
@observer
class MigrationDetailsPage extends React.Component<Props, State> {
  state = {
    showDeleteMigrationConfirmation: false,
    showCancelConfirmation: false,
    showEditModal: false,
  }

  pollTimeout: TimeoutID

  componentDidMount() {
    document.title = 'Migration Details'

    endpointStore.getEndpoints()
    this.loadMigrationWithInstances(this.props.match.params.id)
    this.pollData()
  }

  componentWillReceiveProps(newProps: any) {
    if (newProps.match.params.id === this.props.match.params.id) {
      return
    }

    endpointStore.getEndpoints()
    this.loadMigrationWithInstances(newProps.match.params.id)
  }

  componentWillUnmount() {
    migrationStore.clearDetails()
    clearTimeout(this.pollTimeout)
  }

  loadMigrationWithInstances(migrationId: string) {
    migrationStore.getMigration(migrationId, true).then(() => {
      let details = migrationStore.migrationDetails
      if (!details) {
        return
      }

      networkStore.loadNetworks(details.destination_endpoint_id, details.destination_environment, {
        quietError: true,
      })
      instanceStore.loadInstancesDetails(
        details.origin_endpoint_id,
        // $FlowIgnore
        details.instances.map(n => { return { instance_name: n } }),
        false, true
      )
    })
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case 'signout':
        userStore.logout()
        break
      default:
    }
  }

  handleDeleteMigrationClick() {
    this.setState({ showDeleteMigrationConfirmation: true })
  }

  handleDeleteMigrationConfirmation() {
    this.setState({ showDeleteMigrationConfirmation: false })
    this.props.history.push('/migrations')
    if (migrationStore.migrationDetails) {
      migrationStore.delete(migrationStore.migrationDetails.id)
    }
  }

  handleCloseDeleteMigrationConfirmation() {
    this.setState({ showDeleteMigrationConfirmation: false })
  }

  handleCancelMigrationClick() {
    this.setState({ showCancelConfirmation: true })
  }

  handleRecreateClick() {
    this.setState({
      showEditModal: true,
    })
  }

  handleCloseCancelConfirmation() {
    this.setState({ showCancelConfirmation: false })
  }

  handleCancelConfirmation() {
    this.setState({ showCancelConfirmation: false })
    if (!migrationStore.migrationDetails) {
      return
    }
    migrationStore.cancel(migrationStore.migrationDetails.id).then(() => {
      if (migrationStore.canceling === false) {
        notificationStore.alert('Canceled', 'success')
      } else {
        notificationStore.alert('The migration couldn\'t be canceled', 'error')
      }
    })
  }

  pollData() {
    if (this.state.showEditModal) {
      return
    }
    migrationStore.getMigration(this.props.match.params.id, false).then(() => {
      this.pollTimeout = setTimeout(() => { this.pollData() }, configLoader.config.requestPollTimeout)
    })
  }

  getStatus() {
    return migrationStore.migrationDetails && migrationStore.migrationDetails.status
  }

  closeEditModal() {
    this.setState({ showEditModal: false }, () => {
      this.pollData()
    })
  }

  handleUpdateComplete(redirectTo: string) {
    this.props.history.push(redirectTo)
  }

  renderEditModal() {
    let sourceEndpoint = endpointStore.endpoints
      .find(e => migrationStore.migrationDetails && e.id === migrationStore.migrationDetails.origin_endpoint_id)
    let destinationEndpoint = endpointStore.endpoints
      .find(e => migrationStore.migrationDetails && e.id === migrationStore.migrationDetails.destination_endpoint_id)

    if (!this.state.showEditModal || !migrationStore.migrationDetails || !destinationEndpoint || !sourceEndpoint) {
      return null
    }

    return (
      <EditReplica
        type="migration"
        isOpen
        onRequestClose={() => { this.closeEditModal() }}
        onUpdateComplete={url => { this.handleUpdateComplete(url) }}
        sourceEndpoint={sourceEndpoint}
        replica={migrationStore.migrationDetails}
        destinationEndpoint={destinationEndpoint}
        instancesDetails={instanceStore.instancesDetails}
        instancesDetailsLoading={instanceStore.loadingInstancesDetails}
        networks={networkStore.networks}
        networksLoading={networkStore.loading}
      />
    )
  }

  render() {
    let dropdownActions = [{
      label: 'Cancel',
      disabled: this.getStatus() !== 'RUNNING',
      action: () => { this.handleCancelMigrationClick() },
    }, {
      label: 'Recreate Migration',
      action: () => { this.handleRecreateClick() },
    }, {
      label: 'Delete Migration',
      color: Palette.alert,
      action: () => { this.handleDeleteMigrationClick() },
    }]

    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={userStore.loggedUser}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          contentHeaderComponent={<DetailsContentHeader
            item={migrationStore.migrationDetails}
            backLink="/migrations"
            typeImage={migrationImage}
            dropdownActions={dropdownActions}
            primaryInfoPill
          />}
          contentComponent={<MigrationDetailsContent
            item={migrationStore.migrationDetails}
            instancesDetails={instanceStore.instancesDetails}
            instancesDetailsLoading={instanceStore.loadingInstancesDetails}
            endpoints={endpointStore.endpoints}
            page={this.props.match.params.page || ''}
            detailsLoading={endpointStore.loading || migrationStore.detailsLoading}
            onDeleteMigrationClick={() => { this.handleDeleteMigrationClick() }}
          />}
        />
        <AlertModal
          isOpen={this.state.showDeleteMigrationConfirmation}
          title="Delete Migration?"
          message="Are you sure you want to delete this migration?"
          extraMessage="Deleting a Coriolis Migration is permanent!"
          onConfirmation={() => { this.handleDeleteMigrationConfirmation() }}
          onRequestClose={() => { this.handleCloseDeleteMigrationConfirmation() }}
        />

        <AlertModal
          isOpen={this.state.showCancelConfirmation}
          title="Cancel Migration?"
          message="Are you sure you want to cancel the migration?"
          extraMessage=" "
          onConfirmation={() => { this.handleCancelConfirmation() }}
          onRequestClose={() => { this.handleCloseCancelConfirmation() }}
        />
        {this.renderEditModal()}
      </Wrapper>
    )
  }
}

export default MigrationDetailsPage
