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

import WizardTemplate from '../../templates/WizardTemplate'
import { DetailsPageHeader } from '../../organisms/DetailsPageHeader'
import WizardPageContent from '../../organisms/WizardPageContent'
import Modal from '../../molecules/Modal'
import Endpoint from '../../organisms/Endpoint'

import UserStore from '../../../stores/UserStore'
import ProviderStore from '../../../stores/ProviderStore'
import EndpointStore from '../../../stores/EndpointStore'
import WizardStore from '../../../stores/WizardStore'
import InstanceStore from '../../../stores/InstanceStore'
import NetworkStore from '../../../stores/NetworkStore'
import NotificationStore from '../../../stores/NotificationStore'
import ScheduleStore from '../../../stores/ScheduleStore'
import ReplicaStore from '../../../stores/ReplicaStore'
import KeyboardManager from '../../../utils/KeyboardManager'
import { wizardConfig, executionOptions } from '../../../config'
import type { MainItem } from '../../../types/MainItem'
import type { Endpoint as EndpointType } from '../../../types/Endpoint'
import type { Instance, Nic } from '../../../types/Instance'
import type { Field } from '../../../types/Field'
import type { Network } from '../../../types/Network'
import type { Schedule } from '../../../types/Schedule'
import type { WizardPage as WizardPageType } from '../../../types/WizardData'

const Wrapper = styled.div``

type Props = {
  match: any,
}
type WizardType = 'migration' | 'replica'
type State = {
  type: WizardType,
  showNewEndpointModal: boolean,
  nextButtonDisabled: boolean,
  newEndpointType?: string,
  newEndpointFromSource?: boolean,
}
@observer
class WizardPage extends React.Component<Props, State> {
  contentRef: WizardPageContent

  constructor() {
    super()

    this.state = {
      type: 'migration',
      showNewEndpointModal: false,
      nextButtonDisabled: false,
    }
  }

  componentWillMount() {
    WizardStore.getDataFromPermalink()
    let type = this.props.match && this.props.match.params.type
    if (type === 'migration' || type === 'replica') {
      this.setState({ type })
    }
  }

  componentDidMount() {
    document.title = 'Coriolis Wizard'
    KeyboardManager.onEnter('wizard', () => { this.handleEnterKey() })
    KeyboardManager.onEsc('wizard', () => { this.handleEscKey() })
  }

  componentWillUnmount() {
    WizardStore.clearData()
    KeyboardManager.removeKeyDown('wizard')
  }

  handleEnterKey() {
    if (this.contentRef && !this.contentRef.isNextButtonDisabled()) {
      this.handleNextClick()
    }
  }

  handleEscKey() {
    this.handleBackClick()
  }

  handleCreationSuccess(items: MainItem[]) {
    let typeLabel = this.state.type.charAt(0).toUpperCase() + this.state.type.substr(1)
    NotificationStore.notify(`${typeLabel} was succesfully created`, 'success', { persist: true, persistInfo: { title: `${typeLabel} created` } })
    let schedulePromise = Promise.resolve()

    if (this.state.type === 'replica') {
      items.forEach(replica => {
        this.executeCreatedReplica(replica)
        schedulePromise = this.scheduleReplica(replica)
      })
    }

    if (items.length === 1) {
      let location = `/#/${this.state.type}/`
      if (this.state.type === 'replica') {
        location += 'executions/'
      } else {
        location += 'tasks/'
      }
      schedulePromise.then(() => {
        window.location.href = location + items[0].id
      })
    } else {
      window.location.href = `/#/${this.state.type}s`
    }
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case 'signout':
        UserStore.logout()
        return
      case 'profile':
        window.location.href = '/#/profile'
        break
      default:
    }
  }

  handleTypeChange(isReplica: ?boolean) {
    this.setState({ type: isReplica ? 'replica' : 'migration' })
  }

  handleBackClick() {
    let pages = wizardConfig.pages.filter(p => !p.excludeFrom || p.excludeFrom !== this.state.type)
    let currentPageIndex = pages.findIndex(p => p.id === WizardStore.currentPage.id)

    if (currentPageIndex === 0) {
      window.history.back()
      return
    }

    let page = pages[currentPageIndex - 1]
    this.loadDataForPage(page)
    WizardStore.setCurrentPage(page)
  }

  handleNextClick() {
    let pages = wizardConfig.pages.filter(p => !p.excludeFrom || p.excludeFrom !== this.state.type)
    let currentPageIndex = pages.findIndex(p => p.id === WizardStore.currentPage.id)

    if (currentPageIndex === pages.length - 1) {
      this.create()
      return
    }

    let page = pages[currentPageIndex + 1]
    this.loadDataForPage(page)
    WizardStore.setCurrentPage(page)
  }

  handleSourceEndpointChange(source: EndpointType) {
    WizardStore.updateData({ source, selectedInstances: null, networks: null })
    WizardStore.setPermalink(WizardStore.data)
    // Preload instances for 'vms' page
    InstanceStore.loadInstances(source.id)
  }

  handleTargetEndpointChange(target: EndpointType) {
    WizardStore.updateData({ target, networks: null, options: null })
    WizardStore.setPermalink(WizardStore.data)
    // Preload destination options schema
    ProviderStore.loadOptionsSchema(target.type, this.state.type).then(() => {
      // Preload destination options values
      return ProviderStore.getDestinationOptions(target.id, target.type)
    })
  }

  handleAddEndpoint(newEndpointType: string, newEndpointFromSource: boolean) {
    this.setState({
      showNewEndpointModal: true,
      newEndpointType,
      newEndpointFromSource,
    })
  }

  handleCloseNewEndpointModal(options?: { autoClose?: boolean }) {
    if (options) {
      if (this.state.newEndpointFromSource) {
        WizardStore.updateData({ source: EndpointStore.endpoints[0] })
      } else {
        WizardStore.updateData({ target: EndpointStore.endpoints[0] })
      }
    }
    WizardStore.setPermalink(WizardStore.data)
    this.setState({ showNewEndpointModal: false })
  }

  handleInstancesSearchInputChange(searchText: string) {
    if (WizardStore.data.source) {
      InstanceStore.searchInstances(WizardStore.data.source.id, searchText)
    }
  }

  handleInstancesNextPageClick(searchText: string) {
    if (WizardStore.data.source) {
      InstanceStore.loadNextPage(WizardStore.data.source.id, searchText)
    }
  }

  handleInstancesPreviousPageClick() {
    InstanceStore.loadPreviousPage()
  }

  handleInstancesReloadClick(searchText: string) {
    if (WizardStore.data.source) {
      InstanceStore.reloadInstances(WizardStore.data.source.id, searchText)
    }
  }

  handleInstanceClick(instance: Instance) {
    WizardStore.updateData({ networks: null })
    WizardStore.toggleInstanceSelection(instance)
    WizardStore.setPermalink(WizardStore.data)
  }

  handleOptionsChange(field: Field, value: any) {
    WizardStore.updateData({ networks: null })
    WizardStore.updateOptions({ field, value })
    WizardStore.setPermalink(WizardStore.data)
  }

  handleNetworkChange(sourceNic: Nic, targetNetwork: Network) {
    WizardStore.updateNetworks({ sourceNic, targetNetwork })
    WizardStore.setPermalink(WizardStore.data)
  }

  handleAddScheduleClick(schedule: Schedule) {
    WizardStore.addSchedule(schedule)
    WizardStore.setPermalink(WizardStore.data)
  }

  handleScheduleChange(scheduleId: string, data: Schedule) {
    WizardStore.updateSchedule(scheduleId, data)
    WizardStore.setPermalink(WizardStore.data)
  }

  handleScheduleRemove(scheduleId: string) {
    WizardStore.removeSchedule(scheduleId)
    WizardStore.setPermalink(WizardStore.data)
  }

  loadDataForPage(page: WizardPageType) {
    switch (page.id) {
      case 'source': {
        ProviderStore.loadProviders()
        EndpointStore.getEndpoints()
        // Preload instances if data is set from 'Permalink'
        let source = WizardStore.data.source
        if (InstanceStore.instances.length === 0 && source) {
          InstanceStore.loadInstances(source.id)
        }
        break
      }
      case 'target': {
        // Preload destination options if data is set from 'Permalink'
        let target = WizardStore.data.target
        if (ProviderStore.destinationOptions.length === 0 && target) {
          ProviderStore.getDestinationOptions(target.id, target.type)
        }
        // Preload destination options schema
        if (ProviderStore.optionsSchema.length === 0 && target) {
          ProviderStore.loadOptionsSchema(target.type, this.state.type)
        }
        break
      }
      case 'networks':
        if (WizardStore.data.source && WizardStore.data.selectedInstances) {
          InstanceStore.loadInstancesDetails(WizardStore.data.source.id, WizardStore.data.selectedInstances)
        }
        if (WizardStore.data.target) {
          NetworkStore.loadNetworks(WizardStore.data.target.id, WizardStore.data.options)
        }
        break
      default:
    }
  }

  createMultiple() {
    let typeLabel = this.state.type.charAt(0).toUpperCase() + this.state.type.substr(1)
    NotificationStore.notify(`Creating ${typeLabel}s ...`)
    WizardStore.createMultiple(this.state.type, WizardStore.data).then(() => {
      let items = WizardStore.createdItems
      if (!items) {
        NotificationStore.notify(`${typeLabel}s couldn't be created`, 'error')
        this.setState({ nextButtonDisabled: false })
        return
      }
      this.handleCreationSuccess(items)
    })
  }

  createSingle() {
    let typeLabel = this.state.type.charAt(0).toUpperCase() + this.state.type.substr(1)
    NotificationStore.notify(`Creating ${typeLabel} ...`)
    WizardStore.create(this.state.type, WizardStore.data).then(() => {
      let item = WizardStore.createdItem
      if (!item) {
        NotificationStore.notify(`${typeLabel} couldn't be created`, 'error')
        this.setState({ nextButtonDisabled: false })
        return
      }
      this.handleCreationSuccess([item])
    })
  }

  separateVms() {
    let data = WizardStore.data
    let separateVms = true

    if (data.options && data.options.separate_vm !== null && data.options.separate_vm !== undefined) {
      separateVms = data.options.separate_vm
    }

    if (data.selectedInstances && data.selectedInstances.length === 1) {
      separateVms = false
    }

    if (separateVms) {
      this.createMultiple()
    } else {
      this.createSingle()
    }
  }

  create() {
    this.setState({ nextButtonDisabled: true })
    this.separateVms()
  }

  scheduleReplica(replica: MainItem): Promise<void> {
    let data = WizardStore.data

    if (!data.schedules || data.schedules.length === 0) {
      return Promise.resolve()
    }

    return ScheduleStore.scheduleMultiple(replica.id, data.schedules)
  }

  executeCreatedReplica(replica: MainItem) {
    let options = WizardStore.data.options
    let executeNow = true
    if (options && options.execute_now !== null && options.execute_now !== undefined) {
      executeNow = options.execute_now
    }
    if (!executeNow) {
      return
    }

    let executeNowOptions = executionOptions.map(field => {
      if (options && options[field.name] !== null && options[field.name] !== undefined) {
        return { name: field.name, value: options[field.name] }
      }
      return field
    })

    ReplicaStore.execute(replica.id, executeNowOptions)
  }

  render() {
    return (
      <Wrapper>
        <WizardTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={UserStore.user}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          pageContentComponent={<WizardPageContent
            page={WizardStore.currentPage}
            providerStore={ProviderStore}
            instanceStore={InstanceStore}
            networkStore={NetworkStore}
            endpoints={EndpointStore.endpoints}
            wizardData={WizardStore.data}
            nextButtonDisabled={this.state.nextButtonDisabled}
            type={this.state.type}
            onTypeChange={isReplica => { this.handleTypeChange(isReplica) }}
            onBackClick={() => { this.handleBackClick() }}
            onNextClick={() => { this.handleNextClick() }}
            onSourceEndpointChange={endpoint => { this.handleSourceEndpointChange(endpoint) }}
            onTargetEndpointChange={endpoint => { this.handleTargetEndpointChange(endpoint) }}
            onAddEndpoint={(type, fromSource) => { this.handleAddEndpoint(type, fromSource) }}
            onInstancesSearchInputChange={searchText => { this.handleInstancesSearchInputChange(searchText) }}
            onInstancesNextPageClick={searchText => { this.handleInstancesNextPageClick(searchText) }}
            onInstancesPreviousPageClick={() => { this.handleInstancesPreviousPageClick() }}
            onInstancesReloadClick={searchText => { this.handleInstancesReloadClick(searchText) }}
            onInstanceClick={instance => { this.handleInstanceClick(instance) }}
            onOptionsChange={(field, value) => { this.handleOptionsChange(field, value) }}
            onNetworkChange={(sourceNic, targetNetwork) => { this.handleNetworkChange(sourceNic, targetNetwork) }}
            onAddScheduleClick={schedule => { this.handleAddScheduleClick(schedule) }}
            onScheduleChange={(scheduleId, data) => { this.handleScheduleChange(scheduleId, data) }}
            onScheduleRemove={scheduleId => { this.handleScheduleRemove(scheduleId) }}
            onContentRef={ref => { this.contentRef = ref }}
          />}
        />
        <Modal
          isOpen={this.state.showNewEndpointModal}
          title="New Cloud Endpoint"
          onRequestClose={() => { this.handleCloseNewEndpointModal() }}
        >
          <Endpoint
            deleteOnCancel
            type={this.state.newEndpointType}
            onCancelClick={autoClose => { this.handleCloseNewEndpointModal(autoClose) }}
          />
        </Modal>
      </Wrapper>
    )
  }
}

export default WizardPage
