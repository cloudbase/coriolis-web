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

import DetailsTemplate from '../../modules/TemplateModule/DetailsTemplate/DetailsTemplate'
import DetailsPageHeader from '../../modules/DetailsModule/DetailsPageHeader/DetailsPageHeader'
import DetailsContentHeader from '../../modules/DetailsModule/DetailsContentHeader/DetailsContentHeader'
import Modal from '../../ui/Modal/Modal'
import AlertModal from '../../ui/AlertModal/AlertModal'

import type { Action as DropdownAction } from '../../ui/Dropdowns/ActionDropdown/ActionDropdown'

import userStore from '../../../stores/UserStore'
import endpointStore from '../../../stores/EndpointStore'
import notificationStore from '../../../stores/NotificationStore'

import configLoader from '../../../utils/Config'

import minionPoolImage from './images/minion-pool.svg'
import { ThemePalette } from '../../Theme'
import minionPoolStore from '../../../stores/MinionPoolStore'
import MinionPoolModal from '../../modules/MinionModule/MinionPoolModal/MinionPoolModal'
import MinionPoolDetailsContent from '../../modules/MinionModule/MinionPoolDetailsContent/MinionPoolDetailsContent'
import replicaStore from '../../../stores/ReplicaStore'
import migrationStore from '../../../stores/MigrationStore'
import MinionPoolConfirmationModal from '../../modules/MinionModule/MinionPoolConfirmationModal/MinionPoolConfirmationModal'
import providerStore from '../../../stores/ProviderStore'
import { Field } from '../../../@types/Field'

const Wrapper = styled.div<any>``

type Props = {
  match: { params: { id: string, page: string | null } },
  history: any,
}
type State = {
  showEditModal: boolean,
  showDeleteMinionPoolConfirmation: boolean,
  pausePolling: boolean,
  showDeallocateConfirmation: boolean
}

@observer
class MinionPoolDetailsPage extends React.Component<Props, State> {
  state: State = {
    showEditModal: false,
    showDeleteMinionPoolConfirmation: false,
    pausePolling: false,
    showDeallocateConfirmation: false,
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
    minionPoolStore.clearMinionPoolDetails()
    this.stopPolling = true
  }

  get minionPoolId() {
    if (!this.props.match || !this.props.match.params || !this.props.match.params.id) {
      throw new Error('Invalid minion pool id')
    }
    return this.props.match.params.id
  }

  get minionPool() {
    return minionPoolStore.minionPoolDetails
  }

  get envData() {
    return this.getSchemaData(minionPoolStore.minionPoolEnvSchema, minionPoolStore.minionPoolDetails?.environment_options)
  }

  get editableData() {
    const envData = this.envData
    const defaultData = this.getSchemaData(minionPoolStore.minionPoolDefaultSchema, minionPoolStore.minionPoolDetails)
    return defaultData || envData ? { ...defaultData, ...envData } : null
  }

  getSchemaData(schema: Field[], data: any | null) {
    let schemaData: any = null
    const details: any = data || {}
    Object.keys(details).forEach(prop => {
      if (schema.find(f => f.name === prop)) {
        schemaData = schemaData || {}
        schemaData[prop] = details[prop]
      }
    })
    return schemaData
  }

  async loadMinionPool(minionPoolId?: string) {
    const usableId = minionPoolId || this.minionPoolId
    await Promise.all([
      endpointStore.getEndpoints({ showLoading: true }),
      minionPoolStore.loadMinionPoolDetails(this.minionPoolId, { showLoading: true }),
      replicaStore.getReplicas(),
      migrationStore.getMigrations(),
    ])
    const minionPool = this.minionPool
    if (!minionPool) {
      notificationStore.alert(`Minion pool with ID '${usableId}' was not found`, 'error')
      return
    }

    const endpoint = endpointStore.endpoints
      .find(e => e.id === minionPool.endpoint_id)
    if (!endpoint) {
      notificationStore.alert('The endpoint associated to this minion pool was not found', 'error')
      return
    }
    await minionPoolStore.loadMinionPoolSchema(
      endpoint.type,
      minionPool.platform,
    )
    await providerStore.loadProviders()
    await minionPoolStore.loadOptions({
      providers: providerStore.providers!,
      endpoint,
      optionsType: minionPool.platform,
      useCache: true,
      envData: this.envData,
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

  handleDeleteMinionPoolClick() {
    this.setState({ showDeleteMinionPoolConfirmation: true })
  }

  handleDeleteMinionPool() {
    this.setState({ showDeleteMinionPoolConfirmation: false })
    this.props.history.push('/minion-pools')
    minionPoolStore.deleteMinionPool(this.minionPool!.id)
  }

  handleMinionPoolEditClick() {
    this.setState({ showEditModal: true, pausePolling: true })
  }

  async pollData(showLoading: boolean) {
    if (this.state.pausePolling || this.stopPolling) {
      return
    }

    await Promise.all([
      minionPoolStore.loadMinionPoolDetails(this.minionPoolId, {
        showLoading,
        skipLog: true,
      }),
      replicaStore.getReplicas(),
      migrationStore.getMigrations(),
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

  async handleAllocate() {
    if (!this.minionPool) {
      return
    }
    notificationStore.alert('Allocating minion pool...')
    await minionPoolStore.runAction(this.minionPool.id, 'allocate')
    await minionPoolStore.loadMinionPoolDetails(this.minionPool.id)
  }

  handleDeallocate() {
    this.setState({
      showDeallocateConfirmation: true,
    })
  }

  async handleRefresh() {
    if (!this.minionPool) {
      return
    }
    notificationStore.alert('Refreshing minion pool...')
    await minionPoolStore.runAction(this.minionPool.id, 'refresh')
    await minionPoolStore.loadMinionPoolDetails(this.minionPool.id)
    this.props.history.push(`/minion-pools/${this.minionPool.id}/machines`)
  }

  async handleDeallocateConfirmation(force: boolean) {
    this.setState({
      showDeallocateConfirmation: false,
    })
    if (!this.minionPool) {
      return
    }
    notificationStore.alert('Deallocating minion pool...')
    await minionPoolStore.runAction(this.minionPool.id, 'deallocate', { force })
    await minionPoolStore.loadMinionPoolDetails(this.minionPool.id)
  }

  renderEditMinionPool() {
    if (!this.state.showEditModal) {
      return null
    }
    const endpoint = endpointStore.endpoints
      .find(e => e.id === this.minionPool?.endpoint_id)
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
          editableData={this.editableData}
          minionPool={this.minionPool}
          platform={this.minionPool?.platform || 'source'}
          onUpdateComplete={r => { this.handleUpdateComplete(r) }}
        />
      </Modal>
    )
  }

  render() {
    const status = this.minionPool?.status
    const deallocated = status === 'DEALLOCATED'
    const allocated = status === 'ALLOCATED'
    const error = status === 'ERROR'

    const dropdownActions: DropdownAction[] = [
      {
        label: 'Edit',
        action: () => { this.handleMinionPoolEditClick() },
        disabled: !deallocated,
        title: !deallocated ? 'The minion pool should be deallocated' : '',
      },
      {
        label: 'Allocate',
        color: ThemePalette.primary,
        action: () => { this.handleAllocate() },
        disabled: !deallocated,
        title: !deallocated ? 'The minion pool should be deallocated' : '',
      },
      {
        label: 'Deallocate',
        action: () => {
          this.handleDeallocate()
        },
        disabled: !allocated && !error,
        title: !allocated && !error ? 'The minion pool should be allocated' : '',
      },
      {
        label: 'Refresh',
        action: () => {
          this.handleRefresh()
        },
        disabled: !allocated,
        title: !allocated ? 'The minion pool should be allocated' : '',
      },
      {
        label: 'Delete Minion Pool',
        color: ThemePalette.alert,
        action: () => {
          this.setState({ showDeleteMinionPoolConfirmation: true })
        },
        disabled: !deallocated && !error,
        title: (!deallocated && !error) ? 'The minion pool should be deallocated' : '',
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
              statusPill={this.minionPool?.status}
              itemTitle={this.minionPool?.name}
              itemType="minion pool"
              dropdownActions={dropdownActions}
              largeDropdownActionItems
              backLink="/minion-pools"
              typeImage={minionPoolImage}
            />
          )}
          contentComponent={(
            <MinionPoolDetailsContent
              item={this.minionPool}
              itemId={this.minionPoolId}
              replicas={replicaStore.replicas
                .filter(r => r.origin_minion_pool_id === this.minionPool?.id
                  || r.destination_minion_pool_id === this.minionPool?.id)}
              migrations={migrationStore.migrations
                .filter(r => r.origin_minion_pool_id === this.minionPool?.id
                  || r.destination_minion_pool_id === this.minionPool?.id)}
              endpoints={endpointStore.endpoints}
              schema={minionPoolStore.minionPoolCombinedSchema}
              schemaLoading={minionPoolStore.loadingMinionPoolSchema
                || minionPoolStore.optionsPrimaryLoading
                || providerStore.providersLoading
                || minionPoolStore.optionsSecondaryLoading}
              page={this.props.match.params.page || ''}
              loading={minionPoolStore.loadingMinionPoolDetails}
              onDeleteMinionPoolClick={() => { this.handleDeleteMinionPoolClick() }}
              onAllocate={() => { this.handleAllocate() }}
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
        {this.state.showDeallocateConfirmation ? (
          <MinionPoolConfirmationModal
            onCancelClick={() => { this.setState({ showDeallocateConfirmation: false }) }}
            onExecuteClick={force => { this.handleDeallocateConfirmation(force) }}
          />
        ) : null}
        {this.renderEditMinionPool()}
      </Wrapper>
    )
  }
}

export default MinionPoolDetailsPage
