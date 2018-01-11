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
import connectToStores from 'alt-utils/lib/connectToStores'
import PropTypes from 'prop-types'

import {
  WizardTemplate,
  DetailsPageHeader,
  WizardPageContent,
  Modal,
  Endpoint,
} from 'components'

import UserStore from '../../../stores/UserStore'
import UserActions from '../../../actions/UserActions'
import ProviderActions from '../../../actions/ProviderActions'
import ProviderStore from '../../../stores/ProviderStore'
import EndpointActions from '../../../actions/EndpointActions'
import EndpointStore from '../../../stores/EndpointStore'
import WizardStore from '../../../stores/WizardStore'
import WizardActions from '../../../actions/WizardActions'
import InstanceStore from '../../../stores/InstanceStore'
import InstanceActions from '../../../actions/InstanceActions'
import NetworkStore from '../../../stores/NetworkStore'
import NetworkActions from '../../../actions/NetworkActions'
import NotificationActions from '../../../actions/NotificationActions'
import ReplicaActions from '../../../actions/ReplicaActions'
import ScheduleActions from '../../../actions/ScheduleActions'
import ScheduleStore from '../../../stores/ScheduleStore'
import Wait from '../../../utils/Wait'
import { wizardConfig, executionOptions } from '../../../config'

const Wrapper = styled.div``

class WizardPage extends React.Component {
  static propTypes = {
    userStore: PropTypes.object,
    wizardStore: PropTypes.object,
    providerStore: PropTypes.object,
    endpointStore: PropTypes.object,
    instanceStore: PropTypes.object,
    networkStore: PropTypes.object,
    match: PropTypes.object,
  }

  static getStores() {
    return [UserStore, WizardStore, ProviderStore, EndpointStore, InstanceStore, NetworkStore]
  }

  static getPropsFromStores() {
    return {
      userStore: UserStore.getState(),
      wizardStore: WizardStore.getState(),
      providerStore: ProviderStore.getState(),
      endpointStore: EndpointStore.getState(),
      instanceStore: InstanceStore.getState(),
      networkStore: NetworkStore.getState(),
    }
  }

  constructor() {
    super()

    this.state = {
      type: 'migration',
      showNewEndpointModal: false,
      nextButtonDisabled: false,
    }
  }

  componentWillMount() {
    WizardActions.getDataFromPermalink()
    let type = this.props.match && this.props.match.params.type
    if (type === 'migration' || type === 'replica') {
      this.setState({ type })
    }
  }

  componentDidMount() {
    document.title = 'Coriolis Wizard'
  }

  componentWillUnmount() {
    WizardActions.clearData()
  }

  loadDataForPage(page) {
    switch (page.id) {
      case 'source': {
        ProviderActions.loadProviders()
        EndpointActions.getEndpoints()
        // Preload instances if data is set from 'Permalink'
        let source = WizardStore.getState().data.source
        if (InstanceStore.getState().instances.length === 0 && source) {
          InstanceActions.loadInstances(source.id)
        }
        break
      }
      case 'options':
        ProviderActions.loadOptionsSchema(this.props.wizardStore.data.target.type, this.state.type)
        break
      case 'networks':
        InstanceActions.loadInstancesDetails(this.props.wizardStore.data.source.id, this.props.wizardStore.data.selectedInstances)
        NetworkActions.loadNetworks(this.props.wizardStore.data.target.id, this.props.wizardStore.data.options)
        break
      default:
    }
  }

  createMultiple() {
    let typeLabel = this.state.type.charAt(0).toUpperCase() + this.state.type.substr(1)
    NotificationActions.notify(`Creating ${typeLabel}s ...`)
    WizardActions.createMultiple(this.state.type, this.props.wizardStore.data).promise.then(() => {
      let items = WizardStore.getState().createdItems
      if (!items) {
        Notification.notify(`${typeLabel}s couldn't be created`, 'error')
        this.setState({ nextButtonDisabled: false })
        return
      }
      this.handleCreationSuccess(items)
    })
  }

  createSingle() {
    let typeLabel = this.state.type.charAt(0).toUpperCase() + this.state.type.substr(1)
    NotificationActions.notify(`Creating ${typeLabel} ...`)
    WizardActions.create(this.state.type, this.props.wizardStore.data).promise.then(() => {
      let item = WizardStore.getState().createdItem
      if (!item) {
        Notification.notify(`${typeLabel} couldn't be created`, 'error')
        this.setState({ nextButtonDisabled: false })
        return
      }
      this.handleCreationSuccess([item])
    })
  }

  separateVms() {
    let data = WizardStore.getState().data
    let separateVms = true

    if (data.options && data.options.separate_vm !== null && data.options.separate_vm !== undefined) {
      separateVms = data.options.separate_vm
    }

    if (data.selectedInstances.length === 1) {
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

  scheduleReplica(replica) {
    let data = WizardStore.getState().data

    if (!data.schedules || data.schedules.length === 0) {
      return
    }

    ScheduleActions.scheduleMultiple(replica.id, data.schedules)
  }

  executeCreatedReplica(replica) {
    let options = WizardStore.getState().data.options
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

    ReplicaActions.execute(replica.id, executeNowOptions)
  }

  handleCreationSuccess(items) {
    let typeLabel = this.state.type.charAt(0).toUpperCase() + this.state.type.substr(1)
    NotificationActions.notify(`${typeLabel} was succesfully created`, 'success', { persist: true, persistInfo: { title: `${typeLabel} created` } })

    if (this.state.type === 'replica') {
      items.forEach(replica => {
        this.executeCreatedReplica(replica)
        this.scheduleReplica(replica)
      })
    }

    if (items.length === 1) {
      let location = `/#/${this.state.type}/`
      if (this.state.type === 'replica') {
        location += 'executions/'
      } else {
        location += 'tasks/'
      }

      Wait.for(() => !ScheduleStore.getState().scheduling, () => {
        window.location.href = location + items[0].id
      })
    } else {
      window.location.href = `/#/${this.state.type}s`
    }
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

  handleTypeChange(isReplica) {
    this.setState({ type: isReplica ? 'replica' : 'migration' })
  }

  handleBackClick() {
    let pages = wizardConfig.pages.filter(p => !p.excludeFrom || p.excludeFrom !== this.state.type)
    let currentPageIndex = pages.findIndex(p => p.id === this.props.wizardStore.currentPage.id)

    if (currentPageIndex === 0) {
      window.history.back()
      return
    }

    let page = pages[currentPageIndex - 1]
    this.loadDataForPage(page)
    WizardActions.setCurrentPage(page)
  }

  handleNextClick() {
    let pages = wizardConfig.pages.filter(p => !p.excludeFrom || p.excludeFrom !== this.state.type)
    let currentPageIndex = pages.findIndex(p => p.id === this.props.wizardStore.currentPage.id)

    if (currentPageIndex === pages.length - 1) {
      this.create()
      return
    }

    let page = pages[currentPageIndex + 1]
    this.loadDataForPage(page)
    WizardActions.setCurrentPage(page)
  }

  handleSourceEndpointChange(source) {
    WizardActions.updateData({ source, selectedInstances: null, networks: null })
    WizardActions.setPermalink(WizardStore.getState().data)
    // Preload instances for 'vms' page
    InstanceActions.loadInstances(source.id)
  }

  handleTargetEndpointChange(target) {
    WizardActions.updateData({ target, networks: null, options: null })
    WizardActions.setPermalink(WizardStore.getState().data)
  }

  handleAddEndpoint(newEndpointType, newEndpointFromSource) {
    this.setState({
      showNewEndpointModal: true,
      newEndpointType,
      newEndpointFromSource,
    })
  }

  handleCloseNewEndpointModal(autoClose) {
    if (autoClose) {
      if (this.state.newEndpointFromSource) {
        WizardActions.updateData({ source: this.props.endpointStore.endpoints[0] })
      } else {
        WizardActions.updateData({ target: this.props.endpointStore.endpoints[0] })
      }
    }
    WizardActions.setPermalink(WizardStore.getState().data)
    this.setState({ showNewEndpointModal: false })
  }

  handleInstancesSearchInputChange(searchText) {
    InstanceActions.searchInstances(this.props.wizardStore.data.source.id, searchText)
  }

  handleInstancesNextPageClick(searchText) {
    InstanceActions.loadNextPage(this.props.wizardStore.data.source.id, searchText)
  }

  handleInstancesPreviousPageClick() {
    InstanceActions.loadPreviousPage()
  }

  handleInstancesReloadClick(searchText) {
    InstanceActions.reloadInstances(this.props.wizardStore.data.source.id, searchText)
  }

  handleInstanceClick(instance) {
    WizardActions.updateData({ networks: null })
    WizardActions.toggleInstanceSelection(instance)
    WizardActions.setPermalink(WizardStore.getState().data)
  }

  handleOptionsChange(field, value) {
    WizardActions.updateData({ networks: null })
    WizardActions.updateOptions({ field, value })
    WizardActions.setPermalink(WizardStore.getState().data)
  }

  handleNetworkChange(sourceNic, targetNetwork) {
    WizardActions.updateNetworks({ sourceNic, targetNetwork })
    WizardActions.setPermalink(WizardStore.getState().data)
  }

  handleAddScheduleClick(schedule) {
    WizardActions.addSchedule(schedule)
    WizardActions.setPermalink(WizardStore.getState().data)
  }

  handleScheduleChange(scheduleId, data) {
    WizardActions.updateSchedule(scheduleId, data)
    WizardActions.setPermalink(WizardStore.getState().data)
  }

  handleScheduleRemove(scheduleId) {
    WizardActions.removeSchedule(scheduleId)
    WizardActions.setPermalink(WizardStore.getState().data)
  }

  render() {
    return (
      <Wrapper>
        <WizardTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={this.props.userStore.user}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          pageContentComponent={<WizardPageContent
            page={this.props.wizardStore.currentPage}
            providerStore={this.props.providerStore}
            instanceStore={this.props.instanceStore}
            networkStore={this.props.networkStore}
            endpoints={this.props.endpointStore.endpoints}
            wizardData={this.props.wizardStore.data}
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

export default connectToStores(WizardPage)
