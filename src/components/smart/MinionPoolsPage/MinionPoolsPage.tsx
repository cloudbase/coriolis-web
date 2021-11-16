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

import { RouteComponentProps } from 'react-router-dom'

import Modal from '@src/components/ui/Modal/Modal'
import MainTemplate from '@src/components/modules/TemplateModule/MainTemplate/MainTemplate'
import Navigation from '@src/components/modules/NavigationModule/Navigation/Navigation'
import FilterList from '@src/components/ui/Lists/FilterList/FilterList'
import PageHeader from '@src/components/ui/PageHeader/PageHeader'

import type { Action as DropdownAction } from '@src/components/ui/Dropdowns/ActionDropdown/ActionDropdown'

import projectStore from '@src/stores/ProjectStore'

import configLoader from '@src/utils/Config'
import { MinionPool } from '@src/@types/MinionPool'

import providerStore from '@src/stores/ProviderStore'
import endpointStore from '@src/stores/EndpointStore'
import minionPoolStore from '@src/stores/MinionPoolStore'
import { Endpoint } from '@src/@types/Endpoint'
import MinionEndpointModal from '@src/components/modules/MinionModule/MinionEndpointModal/MinionEndpointModal'
import MinionPoolModal from '@src/components/modules/MinionModule/MinionPoolModal/MinionPoolModal'
import MinionPoolListItem from '@src/components/modules/MinionModule/MinionPoolListItem/MinionPoolListItem'
import { ThemePalette } from '@src/components/Theme'
import AlertModal from '@src/components/ui/AlertModal/AlertModal'
import MinionPoolConfirmationModal from '@src/components/modules/MinionModule/MinionPoolConfirmationModal/MinionPoolConfirmationModal'
import notificationStore from '@src/stores/NotificationStore'
import ObjectUtils from '@src/utils/ObjectUtils'
import emptyListImage from './images/minion-pool-empty-list.svg'

const Wrapper = styled.div<any>``

type State = {
  modalIsOpen: boolean,
  selectedMinionPools: MinionPool[],
  showChooseMinionEndpointModal: boolean,
  showMinionPoolModal: boolean,
  selectedMinionPoolEndpoint: Endpoint | null
  showDeletePoolsModal: boolean,
  showDeallocateConfirmation: boolean,
  selectedMinionPoolPlatform: 'source' | 'destination'
}

@observer
class MinionPoolsPage extends React.Component<RouteComponentProps, State> {
  state: State = {
    modalIsOpen: false,
    selectedMinionPools: [],
    showChooseMinionEndpointModal: false,
    selectedMinionPoolEndpoint: null,
    showMinionPoolModal: false,
    showDeletePoolsModal: false,
    showDeallocateConfirmation: false,
    selectedMinionPoolPlatform: 'source',
  }

  pollTimeout: number = 0

  stopPolling: boolean = false

  componentDidMount() {
    document.title = 'Coriolis Minion Pools'

    projectStore.getProjects()
    endpointStore.getEndpoints()
    this.stopPolling = false
    this.pollData(minionPoolStore.minionPools.length === 0)
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout)
    this.stopPolling = true
  }

  getFilterItems() {
    return [
      { label: 'All', value: 'all' },
      { label: 'Allocated', value: 'ALLOCATED' },
      { label: 'Allocating', value: 'ALLOCATING_MACHINES' },
      { label: 'Deallocated', value: 'DEALLOCATED' },
      { label: 'Deallocating', value: 'DEALLOCATING_MACHINES' },
      { label: 'Error', value: 'ERROR' },
    ]
  }

  getMinionsThatCanBe(action: 'allocated' | 'deallocated' | 'refreshed' | 'deleted'): MinionPool[] {
    const minions = this.state.selectedMinionPools
    switch (action) {
      case 'allocated':
        return minions.filter(minion => minion.status === 'DEALLOCATED')
      case 'deallocated':
        return minions.filter(minion => minion.status === 'ALLOCATED' || minion.status === 'ERROR')
      case 'refreshed':
        return minions.filter(minion => minion.status === 'ALLOCATED')
      default:
        return minions.filter(minion => minion.status === 'DEALLOCATED' || minion.status === 'ERROR')
    }
  }

  getEndpoint(endpointId: string) {
    return endpointStore.endpoints.find(endpoint => endpoint.id === endpointId)
  }

  async pollData(showLoading: boolean) {
    if (this.state.modalIsOpen || this.stopPolling) {
      return
    }

    await Promise.all([
      minionPoolStore.loadMinionPools({ showLoading }),
    ])

    this.pollTimeout = window.setTimeout(() => {
      this.pollData(false)
    }, configLoader.config.requestPollTimeout)
  }

  searchText(item: MinionPool, text?: string | null) {
    const result = false
    if (item.name.toLowerCase().indexOf(text || '') > -1) {
      return true
    }
    return result
  }

  itemFilterFunction(item: MinionPool, filterStatus?: string | null, filterText?: string) {
    if ((filterStatus !== 'all' && item.status !== filterStatus)
      || !this.searchText(item, filterText)
    ) {
      return false
    }

    return true
  }

  deleteSelectedMinionPools() {
    const pools = this.getMinionsThatCanBe('deleted')
    pools.forEach(pool => {
      minionPoolStore.deleteMinionPool(pool.id)
    })
    this.setState({ showDeletePoolsModal: false })
  }

  handleProjectChange() {
    projectStore.getProjects()
    endpointStore.getEndpoints()
    minionPoolStore.loadMinionPools({ showLoading: true })
  }

  handleItemClick(item: MinionPool) {
    this.props.history.push(`/minion-pools/${item.id}`)
  }

  handleReloadButtonClick() {
    projectStore.getProjects()
    endpointStore.getEndpoints()
    minionPoolStore.loadMinionPools({ showLoading: true })
  }

  handleEmptyListButtonClick() {
    providerStore.loadProviders()
    endpointStore.getEndpoints({ showLoading: true })
    this.setState({ showChooseMinionEndpointModal: true, modalIsOpen: true })
  }

  handleCloseChooseMinionPoolEndpointModal() {
    this.setState({
      showChooseMinionEndpointModal: false,
      modalIsOpen: false,
    }, () => { this.pollData(false) })
  }

  handleBackMinionPoolModal() {
    this.setState({
      showChooseMinionEndpointModal: true,
      showMinionPoolModal: false,
    })
  }

  handleCloseMinionPoolModalRequest() {
    this.setState({
      showMinionPoolModal: false,
      modalIsOpen: false,
    }, () => { this.pollData(false) })
  }

  handleChooseMinionPoolSelectEndpoint(selectedMinionPoolEndpoint: Endpoint, platform: 'source' | 'destination') {
    this.setState({
      showChooseMinionEndpointModal: false,
      showMinionPoolModal: true,
      selectedMinionPoolEndpoint,
      selectedMinionPoolPlatform: platform,
    })
  }

  handleModalOpen() {
    this.setState({ modalIsOpen: true })
  }

  handleModalClose() {
    this.setState({ modalIsOpen: false }, () => {
      this.pollData(false)
    })
  }

  async handleAllocate() {
    const pools = this.getMinionsThatCanBe('allocated')

    const plural = pools.length === 1 ? '' : 's'
    notificationStore.alert(`Allocating minion pool${plural}...`)
    await Promise.all(pools.map(minionPool => minionPoolStore.runAction(minionPool.id, 'allocate')))
    await minionPoolStore.loadMinionPools()
  }

  handleDeallocate() {
    this.setState({
      showDeallocateConfirmation: true,
    })
  }

  async handleDeallocateConfirmation(force: boolean) {
    this.setState({
      showDeallocateConfirmation: false,
    })
    const pools = this.getMinionsThatCanBe('deallocated')
    const plural = pools.length === 1 ? '' : 's'
    notificationStore.alert(`Deallocating minion pool${plural}...`)
    await Promise.all(pools.map(minionPool => minionPoolStore.runAction(minionPool.id, 'deallocate', { force })))
    await minionPoolStore.loadMinionPools()
  }

  async handleRefreshAction() {
    const pools = this.getMinionsThatCanBe('refreshed')
    const plural = pools.length === 1 ? '' : 's'
    notificationStore.alert(`Refreshing minion pool${plural}...`)
    await Promise.all(pools.map(minionPool => minionPoolStore.runAction(minionPool.id, 'refresh')))
    await minionPoolStore.loadMinionPools()
  }

  render() {
    const canBeAllocated = this.getMinionsThatCanBe('allocated').length > 0
    const canBeDeallocated = this.getMinionsThatCanBe('deallocated').length > 0
    const canBeRefreshed = this.getMinionsThatCanBe('refreshed').length > 0
    const canBeDeleted = this.getMinionsThatCanBe('deleted').length > 0

    const BulkActions: DropdownAction[] = [
      {
        label: 'Allocate',
        color: ThemePalette.primary,
        action: () => { this.handleAllocate() },
        disabled: !canBeAllocated,
        title: !canBeAllocated ? 'The minion pool should be deallocated' : '',
      },
      {
        label: 'Deallocate',
        action: () => {
          this.handleDeallocate()
        },
        disabled: !canBeDeallocated,
        title: !canBeDeallocated ? 'The minion pool should be allocated' : '',
      },
      {
        label: 'Refresh',
        action: () => {
          this.handleRefreshAction()
        },
        disabled: !canBeRefreshed,
        title: !canBeRefreshed ? 'The minion pool should be allocated' : '',
      },
      {
        label: 'Delete Minion Pools',
        color: ThemePalette.alert,
        action: () => {
          this.setState({ showDeletePoolsModal: true })
        },
        disabled: !canBeDeleted,
        title: !canBeDeleted ? 'The minion pool should be deallocated' : '',
      },
    ]

    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="minion-pools" />}
          listComponent={(
            <FilterList
              filterItems={this.getFilterItems()}
              selectionLabel="minion pool"
              loading={minionPoolStore.loadingMinionPools}
              items={minionPoolStore.minionPools}
              dropdownActions={BulkActions}
              largeDropdownActionItems
              onItemClick={item => { this.handleItemClick(item) }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              onSelectedItemsChange={selectedMinionPools => {
                this.setState({ selectedMinionPools })
              }}
              renderItemComponent={options => (
                <MinionPoolListItem
                  {...options}
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
                />
              )}
              emptyListImage={emptyListImage}
              emptyListMessage="It seems like you don’t have any Minion Pools in this project."
              emptyListExtraMessage="A minion pool defines a set of machines to be created on a certain endpoint with a certain set of options. These machines can then be used during Migrations/Replicas to avoid having to create/delete them during each transfer, thus reducing the time duration."
              emptyListButtonLabel="Create a Minion Pool"
              onEmptyListButtonClick={() => { this.handleEmptyListButtonClick() }}
            />
          )}
          headerComponent={(
            <PageHeader
              title="Coriolis Minion Pools"
              onProjectChange={() => { this.handleProjectChange() }}
              onModalOpen={() => { this.handleModalOpen() }}
              onModalClose={() => { this.handleModalClose() }}
            />
          )}
        />
        {this.state.showChooseMinionEndpointModal ? (
          <MinionEndpointModal
            providers={providerStore.providers}
            endpoints={endpointStore.endpoints}
            loading={providerStore.providersLoading || endpointStore.loading}
            onRequestClose={() => { this.handleCloseChooseMinionPoolEndpointModal() }}
            onSelectEndpoint={(endpoint, platform) => {
              this.handleChooseMinionPoolSelectEndpoint(endpoint, platform)
            }}
          />
        ) : null}
        {this.state.showMinionPoolModal ? (
          <Modal
            isOpen
            title={`New ${ObjectUtils.capitalizeFirstLetter(this.state.selectedMinionPoolPlatform)} Minion Pool`}
            onRequestClose={() => { this.handleCloseMinionPoolModalRequest() }}
          >
            <MinionPoolModal
              platform={this.state.selectedMinionPoolPlatform}
              cancelButtonText="Back"
              endpoint={this.state.selectedMinionPoolEndpoint!}
              onCancelClick={() => { this.handleBackMinionPoolModal() }}
              onRequestClose={() => { this.handleCloseMinionPoolModalRequest() }}
            />
          </Modal>
        ) : null}
        {this.state.showDeletePoolsModal ? (
          <AlertModal
            isOpen
            title="Delete Minion Pools?"
            message="Are you sure you want to delete the selected Minion Pools?"
            extraMessage="Deleting a Coriolis Minion Pool is permanent!"
            onConfirmation={() => { this.deleteSelectedMinionPools() }}
            onRequestClose={() => { this.setState({ showDeletePoolsModal: false }) }}
          />
        ) : null}
        {this.state.showDeallocateConfirmation ? (
          <MinionPoolConfirmationModal
            onCancelClick={() => { this.setState({ showDeallocateConfirmation: false }) }}
            onExecuteClick={force => { this.handleDeallocateConfirmation(force) }}
          />
        ) : null}
      </Wrapper>
    )
  }
}

export default MinionPoolsPage
