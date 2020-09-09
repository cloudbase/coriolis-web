/*
Copyright (C) 2020  Cloudbase Solutions SRL
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

import DetailsTemplate from '../../templates/DetailsTemplate/DetailsTemplate'
import DetailsPageHeader from '../../organisms/DetailsPageHeader/DetailsPageHeader'
import DetailsContentHeader from '../../organisms/DetailsContentHeader/DetailsContentHeader'
import Modal from '../../molecules/Modal/Modal'
import AlertModal from '../../organisms/AlertModal/AlertModal'

import type { Execution } from '../../../@types/Execution'
import type { Action as DropdownAction } from '../../molecules/ActionDropdown/ActionDropdown'

import userStore from '../../../stores/UserStore'
import endpointStore from '../../../stores/EndpointStore'
import notificationStore from '../../../stores/NotificationStore'

import configLoader from '../../../utils/Config'

import minionPoolImage from './images/minion-pool.svg'
import Palette from '../../styleUtils/Palette'
import ObjectUtils from '../../../utils/ObjectUtils'
import minionPoolStore, { MinionPoolAction } from '../../../stores/MinionPoolStore'
import MinionPoolModal from '../../organisms/MinionPoolModal/MinionPoolModal'
import MinionPoolDetailsContent from '../../organisms/MinionPoolDetailsContent/MinionPoolDetailsContent'
import replicaStore from '../../../stores/ReplicaStore'
import migrationStore from '../../../stores/MigrationStore'

const Wrapper = styled.div<any>``

type Props = {
  match: { params: { id: string, page: string | null } },
  history: any,
}
type State = {
  showEditModal: boolean,
  showDeleteMinionPoolConfirmation: boolean,
  showCancelConfirmation: boolean
  forceCancel: boolean,
  confirmationExecution: Execution | null,
  pausePolling: boolean,
}

@observer
class MinionPoolDetailsPage extends React.Component<Props, State> {
  state: State = {
    showEditModal: false,
    showDeleteMinionPoolConfirmation: false,
    confirmationExecution: null,
    showCancelConfirmation: false,
    pausePolling: false,
    forceCancel: false,
  }

  stopPolling: boolean | null = null

  componentDidMount() {
    document.title = 'Minion Pool Details'

    this.loadMinionPool()

    this.pollData(true)
  }

  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (newProps.match.params.id !== this.props.match.params.id) {
      this.loadMinionPool(newProps.match.params.id)
    }
  }

  componentWillUnmount() {
    this.stopPolling = true
    minionPoolStore.clearMinionPoolDetails()
  }

  get minionPoolId() {
    if (!this.props.match || !this.props.match.params || !this.props.match.params.id) {
      throw new Error('Invalid minion pool id')
    }
    return this.props.match.params.id
  }

  getStatus() {
    return minionPoolStore.minionPoolDetails?.pool_status
  }

  async loadMinionPool(minionPoolId?: string) {
    await Promise.all([
      endpointStore.getEndpoints({ showLoading: true }),
      minionPoolStore
        .loadMinionPoolDetails(minionPoolId || this.minionPoolId, { showLoading: true }),
    ])
    const endpoint = endpointStore.endpoints
      .find(e => e.id === minionPoolStore.minionPoolDetails?.endpoint_id)
    if (!endpoint) {
      return
    }
    await minionPoolStore.loadMinionPoolSchema(
      endpoint.type,
      minionPoolStore.minionPoolDetails!.pool_platform,
    )
    await minionPoolStore.loadEnvOptions(
      endpoint.id,
      endpoint.type,
      minionPoolStore.minionPoolDetails!.pool_platform,
      { useCache: true },
    )
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case 'signout':
        userStore.logout()
        break
      default:
    }
  }

  handleCancelExecutionConfirmation() {
    if (!minionPoolStore.minionPoolDetails) {
      return
    }
    minionPoolStore.cancelExecution(
      minionPoolStore.minionPoolDetails.id,
      this.state.forceCancel,
      this.state.confirmationExecution?.id,
    )

    this.handleCloseCancelConfirmation()
  }

  handleDeleteMinionPoolClick() {
    this.setState({ showDeleteMinionPoolConfirmation: true })
  }

  handleDeleteMinionPool() {
    this.setState({ showDeleteMinionPoolConfirmation: false })
    this.props.history.push('/replicas')
    minionPoolStore.deleteMinionPool(minionPoolStore.minionPoolDetails!.id)
  }

  handleCloseDeleteMinionPoolConfirmation() {
    this.setState({ showDeleteMinionPoolConfirmation: false })
  }

  handleMinionPoolEditClick() {
    this.setState({ showEditModal: true, pausePolling: true })
  }

  handleCancelExecution(confirmationExecution: Execution | null, force?: boolean) {
    this.setState({
      showCancelConfirmation: true,
      confirmationExecution,
      forceCancel: force || false,
    })
  }

  handleCloseCancelConfirmation() {
    this.setState({
      showCancelConfirmation: false,
    })
  }

  async pollData(showLoading: boolean) {
    if (this.state.pausePolling || this.stopPolling) {
      return
    }

    await Promise.all([
      minionPoolStore.loadMinionPoolDetails(this.minionPoolId, {
        showLoading, skipLog: true,
      }),
      (async () => {
        if (window.location.pathname.indexOf('executions') > -1) {
          await minionPoolStore.loadExecutionTasks({
            minionPoolId: this.minionPoolId,
            skipLog: true,
          })
        }
      })(),
    ])

    setTimeout(() => { this.pollData(false) }, configLoader.config.requestPollTimeout)
  }

  closeEditModal() {
    this.setState({ showEditModal: false, pausePolling: false }, () => {
      this.pollData(false)
    })
  }

  handleUpdateComplete(redirectTo: string) {
    this.props.history.push(redirectTo)
    this.closeEditModal()
  }

  async handleExecutionChange(executionId: string) {
    await ObjectUtils.waitFor(() => Boolean(minionPoolStore.minionPoolDetails))
    if (!minionPoolStore.minionPoolDetails?.id) {
      return
    }
    minionPoolStore.loadExecutionTasks(
      {
        minionPoolId: minionPoolStore.minionPoolDetails.id,
        executionId,
      },
    )
  }

  async handleAction(action: MinionPoolAction) {
    const runAction = async (message: string) => {
      if (!minionPoolStore.minionPoolDetails) {
        return
      }
      notificationStore.alert(message)
      await minionPoolStore.runAction(minionPoolStore.minionPoolDetails.id, action)
      await minionPoolStore.loadMinionPoolDetails(minionPoolStore.minionPoolDetails.id)
    }

    switch (action) {
      case 'set-up-shared-resources':
        runAction('Setting up shared resources...')
        break
      case 'tear-down-shared-resources':
        runAction('Tearing up shared resources...')
        break
      case 'allocate-machines':
        runAction('Allocating machines...')
        break
      case 'deallocate-machines':
        runAction('Deallocating machines...')
        break
      default:
    }
  }

  renderEditMinionPool() {
    if (!this.state.showEditModal) {
      return null
    }
    const endpoint = endpointStore.endpoints
      .find(e => e.id === minionPoolStore.minionPoolDetails?.endpoint_id)
    if (!endpoint) {
      return null
    }
    return (
      <Modal
        isOpen
        title="Update Minion Pool"
        onRequestClose={() => { this.closeEditModal() }}
      >
        <MinionPoolModal
          cancelButtonText="Close"
          endpoint={endpoint}
          onCancelClick={() => { this.closeEditModal() }}
          onRequestClose={() => { this.closeEditModal() }}
          minionPool={minionPoolStore.minionPoolDetails}
          platform={minionPoolStore.minionPoolDetails?.pool_platform || 'source'}
          onUpdateComplete={r => { this.handleUpdateComplete(r) }}
        />
      </Modal>
    )
  }

  render() {
    const uninitialized = minionPoolStore.minionPoolDetails?.pool_status === 'UNINITIALIZED'
    const deallocated = minionPoolStore.minionPoolDetails?.pool_status === 'DEALLOCATED'
    const allocated = minionPoolStore.minionPoolDetails?.pool_status === 'ALLOCATED'
    const isRunning = minionPoolStore.minionPoolDetails?.pool_status?.indexOf('ING') === ((minionPoolStore.minionPoolDetails?.pool_status?.length || -100) - 3)

    const dropdownActions: DropdownAction[] = [
      {
        label: 'Edit',
        action: () => { this.handleMinionPoolEditClick() },
        disabled: !uninitialized,
        title: !uninitialized ? 'The minion pool should be uninitialized' : '',
      },
      {
        label: 'Setup shared resources',
        color: Palette.primary,
        action: () => {
          this.handleAction('set-up-shared-resources')
        },
        disabled: !uninitialized,
        title: !uninitialized ? 'The minion pool should be uninitialized' : '',
      },
      {
        label: 'Tear down shared resources',
        action: () => {
          this.handleAction('tear-down-shared-resources')
        },
        disabled: !deallocated,
        title: !deallocated ? 'The minion pool should be deallocated' : '',
      },
      {
        label: 'Allocate Machines',
        color: Palette.primary,
        action: () => {
          this.handleAction('allocate-machines')
        },
        disabled: !deallocated,
        title: !deallocated ? 'The minion pool should be deallocated' : '',
      },
      {
        label: 'Deallocate Machines',
        action: () => {
          this.handleAction('deallocate-machines')
        },
        disabled: !allocated,
        title: !allocated ? 'The minion pool should be allocated' : '',
      },
      {
        label: 'Cancel Execution',
        action: () => {
          this.setState({
            showCancelConfirmation: true,
            confirmationExecution: null,
            forceCancel: false,
          })
        },
        disabled: !isRunning,
        title: !isRunning ? 'The minion pool do not have an active execution' : '',
      },
      {
        label: 'Delete Minion Pool',
        color: Palette.alert,
        action: () => {
          this.setState({ showDeleteMinionPoolConfirmation: true })
        },
        disabled: !uninitialized,
        title: !uninitialized ? 'The minion pool should be uninitialized' : '',
      },
    ]

    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={(
            <DetailsPageHeader
              user={userStore.loggedUser}
              onUserItemClick={item => { this.handleUserItemClick(item) }}
            />
)}
          contentHeaderComponent={(
            <DetailsContentHeader
              statusPill={minionPoolStore.minionPoolDetails?.pool_status}
              itemTitle={minionPoolStore.minionPoolDetails?.pool_name}
              itemType="minion pool"
              dropdownActions={dropdownActions}
              largeDropdownActionItems
              backLink="/minion-pools"
              typeImage={minionPoolImage}
            />
)}
          contentComponent={(
            <MinionPoolDetailsContent
              item={minionPoolStore.minionPoolDetails}
              replicas={replicaStore.replicas
                .filter(r => r.origin_minion_pool_id === minionPoolStore.minionPoolDetails?.id
                  || r.destination_minion_pool_id === minionPoolStore.minionPoolDetails?.id)}
              migrations={migrationStore.migrations
                .filter(r => r.origin_minion_pool_id === minionPoolStore.minionPoolDetails?.id
                  || r.destination_minion_pool_id === minionPoolStore.minionPoolDetails?.id)}
              endpoints={endpointStore.endpoints}
              detailsLoading={minionPoolStore.loadingMinionPoolDetails || endpointStore.loading}
              schema={minionPoolStore.minionPoolCombinedSchema}
              schemaLoading={minionPoolStore.loadingMinionPoolSchema
                || minionPoolStore.loadingEnvOptions}
              executionsLoading={minionPoolStore.loadingMinionPoolDetails}
              onExecutionChange={id => { this.handleExecutionChange(id) }}
              executions={minionPoolStore.minionPoolDetails?.executions || []}
              executionsTasksLoading={minionPoolStore.loadingMinionPoolDetails
                || minionPoolStore.loadingExecutionsTasks}
              executionsTasks={minionPoolStore.executionsTasks}
              page={this.props.match.params.page || ''}
              onCancelExecutionClick={(e, f) => { this.handleCancelExecution(e, f) }}
              onDeleteMinionPoolClick={() => { this.handleDeleteMinionPoolClick() }}
              onRunAction={a => { this.handleAction(a) }}
            />
          )}
        />
        {this.state.showDeleteMinionPoolConfirmation ? (
          <AlertModal
            isOpen
            title="Delete Minion Pool?"
            message="Are you sure you want to delete the Minion Pool"
            extraMessage="Deleting a Coriolis Minion Pool is permanent!"
            onConfirmation={() => { this.handleDeleteMinionPool() }}
            onRequestClose={() => { this.setState({ showDeleteMinionPoolConfirmation: false }) }}
          />
        ) : null}
        <AlertModal
          isOpen={this.state.showCancelConfirmation}
          title="Cancel Execution?"
          message="Are you sure you want to cancel the current execution?"
          extraMessage=" "
          onConfirmation={() => { this.handleCancelExecutionConfirmation() }}
          onRequestClose={() => { this.handleCloseCancelConfirmation() }}
        />
        {this.renderEditMinionPool()}
      </Wrapper>
    )
  }
}

export default MinionPoolDetailsPage
