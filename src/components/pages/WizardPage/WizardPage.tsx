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
import autobind from 'autobind-decorator'
import { observer } from 'mobx-react'

import WizardTemplate from '../../templates/WizardTemplate'
import DetailsPageHeader from '../../organisms/DetailsPageHeader'
import WizardPageContent from '../../organisms/WizardPageContent'
import Modal from '../../molecules/Modal'
import Endpoint from '../../organisms/Endpoint'

import userStore from '../../../stores/UserStore'
import providerStore, { getFieldChangeOptions } from '../../../stores/ProviderStore'
import endpointStore from '../../../stores/EndpointStore'
import wizardStore from '../../../stores/WizardStore'
import instanceStore from '../../../stores/InstanceStore'
import networkStore from '../../../stores/NetworkStore'
import notificationStore from '../../../stores/NotificationStore'
import scheduleStore from '../../../stores/ScheduleStore'
import replicaStore from '../../../stores/ReplicaStore'
import KeyboardManager from '../../../utils/KeyboardManager'
import { wizardPages, executionOptions, providerTypes } from '../../../constants'

import type { Endpoint as EndpointType, StorageBackend } from '../../../@types/Endpoint'
import type {
  Instance, Nic, Disk, InstanceScript,
} from '../../../@types/Instance'
import type { Field } from '../../../@types/Field'
import type { Network, SecurityGroup } from '../../../@types/Network'
import type { Schedule } from '../../../@types/Schedule'
import type { WizardPage as WizardPageType } from '../../../@types/WizardData'
import ObjectUtils from '../../../utils/ObjectUtils'
import { ProviderTypes } from '../../../@types/Providers'
import { TransferItem, ReplicaItem } from '../../../@types/MainItem'

const Wrapper = styled.div<any>``

type Props = {
  match: any,
  location: { search: string },
  history: any,
}
type WizardType = 'migration' | 'replica'
type State = {
  type: WizardType,
  showNewEndpointModal: boolean,
  nextButtonDisabled: boolean,
  newEndpointType: ProviderTypes | null,
  newEndpointFromSource?: boolean,
}
@observer
class WizardPage extends React.Component<Props, State> {
  state: State = {
    type: 'migration',
    showNewEndpointModal: false,
    nextButtonDisabled: false,
    newEndpointType: null,
  }

  contentRef!: WizardPageContent

  UNSAFE_componentWillMount() {
    this.initializeState(this.props.match)
    this.handleResize()
  }

  componentDidMount() {
    document.title = 'Coriolis Wizard'
    KeyboardManager.onEnter('wizard', () => { this.handleEnterKey() })
    KeyboardManager.onEsc('wizard', () => { this.handleEscKey() })
    window.addEventListener('resize', this.handleResize)
  }

  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (newProps.location === this.props.location) {
      return
    }
    wizardStore.clearData()
    this.initializeState(newProps.match)
  }

  componentWillUnmount() {
    wizardStore.clearData()
    instanceStore.cancelIntancesChunksLoading()
    KeyboardManager.removeKeyDown('wizard')
    window.removeEventListener('resize', this.handleResize, false)
  }

  get instancesPerPage() {
    const min = 3
    const max = Infinity
    const instancesTableDiff = 505
    const instancesItemHeight = 67
    return Math.min(
      max,
      Math.max(min, Math.floor((window.innerHeight - instancesTableDiff) / instancesItemHeight)),
    )
  }

  get pages(): any[] {
    const destProvider = wizardStore.data?.target?.type
    const pages = wizardPages
    const hasStorageMapping = () => (
      destProvider && providerStore.providers && providerStore.providers[destProvider]
        ? !!providerStore.providers[destProvider].types
          .find(t => t === providerTypes.STORAGE)
        : false
    )

    return pages
      .filter(p => !p.excludeFrom || p.excludeFrom !== this.state.type)
      .filter(p => p.id !== 'storage' || hasStorageMapping())
  }

  @autobind
  handleResize() {
    instanceStore.updateInstancesPerPage(this.instancesPerPage)
  }

  handleEnterKey() {
    if (this.contentRef && !this.contentRef.isNextButtonDisabled()) {
      this.handleNextClick()
    }
  }

  handleEscKey() {
    this.handleBackClick()
  }

  async handleCreationSuccess(items: TransferItem[]) {
    const typeLabel = this.state.type.charAt(0).toUpperCase() + this.state.type.substr(1)
    notificationStore.alert(`${typeLabel}${items.length > 1 ? 's' : ''} was succesfully created`, 'success')
    let schedulePromise = Promise.resolve()

    if (this.state.type === 'replica') {
      items.forEach(replica => {
        if (replica.type !== 'replica') {
          return
        }
        this.executeCreatedReplica(replica)
        schedulePromise = this.scheduleReplica(replica)
      })
    }

    if (items.length === 1) {
      let location = `/${this.state.type}s/${items[0].id}/`
      if (this.state.type === 'replica') {
        location += 'executions'
      } else {
        location += 'tasks'
      }
      await schedulePromise
      this.props.history.push(location)
    } else {
      this.props.history.push(`/${this.state.type}s`)
    }
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case 'signout':
        userStore.logout()
        break
      default:
    }
  }

  handleTypeChange(isReplica: boolean | null) {
    wizardStore.updateData({
      target: null,
      networks: null,
      destOptions: null,
      sourceOptions: null,
      selectedInstances: null,
      source: null,
    })
    wizardStore.clearStorageMap()
    const type = isReplica ? 'replica' : 'migration'
    this.props.history.replace(`/wizard/${type}`)
  }

  handleBackClick() {
    const currentPageIndex = this.pages.findIndex(p => p.id === wizardStore.currentPage.id)

    if (currentPageIndex === 0) {
      window.history.back()
      return
    }

    const page: any = this.pages[currentPageIndex - 1]
    this.loadDataForPage(page)
    wizardStore.setCurrentPage(page)
  }

  handleNextClick() {
    const currentPageIndex = this.pages.findIndex(p => p.id === wizardStore.currentPage.id)

    if (currentPageIndex === this.pages.length - 1) {
      this.create()
      return
    }

    const page: any = this.pages[currentPageIndex + 1]
    this.loadDataForPage(page)
    wizardStore.setCurrentPage(page)
  }

  async handleSourceEndpointChange(source: EndpointType | null) {
    wizardStore.updateData({
      source, selectedInstances: null, networks: null, sourceOptions: null,
    })
    wizardStore.clearStorageMap()
    wizardStore.updateUrlState()

    if (!source) {
      return
    }
    await providerStore.loadOptionsSchema({
      providerName: source.type,
      optionsType: 'source',
      useCache: true,
    })
    wizardStore.fillWithDefaultValues('source', providerStore.sourceSchema)

    await providerStore.getOptionsValues({
      optionsType: 'source',
      endpointId: source.id,
      providerName: source.type,
      useCache: true,
    })
    wizardStore.fillWithDefaultValues('source', providerStore.sourceSchema)
  }

  async handleTargetEndpointChange(target: EndpointType) {
    wizardStore.updateData({ target, networks: null, destOptions: null })
    wizardStore.clearStorageMap()
    wizardStore.updateUrlState()
    if (this.pages.find(p => p.id === 'storage')) {
      endpointStore.loadStorage(target.id, {})
    }
    // Preload destination options schema
    await providerStore.loadOptionsSchema({
      providerName: target.type,
      optionsType: 'destination',
      useCache: true,
    })
    wizardStore.fillWithDefaultValues('destination', providerStore.destinationSchema)
    // Preload destination options values
    await providerStore.getOptionsValues({
      optionsType: 'destination',
      endpointId: target.id,
      providerName: target.type,
      useCache: true,
    })
    wizardStore.fillWithDefaultValues('destination', providerStore.destinationSchema)
  }

  handleAddEndpoint(newEndpointType: ProviderTypes, newEndpointFromSource: boolean) {
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
    wizardStore.updateUrlState()
    this.setState({ showNewEndpointModal: false })
  }

  handleInstancesSearchInputChange(searchText: string) {
    if (wizardStore.data.source) {
      instanceStore.searchInstances(wizardStore.data.source, searchText)
    }
  }

  handleInstancesReloadClick() {
    if (wizardStore.data.source) {
      instanceStore.reloadInstances(
        wizardStore.data.source, this.instancesPerPage, wizardStore.data.sourceOptions,
      )
    }
  }

  handleInstanceClick(instance: Instance) {
    wizardStore.updateData({ networks: null })
    wizardStore.clearUploadedUserScripts()
    wizardStore.clearStorageMap()
    wizardStore.toggleInstanceSelection(instance)
    wizardStore.updateUrlState()
  }

  handleInstancePageClick(page: number) {
    instanceStore.setPage(page)
  }

  handleDestOptionsChange(field: Field, value: any) {
    wizardStore.updateData({ networks: null })
    wizardStore.clearStorageMap()
    wizardStore.updateDestOptions({ field, value })
    // If the field is a string and doesn't have an enum property,
    // we can't call destination options on "change" since too many calls will be made,
    // it also means a potential problem with the server not populating the "enum" prop.
    // Otherwise, the field has enum property,
    // which there potentially other destination options for the new
    // chosen value from the enum
    if (field.type !== 'string' || field.enum) {
      this.loadExtraOptions(field, 'destination')
    }
    wizardStore.updateUrlState()
  }

  handleSourceOptionsChange(field: Field, value: any) {
    wizardStore.updateData({ selectedInstances: [] })
    wizardStore.updateSourceOptions({ field, value })
    if (field.type !== 'string' || field.enum) {
      this.loadExtraOptions(field, 'source')
    }
    wizardStore.updateUrlState()
  }

  handleNetworkChange(
    sourceNic: Nic, targetNetwork: Network, targetSecurityGroups?: SecurityGroup[] | null,
  ) {
    wizardStore.updateNetworks({ sourceNic, targetNetwork, targetSecurityGroups })
    wizardStore.updateUrlState()
  }

  handleDefaultStorageChange(value: string | null) {
    wizardStore.updateDefaultStorage(value)
    wizardStore.updateUrlState()
  }

  handleStorageChange(source: Disk, target: StorageBackend, type: 'backend' | 'disk') {
    wizardStore.updateStorage({ source, target, type })
    wizardStore.updateUrlState()
  }

  handleAddScheduleClick(schedule: Schedule) {
    wizardStore.addSchedule(schedule)
    wizardStore.updateUrlState()
  }

  handleScheduleChange(scheduleId: string, data: Schedule) {
    wizardStore.updateSchedule(scheduleId, data)
    wizardStore.updateUrlState()
  }

  handleScheduleRemove(scheduleId: string) {
    wizardStore.removeSchedule(scheduleId)
    wizardStore.updateUrlState()
  }

  async handleReloadOptionsClick() {
    const optionsType: 'source' | 'destination' = wizardStore.currentPage.id === 'source-options' ? 'source' : 'destination'
    const endpoint = optionsType === 'source' ? wizardStore.data.source : wizardStore.data.target
    if (!endpoint) {
      return
    }
    await providerStore.loadOptionsSchema({
      providerName: endpoint.type,
      optionsType,
    })
    const getSchema = () => (optionsType === 'source' ? providerStore.sourceSchema : providerStore.destinationSchema)
    wizardStore.fillWithDefaultValues(optionsType, getSchema())

    await providerStore.getOptionsValues({
      optionsType,
      endpointId: endpoint.id,
      providerName: endpoint.type,
    })
    wizardStore.fillWithDefaultValues(optionsType, getSchema())

    await this.loadExtraOptions(null, optionsType, false)
  }

  initializeState(match: any) {
    wizardStore.getUrlState()
    const type = match && match.params && match.params.type
    if (type === 'migration' || type === 'replica') {
      this.setState({ type })
    }
  }

  async loadExtraOptions(field: Field | null, type: 'source' | 'destination', useCache: boolean = true) {
    const endpoint = type === 'source' ? wizardStore.data.source : wizardStore.data.target
    if (!endpoint) {
      return
    }
    const getSchema = () => (type === 'source' ? providerStore.sourceSchema : providerStore.destinationSchema)
    const envData = getFieldChangeOptions({
      providerName: endpoint.type,
      schema: getSchema(),
      data: type === 'source' ? wizardStore.data.sourceOptions : wizardStore.data.destOptions,
      field,
      type,
    })
    if (!envData) {
      return
    }
    await providerStore.getOptionsValues({
      optionsType: type,
      endpointId: endpoint.id,
      providerName: endpoint.type,
      envData,
      useCache,
    })
    wizardStore.fillWithDefaultValues(type, getSchema())
  }

  async loadDataForPage(page: WizardPageType) {
    const loadOptions = async (endpoint: EndpointType, optionsType: 'source' | 'destination') => {
      await providerStore.loadOptionsSchema({
        providerName: endpoint.type,
        optionsType,
        useCache: true,
      })
      const getSchema = () => (optionsType === 'source' ? providerStore.sourceSchema : providerStore.destinationSchema)
      wizardStore.fillWithDefaultValues(optionsType, getSchema())

      await providerStore.getOptionsValues({
        optionsType,
        endpointId: endpoint.id,
        providerName: endpoint.type,
        useCache: true,
      })
      wizardStore.fillWithDefaultValues(optionsType, getSchema())

      await this.loadExtraOptions(null, optionsType)
    }

    switch (page.id) {
      case 'source': {
        providerStore.loadProviders()
        endpointStore.getEndpoints()
        // Preload instances if data is set from 'Permalink'
        const source = wizardStore.data.source
        if (!source) {
          return
        }
        // Preload source options schema
        loadOptions(source, 'source')
        break
      }
      case 'vms': {
        if (!wizardStore.data.source) {
          return
        }
        instanceStore.loadInstancesInChunks({
          endpoint: wizardStore.data.source,
          vmsPerPage: this.instancesPerPage,
          env: wizardStore.data.sourceOptions,
          useCache: true,
        })
        break
      }
      case 'target': {
        const target = wizardStore.data.target
        if (!target) {
          return
        }
        // Preload Storage Mapping
        if (this.pages.find(p => p.id === 'storage')) {
          endpointStore.loadStorage(target.id, {})
        }
        // Preload destination options schema
        loadOptions(target, 'destination')
        break
      }
      case 'networks':
        this.loadNetworks(true)
        break
      default:
    }
  }

  loadNetworks(cache: boolean) {
    if (wizardStore.data.source && wizardStore.data.selectedInstances && wizardStore.data.target) {
      instanceStore.loadInstancesDetails({
        endpointId: wizardStore.data.source.id,
        instancesInfo:
          wizardStore.data.selectedInstances as { name: string, instance_name?: string }[],
        env: wizardStore.data.sourceOptions,
        cache,
        targetProvider: wizardStore.data.target.type,
      })
    }
    if (wizardStore.data.target) {
      const id = wizardStore.data.target.id
      networkStore.loadNetworks(id, wizardStore.data.destOptions, { cache })
    }
  }

  async createMultiple() {
    const typeLabel = this.state.type.charAt(0).toUpperCase() + this.state.type.substr(1)
    notificationStore.alert(`Creating ${typeLabel}s ...`)
    const success = await wizardStore.createMultiple(
      this.state.type,
      wizardStore.data,
      wizardStore.defaultStorage,
      wizardStore.storageMap,
      wizardStore.uploadedUserScripts,
    )
    if (success && wizardStore.createdItems) {
      this.handleCreationSuccess(wizardStore.createdItems.filter(ObjectUtils.notEmpty))
    } else {
      this.setState({ nextButtonDisabled: false })
    }
  }

  async createSingle() {
    const typeLabel = this.state.type.charAt(0).toUpperCase() + this.state.type.substr(1)
    notificationStore.alert(`Creating ${typeLabel} ...`)
    try {
      await wizardStore.create(
        this.state.type,
        wizardStore.data,
        wizardStore.defaultStorage,
        wizardStore.storageMap,
        wizardStore.uploadedUserScripts,
      )
      const item = wizardStore.createdItem
      if (!item) {
        notificationStore.alert(`${typeLabel} couldn't be created`, 'error')
        this.setState({ nextButtonDisabled: false })
        return
      }
      this.handleCreationSuccess([item])
    } catch (err) {
      this.setState({ nextButtonDisabled: false })
    }
  }

  separateVms() {
    const data = wizardStore.data
    let separateVms = true

    if (data.destOptions && data.destOptions.separate_vm != null) {
      separateVms = data.destOptions.separate_vm
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

  isNextButtonDisabled() {
    const state = this.state.nextButtonDisabled

    if (wizardStore.currentPage.id === 'dest-options') {
      return providerStore.destinationSchemaLoading
        || providerStore.destinationOptionsPrimaryLoading
        || providerStore.destinationOptionsSecondaryLoading || state
    }

    if (wizardStore.currentPage.id === 'source-options') {
      return providerStore.sourceSchemaLoading || providerStore.sourceOptionsPrimaryLoading
        || providerStore.sourceOptionsSecondaryLoading || state
    }

    return state
  }

  scheduleReplica(replica: ReplicaItem): Promise<void> {
    if (wizardStore.schedules.length === 0) {
      return Promise.resolve()
    }

    return scheduleStore.scheduleMultiple(replica.id, wizardStore.schedules)
  }

  executeCreatedReplica(replica: ReplicaItem) {
    const options = wizardStore.data.destOptions
    let executeNow = true
    if (options && options.execute_now != null) {
      executeNow = options.execute_now
    }
    if (!executeNow) {
      return
    }

    const executeNowOptions = executionOptions.map(field => {
      if (options && options[field.name] != null) {
        return { name: field.name, value: options[field.name] }
      }
      return field
    })

    replicaStore.execute(replica.id, executeNowOptions)
  }

  handleCancelUploadedScript(global: string | null, instanceName: string | null) {
    wizardStore.cancelUploadedScript(global, instanceName)
  }

  handleUserScriptUpload(instanceScript: InstanceScript) {
    wizardStore.uploadUserScript(instanceScript)
  }

  render() {
    return (
      <Wrapper>
        <WizardTemplate
          pageHeaderComponent={(
            <DetailsPageHeader
              user={userStore.loggedUser}
              onUserItemClick={item => { this.handleUserItemClick(item) }}
            />
)}
          pageContentComponent={(
            <WizardPageContent
              pages={this.pages}
              page={wizardStore.currentPage}
              providerStore={providerStore}
              instanceStore={instanceStore}
              networkStore={networkStore}
              endpointStore={endpointStore}
              wizardData={wizardStore.data}
              hasStorageMap={Boolean(this.pages.find(p => p.id === 'storage'))}
              hasSourceOptions={Boolean(this.pages.find(p => p.id === 'source-options'))}
              defaultStorage={wizardStore.defaultStorage}
              storageMap={wizardStore.storageMap}
              schedules={wizardStore.schedules}
              nextButtonDisabled={this.isNextButtonDisabled()}
              type={this.state.type}
              onTypeChange={isReplica => { this.handleTypeChange(isReplica) }}
              onBackClick={() => { this.handleBackClick() }}
              onNextClick={() => { this.handleNextClick() }}
              onSourceEndpointChange={endpoint => { this.handleSourceEndpointChange(endpoint) }}
              onTargetEndpointChange={endpoint => { this.handleTargetEndpointChange(endpoint) }}
              onAddEndpoint={(type, fromSource) => { this.handleAddEndpoint(type, fromSource) }}
              onInstancesSearchInputChange={searchText => {
                this.handleInstancesSearchInputChange(searchText)
              }}
              onInstancesReloadClick={() => { this.handleInstancesReloadClick() }}
              onInstanceClick={instance => { this.handleInstanceClick(instance) }}
              onInstancePageClick={page => { this.handleInstancePageClick(page) }}
              onDestOptionsChange={(field, value) => { this.handleDestOptionsChange(field, value) }}
              onSourceOptionsChange={(field, value) => {
                this.handleSourceOptionsChange(field, value)
              }}
              onNetworkChange={(sourceNic, targetNetwork, secGroups) => {
                this.handleNetworkChange(sourceNic, targetNetwork, secGroups)
              }}
              onDefaultStorageChange={value => { this.handleDefaultStorageChange(value) }}
              onStorageChange={(source, target, type) => {
                this.handleStorageChange(source, target, type)
              }}
              onAddScheduleClick={schedule => { this.handleAddScheduleClick(schedule) }}
              onScheduleChange={(scheduleId, data) => {
                this.handleScheduleChange(scheduleId, data)
              }}
              onScheduleRemove={scheduleId => { this.handleScheduleRemove(scheduleId) }}
              onContentRef={ref => { this.contentRef = ref }}
              onReloadOptionsClick={() => { this.handleReloadOptionsClick() }}
              onReloadNetworksClick={() => { this.loadNetworks(false) }}
              uploadedUserScripts={wizardStore.uploadedUserScripts}
              onCancelUploadedScript={(g, i) => { this.handleCancelUploadedScript(g, i) }}
              onUserScriptUpload={s => { this.handleUserScriptUpload(s) }}
            />
)}
        />
        <Modal
          isOpen={this.state.showNewEndpointModal}
          title="New Cloud Endpoint"
          onRequestClose={() => { this.handleCloseNewEndpointModal() }}
        >
          <Endpoint
            type={this.state.newEndpointType}
            onCancelClick={autoClose => { this.handleCloseNewEndpointModal(autoClose) }}
          />
        </Modal>
      </Wrapper>
    )
  }
}

export default WizardPage
