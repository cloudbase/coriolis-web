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
import EndpointDetailsContent from '../../organisms/EndpointDetailsContent'
import AlertModal from '../../organisms/AlertModal'
import Modal from '../../molecules/Modal'
import EndpointValidation from '../../organisms/EndpointValidation'
import Endpoint from '../../organisms/Endpoint'
import EndpointDuplicateOptions from '../../organisms/EndpointDuplicateOptions'

import endpointStore, { passwordFields } from '../../../stores/EndpointStore'
import migrationStore from '../../../stores/MigrationStore'
import replicaStore from '../../../stores/ReplicaStore'
import userStore from '../../../stores/UserStore'
import projectStore from '../../../stores/ProjectStore'

import type { Endpoint as EndpointType } from '../../../types/Endpoint'
import type { MainItem } from '../../../types/MainItem'

import Palette from '../../styleUtils/Palette'

import endpointImage from './images/endpoint.svg'

const Wrapper = styled.div``

type Props = {
  match: any,
  history: any,
}
type State = {
  showDeleteEndpointConfirmation: boolean,
  showValidationModal: boolean,
  showEndpointModal: boolean,
  showEndpointInUseModal: boolean,
  showEndpointInUseLoadingModal: boolean,
  endpointUsage: { replicas: MainItem[], migrations: MainItem[] },
  showDuplicateModal: boolean,
  duplicating: boolean,
}
@observer
class EndpointDetailsPage extends React.Component<Props, State> {
  state = {
    showDeleteEndpointConfirmation: false,
    showValidationModal: false,
    showEndpointModal: false,
    showEndpointInUseModal: false,
    showEndpointInUseLoadingModal: false,
    showDuplicateModal: false,
    duplicating: false,
    endpointUsage: { replicas: [], migrations: [] },
  }

  componentDidMount() {
    document.title = 'Endpoint Details'

    this.loadData()
  }

  componentWillUnmount() {
    endpointStore.clearConnectionInfo()
  }

  getEndpoint(): ?EndpointType {
    return endpointStore.endpoints.find(e => e.id === this.props.match.params.id) || null
  }

  getEndpointUsage(): { migrations: MainItem[], replicas: MainItem[] } {
    let endpointId = this.props.match.params.id
    let replicas = replicaStore.replicas.filter(
      r => r.origin_endpoint_id === endpointId || r.destination_endpoint_id === endpointId)
    let migrations = migrationStore.migrations.filter(
      r => r.origin_endpoint_id === endpointId || r.destination_endpoint_id === endpointId)

    return { migrations, replicas }
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case 'signout':
        userStore.logout()
        break
      default:
    }
  }

  handleDeleteEndpointClick() {
    this.setState({ showEndpointInUseLoadingModal: true })

    Promise.all([replicaStore.getReplicas(), migrationStore.getMigrations()]).then(() => {
      const endpointUsage = this.getEndpointUsage()

      if (endpointUsage.migrations.length === 0 && endpointUsage.replicas.length === 0) {
        this.setState({ showDeleteEndpointConfirmation: true, showEndpointInUseLoadingModal: false })
      } else {
        this.setState({ showEndpointInUseModal: true, showEndpointInUseLoadingModal: false })
      }
    })
  }

  handleDeleteEndpointConfirmation() {
    this.setState({ showDeleteEndpointConfirmation: false })
    this.props.history.push('/endpoints')
    let endpoint = this.getEndpoint()
    if (endpoint) {
      endpointStore.delete(endpoint)
    }
  }

  handleCloseDeleteEndpointConfirmation() {
    this.setState({ showDeleteEndpointConfirmation: false })
  }

  handleValidateClick() {
    let endpoint = this.getEndpoint()
    if (endpoint) {
      endpointStore.validate(endpoint)
    }
    this.setState({ showValidationModal: true })
  }

  handleRetryValidation() {
    let endpoint = this.getEndpoint()
    if (endpoint) {
      endpointStore.validate(endpoint)
    }
  }

  handleCloseValidationModal() {
    endpointStore.clearValidation()
    this.setState({ showValidationModal: false })
  }

  handleEditClick() {
    this.setState({ showEndpointModal: true })
  }

  handleEditValidateClick(endpoint: EndpointType) {
    endpointStore.validate(endpoint)
  }

  handleCloseEndpointModal() {
    this.setState({ showEndpointModal: false })
  }

  handleCloseEndpointInUseModal() {
    this.setState({ showEndpointInUseModal: false })
  }

  handleDuplicateClick() {
    this.setState({ showDuplicateModal: true })
  }

  handleDuplicate(projectId: string) {
    let endpoint = this.getEndpoint()
    if (!endpoint) {
      return
    }

    this.setState({ duplicating: true })

    let shouldSwitchProject = projectId !== (userStore.loggedUser ? userStore.loggedUser.project.id : '')

    endpointStore.duplicate({
      shouldSwitchProject,
      endpoints: [endpoint],
      onSwitchProject: () => userStore.switchProject(projectId),
    }).then(() => {
      this.props.history.push('/endpoints')
    })
  }

  loadData() {
    projectStore.getProjects()

    endpointStore.getEndpoints().then(() => {
      let endpoint = this.getEndpoint()

      if (endpoint && endpoint.connection_info && endpoint.connection_info.secret_ref) {
        endpointStore.getConnectionInfo(endpoint)
      } else if (endpoint && endpoint.connection_info) {
        endpointStore.setConnectionInfo(endpoint.connection_info)
      }
    })

    Promise.all([replicaStore.getReplicas(), migrationStore.getMigrations()]).then(() => {
      this.setState({ endpointUsage: this.getEndpointUsage() })
    })
  }

  render() {
    let selectedProjectId = userStore.loggedUser ? userStore.loggedUser.project.id : ''

    let endpoint = this.getEndpoint()
    let dropdownActions = [{
      label: 'Validate',
      color: Palette.primary,
      action: () => { this.handleValidateClick() },
    }, {
      label: 'Edit',
      action: () => { this.handleEditClick() },

    }, {
      label: 'Duplicate',
      action: () => { this.handleDuplicateClick() },

    }, {
      label: 'Delete Endpoint',
      color: Palette.alert,
      action: () => { this.handleDeleteEndpointClick() },
    }]
    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={userStore.loggedUser}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          contentHeaderComponent={<DetailsContentHeader
            item={endpoint}
            backLink="/endpoints"
            onCancelClick={() => { }}
            dropdownActions={dropdownActions}
            typeImage={endpointImage}
            description={endpoint ? endpoint.description : ''}
          />}
          contentComponent={<EndpointDetailsContent
            item={endpoint}
            passwordFields={passwordFields}
            usage={this.state.endpointUsage}
            loading={endpointStore.connectionInfoLoading || endpointStore.loading}
            connectionInfo={endpointStore.connectionInfo}
            onDeleteClick={() => { this.handleDeleteEndpointClick() }}
            onValidateClick={() => { this.handleValidateClick() }}
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
            validation={endpointStore.validation}
            loading={endpointStore.validating}
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
              onDuplicateClick={projectId => { this.handleDuplicate(projectId) }}
            />
          </Modal>
        ) : null}
      </Wrapper>
    )
  }
}

export default EndpointDetailsPage
