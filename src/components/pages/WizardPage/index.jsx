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

import userStore from '../../../stores/UserStore'
import providerStore from '../../../stores/ProviderStore'
import endpointStore from '../../../stores/EndpointStore'
import wizardStore from '../../../stores/WizardStore'
import instanceStore from '../../../stores/InstanceStore'
import networkStore from '../../../stores/NetworkStore'
import notificationStore from '../../../stores/NotificationStore'
import scheduleStore from '../../../stores/ScheduleStore'
import replicaStore from '../../../stores/ReplicaStore'
import KeyboardManager from '../../../utils/KeyboardManager'
import O from '../../../utils/ObjectUtils'
import { wizardConfig, executionOptions, providersWithExtraOptions } from '../../../config'
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
    wizardStore.getDataFromPermalink()
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
    wizardStore.clearData()
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
    notificationStore.notify(`${typeLabel} was succesfully created`, 'success', { persist: true, persistInfo: { title: `${typeLabel} created` } })
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
        userStore.logout()
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
    let currentPageIndex = pages.findIndex(p => p.id === wizardStore.currentPage.id)

    if (currentPageIndex === 0) {
      window.history.back()
      return
    }

    let page = pages[currentPageIndex - 1]
    this.loadDataForPage(page)
    wizardStore.setCurrentPage(page)
  }

  handleNextClick() {
    let pages = wizardConfig.pages.filter(p => !p.excludeFrom || p.excludeFrom !== this.state.type)
    let currentPageIndex = pages.findIndex(p => p.id === wizardStore.currentPage.id)

    if (currentPageIndex === pages.length - 1) {
      this.create()
      return
    }

    let page = pages[currentPageIndex + 1]
    this.loadDataForPage(page)
    wizardStore.setCurrentPage(page)
  }

  handleSourceEndpointChange(source: ?EndpointType) {
    wizardStore.updateData({ source, selectedInstances: null, networks: null })
    wizardStore.setPermalink(wizardStore.data)

    if (source) {
      // Check if user has permission for this endpoint
      endpointStore.getConnectionInfo(source).then(() => {
        if (source) {
          // Preload instances for 'vms' page
          instanceStore.loadInstances(source.id)
        }
      }).catch(() => {
        this.handleSourceEndpointChange(null)
      })
    }
  }

  handleTargetEndpointChange(target: EndpointType) {
    wizardStore.updateData({ target, networks: null, options: null })
    wizardStore.setPermalink(wizardStore.data)
    // Preload destination options schema
    providerStore.loadOptionsSchema(target.type, this.state.type).then(() => {
      // Preload destination options values
      return providerStore.getDestinationOptions(target.id, target.type)
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
        wizardStore.updateData({ source: endpointStore.endpoints[0] })
      } else {
        wizardStore.updateData({ target: endpointStore.endpoints[0] })
      }
    }
    wizardStore.setPermalink(wizardStore.data)
    this.setState({ showNewEndpointModal: false })
  }

  handleInstancesSearchInputChange(searchText: string) {
    if (wizardStore.data.source) {
      instanceStore.searchInstances(wizardStore.data.source.id, searchText)
    }
  }

  handleInstancesNextPageClick(searchText: string) {
    if (wizardStore.data.source) {
      instanceStore.loadNextPage(wizardStore.data.source.id, searchText)
    }
  }

  handleInstancesPreviousPageClick() {
    instanceStore.loadPreviousPage()
  }

  handleInstancesReloadClick(searchText: string) {
    if (wizardStore.data.source) {
      instanceStore.reloadInstances(wizardStore.data.source.id, searchText)
    }
  }

  handleInstanceClick(instance: Instance) {
    wizardStore.updateData({ networks: null })
    wizardStore.toggleInstanceSelection(instance)
    wizardStore.setPermalink(wizardStore.data)
  }

  handleOptionsChange(field: Field, value: any) {
    wizardStore.updateData({ networks: null })
    wizardStore.updateOptions({ field, value })
    this.loadEnvDestinationOptions(field)
    wizardStore.setPermalink(wizardStore.data)
  }

  handleNetworkChange(sourceNic: Nic, targetNetwork: Network) {
    wizardStore.updateNetworks({ sourceNic, targetNetwork })
    wizardStore.setPermalink(wizardStore.data)
  }

  handleAddScheduleClick(schedule: Schedule) {
    wizardStore.addSchedule(schedule)
    wizardStore.setPermalink(wizardStore.data)
  }

  handleScheduleChange(scheduleId: string, data: Schedule) {
    wizardStore.updateSchedule(scheduleId, data)
    wizardStore.setPermalink(wizardStore.data)
  }

  handleScheduleRemove(scheduleId: string) {
    wizardStore.removeSchedule(scheduleId)
    wizardStore.setPermalink(wizardStore.data)
  }

  loadEnvDestinationOptions(field?: Field) {
    let provider = wizardStore.data.target && wizardStore.data.target.type
    let providerWithExtraOptions = providersWithExtraOptions.find(p => typeof p !== 'string' && p.name === provider)
    if (provider && providerWithExtraOptions && typeof providerWithExtraOptions !== 'string' && providerWithExtraOptions.envRequiredFields) {
      let findFieldInSchema = (name: string) => providerStore.optionsSchema.find(f => f.name === name)
      let validFields = providerWithExtraOptions.envRequiredFields.filter(fn => {
        let schemaField = findFieldInSchema(fn)
        if (wizardStore.data.options) {
          if (wizardStore.data.options[fn] === null) {
            return false
          }
          if (wizardStore.data.options[fn] === undefined && schemaField && schemaField.default) {
            return true
          }
          return wizardStore.data.options[fn]
        }
        return false
      })
      let currentFieldValied = field ? validFields.find(fn => field ? fn === field.name : false) : true
      if (
        validFields.length === providerWithExtraOptions.envRequiredFields.length &&
        currentFieldValied
      ) {
        let envData = {}
        validFields.forEach(fn => {
          envData[fn] = wizardStore.data.options ? wizardStore.data.options[fn] : null
          if (!O.isValid(envData[fn])) {
            let schemaField = findFieldInSchema(fn)
            if (schemaField && schemaField.default) {
              envData[fn] = schemaField.default
            }
          }
        })
        if (wizardStore.data.target) {
          providerStore.getDestinationOptions(wizardStore.data.target.id, provider, envData)
        }
      }
    }
  }

  loadDataForPage(page: WizardPageType) {
    switch (page.id) {
      case 'source': {
        providerStore.loadProviders()
        endpointStore.getEndpoints()
        // Preload instances if data is set from 'Permalink'
        let source = wizardStore.data.source
        if (instanceStore.instances.length === 0 && source) {
          // Check if user has permission for this endpoint
          endpointStore.getConnectionInfo(source).then(() => {
            // Preload instances for 'vms' page
            instanceStore.loadInstances(source.id)
          }).catch(() => {
            this.handleSourceEndpointChange(null)
          })
        }
        break
      }
      case 'target': {
        let target = wizardStore.data.target
        // Preload destination options schema
        if (providerStore.optionsSchema.length === 0 && target) {
          providerStore.loadOptionsSchema(target.type, this.state.type).then(() => {
            // Preload destination options if data is set from 'Permalink'
            if (providerStore.destinationOptions.length === 0 && target) {
              providerStore.getDestinationOptions(target.id, target.type).then(() => {
                this.loadEnvDestinationOptions()
              })
            }
          })
        }
        break
      }
      case 'networks':
        if (wizardStore.data.source && wizardStore.data.selectedInstances) {
          instanceStore.loadInstancesDetails(wizardStore.data.source.id, wizardStore.data.selectedInstances)
        }
        if (wizardStore.data.target) {
          networkStore.loadNetworks(wizardStore.data.target.id, wizardStore.data.options)
        }
        break
      default:
    }
  }

  createMultiple() {
    let typeLabel = this.state.type.charAt(0).toUpperCase() + this.state.type.substr(1)
    notificationStore.notify(`Creating ${typeLabel}s ...`)
    wizardStore.createMultiple(this.state.type, wizardStore.data).then(() => {
      let items = wizardStore.createdItems
      if (!items) {
        notificationStore.notify(`${typeLabel}s couldn't be created`, 'error')
        this.setState({ nextButtonDisabled: false })
        return
      }
      this.handleCreationSuccess(items)
    })
  }

  createSingle() {
    let typeLabel = this.state.type.charAt(0).toUpperCase() + this.state.type.substr(1)
    notificationStore.notify(`Creating ${typeLabel} ...`)
    wizardStore.create(this.state.type, wizardStore.data).then(() => {
      let item = wizardStore.createdItem
      if (!item) {
        notificationStore.notify(`${typeLabel} couldn't be created`, 'error')
        this.setState({ nextButtonDisabled: false })
        return
      }
      this.handleCreationSuccess([item])
    })
  }

  separateVms() {
    let data = wizardStore.data
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
    let data = wizardStore.data

    if (!data.schedules || data.schedules.length === 0) {
      return Promise.resolve()
    }

    return scheduleStore.scheduleMultiple(replica.id, data.schedules)
  }

  executeCreatedReplica(replica: MainItem) {
    let options = wizardStore.data.options
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

    replicaStore.execute(replica.id, executeNowOptions)
  }

  render() {
    return (
      <Wrapper>
        <WizardTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={userStore.loggedUser}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          pageContentComponent={<WizardPageContent
            page={wizardStore.currentPage}
            providerStore={providerStore}
            instanceStore={instanceStore}
            networkStore={networkStore}
            endpoints={endpointStore.endpoints}
            wizardData={wizardStore.data}
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
