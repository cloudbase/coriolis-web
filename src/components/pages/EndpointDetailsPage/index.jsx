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
import connectToStores from 'alt-utils/lib/connectToStores'

import DetailsTemplate from '../../templates/DetailsTemplate'
import { DetailsPageHeader } from '../../organisms/DetailsPageHeader'
import DetailsContentHeader from '../../organisms/DetailsContentHeader'
import EndpointDetailsContent from '../../organisms/EndpointDetailsContent'
import AlertModal from '../../organisms/AlertModal'
import Modal from '../../molecules/Modal'
import EndpointValidation from '../../organisms/EndpointValidation'
import Endpoint from '../../organisms/Endpoint'

import EndpointStore from '../../../stores/EndpointStore'
import EndpointActions from '../../../actions/EndpointActions'
import MigrationStore from '../../../stores/MigrationStore'
import ReplicaStore from '../../../stores/ReplicaStore'
import MigrationActions from '../../../actions/MigrationActions'
import ReplicaActions from '../../../actions/ReplicaActions'
import UserStore from '../../../stores/UserStore'
import UserActions from '../../../actions/UserActions'
import type { Endpoint as EndpointType } from '../../../types/Endpoint'

import endpointImage from './images/endpoint.svg'

const Wrapper = styled.div``

type Props = {
  match: any,
  endpointStore: any,
  userStore: any,
  migrationStore: any,
  replicaStore: any,
}
type State = {
  showDeleteEndpointConfirmation: boolean,
  showValidationModal: boolean,
  showEndpointModal: boolean,
  showEndpointInUseModal: boolean,
  showEndpointInUseLoadingModal: boolean,
}
class EndpointDetailsPage extends React.Component<Props, State> {
  static getStores() {
    return [EndpointStore, UserStore, MigrationStore, ReplicaStore]
  }

  static getPropsFromStores() {
    return {
      endpointStore: EndpointStore.getState(),
      userStore: UserStore.getState(),
      migrationStore: MigrationStore.getState(),
      replicaStore: ReplicaStore.getState(),
    }
  }

  constructor() {
    super()

    this.state = {
      showDeleteEndpointConfirmation: false,
      showValidationModal: false,
      showEndpointModal: false,
      showEndpointInUseModal: false,
      showEndpointInUseLoadingModal: false,
    }
  }

  componentDidMount() {
    document.title = 'Endpoint Details'

    this.loadData()
  }

  componentWillUnmount() {
    EndpointActions.clearConnectionInfo()
  }

  getEndpoint(): ?EndpointType {
    return this.props.endpointStore.endpoints.find(e => e.id === this.props.match.params.id) || null
  }

  getEndpointUsage() {
    let endpointId = this.props.match.params.id
    let replicasCount = this.props.replicaStore.replicas.filter(
      r => r.origin_endpoint_id === endpointId || r.destination_endpoint_id === endpointId).length
    let migrationsCount = this.props.migrationStore.migrations.filter(
      r => r.origin_endpoint_id === endpointId || r.destination_endpoint_id === endpointId).length

    return { migrationsCount, replicasCount }
  }

  handleUserItemClick(item: { value: string }) {
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
    window.location.href = '/#/endpoints'
  }

  handleDeleteEndpointClick() {
    this.setState({ showEndpointInUseLoadingModal: true })

    Promise.all([ReplicaActions.getReplicas().promise, MigrationActions.getMigrations().promise]).then(() => {
      let endpointUsage = this.getEndpointUsage()

      if (endpointUsage.migrationsCount === 0 && endpointUsage.replicasCount === 0) {
        this.setState({ showDeleteEndpointConfirmation: true, showEndpointInUseLoadingModal: false })
      } else {
        this.setState({ showEndpointInUseModal: true, showEndpointInUseLoadingModal: false })
      }
    })
  }

  handleDeleteEndpointConfirmation() {
    this.setState({ showDeleteEndpointConfirmation: false })
    window.location.href = '/#/endpoints'
    EndpointActions.delete(this.getEndpoint())
  }

  handleCloseDeleteEndpointConfirmation() {
    this.setState({ showDeleteEndpointConfirmation: false })
  }

  handleValidateClick() {
    EndpointActions.validate(this.getEndpoint())
    this.setState({ showValidationModal: true })
  }

  handleRetryValidation() {
    EndpointActions.validate(this.getEndpoint())
  }

  handleCloseValidationModal() {
    EndpointActions.clearValidation()
    this.setState({ showValidationModal: false })
  }

  handleEditClick() {
    this.setState({ showEndpointModal: true })
  }

  handleEditValidateClick(endpoint) {
    EndpointActions.validate(endpoint)
  }

  handleCloseEndpointModal() {
    this.setState({ showEndpointModal: false })
  }

  handleCloseEndpointInUseModal() {
    this.setState({ showEndpointInUseModal: false })
  }

  loadData() {
    EndpointActions.getEndpoints().promise.then(() => {
      let endpoint = this.getEndpoint()

      if (endpoint && endpoint.connection_info && endpoint.connection_info.secret_ref) {
        EndpointActions.getConnectionInfo(endpoint)
      } else if (endpoint && endpoint.connection_info) {
        EndpointActions.getConnectionInfoSuccess(endpoint.connection_info)
      }
    })
  }

  render() {
    let endpoint = this.getEndpoint()
    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={this.props.userStore.user}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          contentHeaderComponent={<DetailsContentHeader
            item={(endpoint: any)}
            onBackButonClick={() => { this.handleBackButtonClick() }}
            onCancelClick={() => { }}
            typeImage={endpointImage}
            description={endpoint ? endpoint.description : ''}
            noSidemenuSpace
          />}
          contentComponent={<EndpointDetailsContent
            item={endpoint}
            loading={this.props.endpointStore.connectionInfoLoading || this.props.endpointStore.loading}
            connectionInfo={this.props.endpointStore.connectionInfo}
            onDeleteClick={() => { this.handleDeleteEndpointClick() }}
            onValidateClick={() => { this.handleValidateClick() }}
            onEditClick={() => { this.handleEditClick() }}
          />}
        />
        <AlertModal
          isOpen={this.state.showDeleteEndpointConfirmation}
          title="Delete Endpoint?"
          message="Are you sure you want to delete this endpoint?"
          extraMessage="Deleting a Coriolis Endpoint is permanent!"
          onConfirmation={() => { this.handleDeleteEndpointConfirmation() }}
          onRequestClose={() => { this.handleCloseDeleteEndpointConfirmation() }}
        />
        <AlertModal
          type="error"
          isOpen={this.state.showEndpointInUseModal}
          title="Endpoint is in use"
          message="The endpoint can't be deleted because it is in use by replicas or migrations."
          extraMessage="You must first delete the replica or migration which uses this endpoint."
          onRequestClose={() => { this.handleCloseEndpointInUseModal() }}
        />
        <AlertModal
          type="loading"
          isOpen={this.state.showEndpointInUseLoadingModal}
          title="Checking enpoint usage"
        />
        <Modal
          isOpen={this.state.showValidationModal}
          title="Validate Endpoint"
          onRequestClose={() => { this.handleCloseValidationModal() }}
        >
          <EndpointValidation
            validation={this.props.endpointStore.validation}
            loading={this.props.endpointStore.validating}
            onCancelClick={() => { this.handleCloseValidationModal() }}
            onRetryClick={() => { this.handleRetryValidation() }}
          />
        </Modal>
        <Modal
          isOpen={this.state.showEndpointModal}
          title="Edit Endpoint"
          onRequestClose={() => { this.handleCloseEndpointModal() }}
        >
          <Endpoint
            endpoint={this.getEndpoint()}
            onValidateClick={endpoint => this.handleEditValidateClick(endpoint)}
            onCancelClick={() => { this.handleCloseEndpointModal() }}
          />
        </Modal>
      </Wrapper>
    )
  }
}

export default connectToStores(EndpointDetailsPage)
