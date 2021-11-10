/*
Copyright (C) 2019  Cloudbase Solutions SRL
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
import { observer } from 'mobx-react'
import styled from 'styled-components'

import providerStore, { getFieldChangeOptions } from '../../../../stores/ProviderStore'
import replicaStore from '../../../../stores/ReplicaStore'
import migrationStore from '../../../../stores/MigrationStore'
import endpointStore from '../../../../stores/EndpointStore'
import { OptionsSchemaPlugin } from '../../../../plugins/endpoint'

import Button from '../../../ui/Button/Button'
import StatusImage from '../../../ui/StatusComponents/StatusImage/StatusImage'
import Modal from '../../../ui/Modal/Modal'
import Panel from '../../../ui/Panel/Panel'
import { isOptionsPageValid } from '../../WizardModule/WizardPageContent/WizardPageContent'
import WizardNetworks, { WizardNetworksChangeObject } from '../../WizardModule/WizardNetworks/WizardNetworks'
import WizardOptions, { INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS } from '../../WizardModule/WizardOptions/WizardOptions'
import WizardStorage from '../../WizardModule/WizardStorage/WizardStorage'

import type {
  UpdateData, TransferItemDetails, MigrationItemDetails,
} from '../../../../@types/MainItem'
import type { NavigationItem } from '../../../ui/Panel/Panel'
import {
  Endpoint, EndpointUtils, StorageBackend, StorageMap,
} from '../../../../@types/Endpoint'
import type { Field } from '../../../../@types/Field'
import type {
  Instance, InstanceScript,
} from '../../../../@types/Instance'
import {
  Network, NetworkMap, NetworkUtils, SecurityGroup,
} from '../../../../@types/Network'

import { providerTypes, migrationFields } from '../../../../constants'
import configLoader from '../../../../utils/Config'
import LoadingButton from '../../../ui/LoadingButton/LoadingButton'
import minionPoolStore from '../../../../stores/MinionPoolStore'
import WizardScripts from '../../WizardModule/WizardScripts/WizardScripts'
import networkStore from '../../../../stores/NetworkStore'
import { ThemeProps } from '../../../Theme'

const PanelContent = styled.div<any>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  min-height: 0;
`
const LoadingWrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0;
`
const LoadingText = styled.div<any>`
  font-size: 18px;
  margin-top: 32px;
`
const ErrorWrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 32px;
`
const ErrorMessage = styled.div<any>`
  margin-top: 16px;
  text-align: center;
`
const Buttons = styled.div<any>`
  padding: 32px;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
`

type Props = {
  type?: 'replica' | 'migration',
  isOpen: boolean,
  onRequestClose: () => void,
  onUpdateComplete: (redirectTo: string) => void,
  replica: TransferItemDetails,
  destinationEndpoint: Endpoint,
  sourceEndpoint: Endpoint,
  instancesDetails: Instance[],
  instancesDetailsLoading: boolean,
  networks: Network[],
  networksLoading: boolean,
  onReloadClick: () => void,
}
type State = {
  selectedPanel: string | null,
  destinationData: any,
  sourceData: any,
  updateDisabled: boolean,
  updating: boolean,
  selectedNetworks: NetworkMap[],
  defaultStorage: { value: string | null, busType?: string | null } | undefined,
  storageMap: StorageMap[],
  sourceFailed: boolean,
  destinationFailedMessage: string | null,
  uploadedScripts: InstanceScript[],
  removedScripts: InstanceScript[],
}

@observer
class TransferItemModal extends React.Component<Props, State> {
  state: State = {
    selectedPanel: 'source_options',
    destinationData: {},
    sourceData: {},
    updateDisabled: false,
    updating: false,
    selectedNetworks: [],
    defaultStorage: undefined,
    storageMap: [],
    uploadedScripts: [],
    sourceFailed: false,
    destinationFailedMessage: null,
    removedScripts: [],
  }

  scrollableRef: HTMLElement | null | undefined

  UNSAFE_componentWillMount() {
    this.loadData(true)
  }

  getStorageMap(storageBackends: StorageBackend[]): StorageMap[] {
    const storageMap: StorageMap[] = []
    const currentStorage = this.props.replica.storage_mappings
    const buildStorageMap = (type: 'backend' | 'disk', mapping: any): StorageMap => {
      const busTypeInfo = EndpointUtils.getBusTypeStorageId(storageBackends, mapping.destination)
      const backend = storageBackends.find(b => b.name === busTypeInfo.id)
      const newStorageMap: StorageMap = {
        type,
        source: { storage_backend_identifier: mapping.source, id: mapping.disk_id },
        target: { name: busTypeInfo.id!, id: backend ? backend.id : busTypeInfo.id },
      }
      if (busTypeInfo.busType) {
        newStorageMap.targetBusType = busTypeInfo.busType
      }
      return newStorageMap
    }
    const backendMappings = currentStorage?.backend_mappings || []
    backendMappings.forEach(mapping => {
      storageMap.push(buildStorageMap('backend', mapping))
    })

    const diskMappings = currentStorage?.disk_mappings || []
    diskMappings.forEach(mapping => {
      storageMap.push(buildStorageMap('disk', mapping))
    })

    this.state.storageMap.forEach(mapping => {
      const fieldName = mapping.type === 'backend' ? 'storage_backend_identifier' : 'id'
      const existingMapping = storageMap.find(m => m.type === mapping.type
        && m.source[fieldName] === String(mapping.source[fieldName]))
      if (existingMapping) {
        existingMapping.target = mapping.target
        if (mapping.targetBusType !== undefined) {
          existingMapping.targetBusType = mapping.targetBusType
        }
      } else {
        storageMap.push(mapping)
      }
    })

    return storageMap
  }

  getSelectedNetworks(): NetworkMap[] {
    let selectedNetworks: NetworkMap[] = []
    const networkMap: any = this.props.replica.network_map

    if (networkMap) {
      Object.keys(networkMap).forEach(sourceNetworkName => {
        const destNetObj: any = networkMap[sourceNetworkName]
        const portKeyInfo = NetworkUtils.getPortKeyNetworkId(this.props.networks, destNetObj)
        const destNetId = String(typeof destNetObj === 'string' || !destNetObj
          || !destNetObj.id ? portKeyInfo.id : destNetObj.id)

        const network = this.props.networks.find(n => n.name === destNetId || n.id === destNetId) || null
        const mapping: NetworkMap = {
          sourceNic: {
            id: '', network_name: sourceNetworkName, mac_address: '', network_id: '',
          },
          targetNetwork: network,
        }
        if (destNetObj.security_groups) {
          const destSecGroupsInfo = network?.security_groups || []
          const secInfo = destNetObj.security_groups.map((s: SecurityGroup) => {
            const foundSecGroupInfo = destSecGroupsInfo
              .find((si: any) => (si.id ? si.id === s : si === s))
            return foundSecGroupInfo || { id: s, name: s }
          })
          mapping.targetSecurityGroups = secInfo
        }
        if (portKeyInfo.portKey) {
          mapping.targetPortKey = portKeyInfo.portKey
        }
        selectedNetworks.push(mapping)
      })
    }
    selectedNetworks = selectedNetworks.map(mapping => {
      const updatedMapping = this.state.selectedNetworks
        .find(m => m.sourceNic.network_name === mapping.sourceNic.network_name)
      return updatedMapping || mapping
    })
    return selectedNetworks
  }

  getDefaultStorage(): { value: string | null, busType?: string | null } {
    if (this.state.defaultStorage) {
      return this.state.defaultStorage
    }

    const buildDefaultStorage = (defaultValue: string | null | undefined) => {
      const busTypeInfo = EndpointUtils.getBusTypeStorageId(endpointStore.storageBackends, defaultValue || null)
      const defaultStorage: { value: string | null, busType?: string | null } = {
        value: busTypeInfo.id,
      }
      if (busTypeInfo.busType) {
        defaultStorage.busType = busTypeInfo.busType
      }
      return defaultStorage
    }

    if (this.props.replica.storage_mappings?.default) {
      return buildDefaultStorage(this.props.replica.storage_mappings.default)
    }

    if (endpointStore.storageConfigDefault) {
      return buildDefaultStorage(endpointStore.storageConfigDefault)
    }
    return { value: null }
  }

  getFieldValue(type: 'source' | 'destination', fieldName: string, defaultValue: any, parentFieldName?: string) {
    const currentData = type === 'source' ? this.state.sourceData : this.state.destinationData

    const replicaMinionMappings = this.props.replica[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS]

    if (parentFieldName) {
      if (currentData[parentFieldName]
        && currentData[parentFieldName][fieldName] !== undefined) {
        return currentData[parentFieldName][fieldName]
      }
      if (parentFieldName === INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS
        && replicaMinionMappings
        && replicaMinionMappings[fieldName] !== undefined
      ) {
        return replicaMinionMappings[fieldName]
      }
    }

    if (currentData[fieldName] !== undefined) {
      return currentData[fieldName]
    }

    if (fieldName === 'title') {
      let title = this.props.instancesDetails?.[0]?.name
      if (this.props.instancesDetails && this.props.instancesDetails.length > 1) {
        title += ` (+${this.props.instancesDetails.length - 1} more)`
      }
      return title
    }

    if (fieldName === 'minion_pool_id') {
      return type === 'source' ? this.props.replica.origin_minion_pool_id : this.props.replica.destination_minion_pool_id
    }

    const replicaData: any = type === 'source' ? this.props.replica.source_environment
      : this.props.replica.destination_environment

    if (parentFieldName) {
      if (replicaData[parentFieldName]?.[fieldName] !== undefined) {
        return replicaData[parentFieldName][fieldName]
      }
    }
    if (replicaData[fieldName] !== undefined) {
      return replicaData[fieldName]
    }
    const endpoint = type === 'source' ? this.props.sourceEndpoint : this.props.destinationEndpoint
    const plugin = OptionsSchemaPlugin.for(endpoint.type)

    const osMapping = new RegExp('^(windows|linux)').exec(fieldName)
    if (osMapping) {
      const osData = replicaData[`${plugin.migrationImageMapFieldName}/${osMapping[0]}`]
      return osData
    }
    const anyData = this.props.replica as any
    if (migrationFields.find(f => f.name === fieldName) && anyData[fieldName]) {
      return anyData[fieldName]
    }
    if (fieldName === 'skip_os_morphing' && this.props.type === 'migration') {
      return migrationStore.getDefaultSkipOsMorphing(anyData)
    }
    return defaultValue
  }

  async loadData(useCache: boolean) {
    minionPoolStore.loadMinionPools()
    await providerStore.loadProviders()

    const loadAllOptions = async (type: 'source' | 'destination') => {
      const endpoint = type === 'source' ? this.props.sourceEndpoint : this.props.destinationEndpoint
      try {
        await this.loadOptions(endpoint, type, useCache)
        this.loadExtraOptions(null, type, useCache)
      } catch (err) {
        if (type === 'source') {
          this.setState(prevState => {
            let selectedPanel = prevState.selectedPanel
            if (selectedPanel === 'source_options') {
              selectedPanel = 'dest_options'
            }
            return { sourceFailed: true, selectedPanel }
          })
        }
      }
    }

    loadAllOptions('source')
    loadAllOptions('destination')
  }

  async loadOptions(endpoint: Endpoint, optionsType: 'source' | 'destination', useCache: boolean) {
    try {
      await providerStore.loadOptionsSchema({
        providerName: endpoint.type,
        optionsType,
        useCache,
      })
    } catch (err) {
      if (optionsType === 'destination' || this.props.type === 'migration') {
        const destinationFailedMessage = this.props.type === 'replica'
          ? 'An error has occurred during the loading of the Replica\'s options for editing. There could be connection issues with the destination platform. Please retry the operation.'
          : 'An error has occurred during loading of the source or destination platforms\' environment options for editing of the Migration\'s parameters. You may still recreate the Migration with the same parameters as the original one by clicking "Create".'
        this.setState({ destinationFailedMessage })
      }
      throw err
    }
    await providerStore.getOptionsValues({
      optionsType,
      endpointId: endpoint.id,
      providerName: endpoint.type,
      useCache,
    })
  }

  loadExtraOptions(field: Field | null, type: 'source' | 'destination', useCache?: boolean) {
    const endpoint = type === 'source' ? this.props.sourceEndpoint : this.props.destinationEndpoint
    const env = type === 'source' ? this.props.replica.source_environment : this.props.replica.destination_environment
    const stateEnv = type === 'source' ? this.state.sourceData : this.state.destinationData

    const envData = getFieldChangeOptions({
      providerName: endpoint.type,
      schema: type === 'source' ? providerStore.sourceSchema : providerStore.destinationSchema,
      data: {
        ...env,
        ...stateEnv,
      },
      field,
      type,
    })

    if (!envData) {
      return
    }
    providerStore.getOptionsValues({
      optionsType: type,
      endpointId: endpoint.id,
      providerName: endpoint.type,
      useCache,
      envData,
    })
    if (type === 'destination') {
      networkStore.loadNetworks(endpoint.id, envData, { cache: true })
      if (this.hasStorageMap()) {
        endpointStore.loadStorage(this.props.destinationEndpoint.id, envData, { cache: true })
      }
    }
  }

  hasStorageMap(): boolean {
    return providerStore.providers?.[this.props.destinationEndpoint.type]
      ? !!providerStore.providers[this.props.destinationEndpoint.type].types.find(t => t === providerTypes.STORAGE)
      : false
  }

  isUpdateDisabled() {
    const isDestFailed = this.props.type === 'replica' && this.state.destinationFailedMessage
    return this.state.updateDisabled || isDestFailed
  }

  isLoadingDestOptions() {
    return providerStore.destinationSchemaLoading
      || providerStore.destinationOptionsPrimaryLoading
  }

  isLoadingSourceOptions() {
    return providerStore.sourceSchemaLoading
      || providerStore.sourceOptionsPrimaryLoading
  }

  isLoadingNetwork() {
    return this.props.instancesDetailsLoading
  }

  isLoadingStorage() {
    return this.props.instancesDetailsLoading || endpointStore.storageLoading
  }

  isLoading() {
    return this.isLoadingSourceOptions()
      || this.isLoadingDestOptions() || this.isLoadingNetwork()
      || this.isLoadingStorage()
  }

  validateOptions(type: 'source' | 'destination') {
    const env = type === 'source' ? this.props.replica.source_environment : this.props.replica.destination_environment
    const data = type === 'source' ? this.state.sourceData : this.state.destinationData
    const schema = type === 'source' ? providerStore.sourceSchema : providerStore.destinationSchema
    const isValid = isOptionsPageValid({
      ...env,
      ...data,
    }, schema)

    this.setState({ updateDisabled: !isValid })
  }

  handlePanelChange(panel: string) {
    this.setState({ selectedPanel: panel })
  }

  handleReload() {
    this.props.onReloadClick()
    this.loadData(false)
  }

  handleFieldChange(type: 'source' | 'destination', field: Field, value: any, parentFieldName?: string) {
    const data = type === 'source' ? { ...this.state.sourceData } : { ...this.state.destinationData }

    if (field.type === 'array') {
      const replicaData: any = type === 'source' ? this.props.replica.source_environment
        : this.props.replica.destination_environment
      const currentValues: string[] = data[field.name] || []
      const oldValues: string[] = replicaData[field.name] || []
      let values: string[] = currentValues
      if (!currentValues.length) {
        values = [...oldValues]
      }
      if (values.find(v => v === value)) {
        data[field.name] = values.filter(v => v !== value)
      } else {
        data[field.name] = [...values, value]
      }
    } else if (field.groupName) {
      if (!data[field.groupName]) {
        data[field.groupName] = {}
      }
      data[field.groupName][field.name] = value
    } else if (parentFieldName) {
      data[parentFieldName] = data[parentFieldName] || {}
      data[parentFieldName][field.name] = value
    } else {
      data[field.name] = value
    }

    if (field.subFields) {
      field.subFields.forEach(subField => {
        const subFieldKeys = Object.keys(data).filter(k => k.indexOf(subField.name) > -1)
        subFieldKeys.forEach(k => {
          delete data[k]
        })
      })
    }

    const handleStateUpdate = () => {
      if (field.type !== 'string' || field.enum) {
        this.loadExtraOptions(field, type)
      }
      this.validateOptions(type)
    }
    if (type === 'source') {
      this.setState({ sourceData: data }, () => { handleStateUpdate() })
    } else {
      this.setState({ destinationData: data }, () => { handleStateUpdate() })
    }
  }

  async handleUpdateClick() {
    this.setState({ updating: true })

    const updateData: UpdateData = {
      source: this.state.sourceData,
      destination: this.state.destinationData,
      network: this.state.selectedNetworks.length > 0 ? this.getSelectedNetworks() : [],
      storage: this.state.storageMap,
      uploadedScripts: this.state.uploadedScripts,
      removedScripts: this.state.removedScripts,
    }
    if (this.props.type === 'replica') {
      try {
        await replicaStore.update({
          replica: this.props.replica as any,
          sourceEndpoint: this.props.sourceEndpoint,
          destinationEndpoint: this.props.destinationEndpoint,
          updateData,
          defaultStorage: this.getDefaultStorage(),
          storageConfigDefault: endpointStore.storageConfigDefault,
        })
        this.props.onRequestClose()
        this.props.onUpdateComplete(`/replicas/${this.props.replica.id}/executions`)
      } catch (err) {
        this.setState({ updating: false })
      }
    } else {
      try {
        const defaultStorage = EndpointUtils.getBusTypeStorageId(endpointStore.storageBackends, this.props.replica.storage_mappings?.default || null)
        const replicaDefaultStorage: { value: string | null, busType?: string | null } = {
          value: defaultStorage.id,
          busType: defaultStorage.busType,
        }
        const migration: MigrationItemDetails = await migrationStore.recreate(
          this.props.replica as any,
          this.props.sourceEndpoint,
          this.props.destinationEndpoint,
          updateData,
          replicaDefaultStorage,
          this.state.defaultStorage,
          this.props.replica.replication_count,
        )
        migrationStore.clearDetails()
        this.props.onRequestClose()
        this.props.onUpdateComplete(`/migrations/${migration.id}/tasks`)
      } catch (err) {
        this.setState({ updating: false })
      }
    }
  }

  handleNetworkChange(changeObject: WizardNetworksChangeObject) {
    const networkMap = this.state.selectedNetworks
      .filter(n => n.sourceNic.network_name !== changeObject.nic.network_name)
    this.setState({
      selectedNetworks: [...networkMap, {
        sourceNic: changeObject.nic,
        targetNetwork: changeObject.network,
        targetSecurityGroups: changeObject.securityGroups,
        targetPortKey: changeObject.portKey,
      }],
    })
  }

  handleCancelScript(global: 'windows' | 'linux' | null, instanceName: string | null) {
    this.setState(prevState => ({
      uploadedScripts: prevState.uploadedScripts
        .filter(s => (global ? s.global !== global : s.instanceId !== instanceName)),
    }))
  }

  handleScriptUpload(script: InstanceScript) {
    this.setState(prevState => ({
      uploadedScripts: [
        ...prevState.uploadedScripts,
        script,
      ],
    }))
  }

  handleScriptDataRemove(script: InstanceScript) {
    this.setState(prevState => ({
      removedScripts: [
        ...prevState.removedScripts,
        script,
      ],
    }))
  }

  handleStorageChange(mapping: StorageMap) {
    this.setState(prevState => {
      const diskFieldName = mapping.type === 'backend' ? 'storage_backend_identifier' : 'id'
      const storageMap = prevState.storageMap
        .filter(n => n.type !== mapping.type || n.source[diskFieldName] !== mapping.source[diskFieldName])
      storageMap.push(mapping)

      return { storageMap }
    })
  }

  renderDestinationFailedMessage() {
    return (
      <ErrorWrapper>
        <StatusImage status="ERROR" />
        <ErrorMessage>{this.state.destinationFailedMessage}</ErrorMessage>
      </ErrorWrapper>
    )
  }

  renderOptions(type: 'source' | 'destination') {
    const loading = type === 'source' ? (providerStore.sourceSchemaLoading || providerStore.sourceOptionsPrimaryLoading)
      : (providerStore.destinationSchemaLoading || providerStore.destinationOptionsPrimaryLoading)
    if (this.state.destinationFailedMessage) {
      return this.renderDestinationFailedMessage()
    }
    if (loading) {
      return this.renderLoading(`Loading ${type === 'source' ? 'source' : 'target'} options ...`)
    }
    const optionsLoading = type === 'source' ? providerStore.sourceOptionsSecondaryLoading
      : providerStore.destinationOptionsSecondaryLoading
    const schema = type === 'source' ? providerStore.sourceSchema : providerStore.destinationSchema
    const fields = this.props.type === 'replica' ? schema.filter(f => !f.readOnly) : schema
    const extraOptionsConfig = configLoader.config.extraOptionsApiCalls.find(o => {
      const provider = type === 'source' ? this.props.sourceEndpoint.type : this.props.destinationEndpoint.type
      return o.name === provider && o.types.find(t => t === type)
    })
    let optionsLoadingSkipFields: string[] = []
    if (extraOptionsConfig) {
      optionsLoadingSkipFields = extraOptionsConfig.requiredFields
    }
    const endpoint = type === 'source' ? this.props.sourceEndpoint : this.props.destinationEndpoint
    let dictionaryKey = ''
    if (endpoint) {
      dictionaryKey = `${endpoint.type}-${type}`
    }
    const minionPools = minionPoolStore.minionPools
      .filter(m => m.platform === type && m.endpoint_id === endpoint.id)
    return (
      <WizardOptions
        minionPools={minionPools}
        wizardType={`${this.props.type || 'replica'}-${type}-options-edit`}
        getFieldValue={(f, d, pf) => this.getFieldValue(type, f, d, pf)}
        fields={fields}
        selectedInstances={type === 'destination' ? this.props.instancesDetails : null}
        hasStorageMap={type === 'source' ? false : this.hasStorageMap()}
        storageBackends={endpointStore.storageBackends}
        onChange={(f, v, fp) => { this.handleFieldChange(type, f, v, fp) }}
        oneColumnStyle={{
          marginTop: '-16px', display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center',
        }}
        fieldWidth={ThemeProps.inputSizes.large.width}
        onScrollableRef={ref => { this.scrollableRef = ref }}
        availableHeight={384}
        useAdvancedOptions
        layout="modal"
        isSource={type === 'source'}
        optionsLoading={optionsLoading}
        optionsLoadingSkipFields={[...optionsLoadingSkipFields, 'description', 'execute_now',
          'execute_now_options', ...migrationFields.map(f => f.name)]}
        dictionaryKey={dictionaryKey}
      />
    )
  }

  renderStorageMapping() {
    if (this.props.instancesDetailsLoading) {
      return this.renderLoading('Loading instances details ...')
    }

    return (
      <WizardStorage
        loading={endpointStore.storageLoading}
        defaultStorage={this.getDefaultStorage()}
        onDefaultStorageChange={(value, busType) => { this.setState({ defaultStorage: { value, busType } }) }}
        defaultStorageLayout="modal"
        storageBackends={endpointStore.storageBackends}
        instancesDetails={this.props.instancesDetails}
        storageMap={this.getStorageMap(endpointStore.storageBackends)}
        onChange={mapping => { this.handleStorageChange(mapping) }}
        style={{ padding: '32px 32px 0 32px', width: 'calc(100% - 64px)' }}
        titleWidth={160}
        onScrollableRef={ref => { this.scrollableRef = ref }}
      />
    )
  }

  renderNetworkMapping() {
    return (
      <WizardNetworks
        instancesDetails={this.props.instancesDetails}
        loadingInstancesDetails={this.props.instancesDetailsLoading}
        networks={this.props.networks}
        loading={this.props.networksLoading}
        onChange={change => {
          this.handleNetworkChange(change)
        }}
        selectedNetworks={this.getSelectedNetworks()}
        style={{ padding: '32px 32px 0 32px', width: 'calc(100% - 64px)' }}
        titleWidth={160}
      />
    )
  }

  renderUserScripts() {
    return (
      <WizardScripts
        instances={this.props.instancesDetails}
        loadingInstances={this.props.instancesDetailsLoading}
        onScriptUpload={s => { this.handleScriptUpload(s) }}
        onScriptDataRemove={s => { this.handleScriptDataRemove(s) }}
        onCancelScript={(g, i) => { this.handleCancelScript(g, i) }}
        uploadedScripts={this.state.uploadedScripts}
        removedScripts={this.state.removedScripts}
        userScriptData={this.props.replica?.user_scripts}
        scrollableRef={(r: HTMLElement) => { this.scrollableRef = r }}
        style={{ padding: '32px 32px 0 32px', width: 'calc(100% - 64px)' }}
      />
    )
  }

  renderContent() {
    let content = null
    switch (this.state.selectedPanel) {
      case 'source_options':
        content = this.renderOptions('source')
        break
      case 'dest_options':
        content = this.renderOptions('destination')
        break
      case 'network_mapping':
        content = this.renderNetworkMapping()
        break
      case 'user_scripts':
        content = this.renderUserScripts()
        break
      case 'storage_mapping':
        content = this.renderStorageMapping()
        break
      default:
        content = null
    }
    return (
      <PanelContent>
        {content}
        <Buttons>
          <Button
            large
            onClick={this.props.onRequestClose}
            secondary
          >Close
          </Button>
          {this.isLoading() ? (
            <LoadingButton large>Loading ...</LoadingButton>
          ) : this.state.updating ? (
            <LoadingButton large>Updating ...</LoadingButton>
          ) : (
            <Button
              large
              onClick={() => { this.handleUpdateClick() }}
              disabled={this.isUpdateDisabled()}
            >
              {this.props.type === 'replica' ? 'Update' : 'Create'}
            </Button>
          )}
        </Buttons>
      </PanelContent>
    )
  }

  renderLoading(message: string) {
    const loadingMessage = message || 'Loading ...'

    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>{loadingMessage}</LoadingText>
      </LoadingWrapper>
    )
  }

  render() {
    const navigationItems: NavigationItem[] = [
      {
        value: 'source_options',
        label: 'Source Options',
        disabled: this.state.sourceFailed,
        title: this.state.sourceFailed ? 'There are source platform errors, source options can\'t be updated' : '',
        loading: this.isLoadingSourceOptions(),
      },
      {
        value: 'dest_options',
        label: 'Target Options',
        loading: this.isLoadingDestOptions(),
      },
      {
        value: 'network_mapping',
        label: 'Network Mapping',
        loading: this.isLoadingNetwork(),
      },
      {
        value: 'user_scripts',
        label: 'User Scripts',
        loading: this.props.instancesDetailsLoading,
      },
    ]

    if (this.hasStorageMap()) {
      navigationItems.push({
        value: 'storage_mapping',
        label: 'Storage Mapping',
        loading: this.isLoadingStorage(),
      })
    }

    return (
      <Modal
        isOpen={this.props.isOpen}
        title={`${this.props.type === 'replica' ? 'Edit Replica' : 'Recreate Migration'}`}
        onRequestClose={this.props.onRequestClose}
        contentStyle={{ width: '800px' }}
        onScrollableRef={() => this.scrollableRef}
        fixedHeight={512}
      >
        <Panel
          navigationItems={navigationItems}
          content={this.renderContent()}
          onChange={navItem => { this.handlePanelChange(navItem.value) }}
          selectedValue={this.state.selectedPanel}
          onReloadClick={() => { this.handleReload() }}
          reloadLabel={this.props.type === 'replica' ? 'Reload All Replica Options' : 'Reload All Migration Options'}
        />
      </Modal>
    )
  }
}

export default TransferItemModal
