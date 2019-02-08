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

// @flow

import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import providerStore, { getFieldChangeDestOptions } from '../../../stores/ProviderStore'
import replicaStore from '../../../stores/ReplicaStore'
import endpointStore from '../../../stores/EndpointStore'

import Button from '../../atoms/Button'
import StatusImage from '../../atoms/StatusImage'
import Modal from '../../molecules/Modal'
import Panel from '../../molecules/Panel'
import { isOptionsPageValid } from '../../organisms/WizardPageContent'
import WizardNetworks from '../../organisms/WizardNetworks'
import WizardOptions from '../../organisms/WizardOptions'
import WizardStorage from '../WizardStorage/WizardStorage'

import type { MainItem } from '../../../types/MainItem'
import type { NavigationItem } from '../../molecules/Panel'
import type { Endpoint, StorageBackend, StorageMap } from '../../../types/Endpoint'
import type { Field } from '../../../types/Field'
import type { Instance, Nic, Disk } from '../../../types/Instance'
import type { Network, NetworkMap } from '../../../types/Network'

import { storageProviders } from '../../../config'
import StyleProps from '../../styleUtils/StyleProps'

const PanelContent = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
`
const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0;
`
const LoadingText = styled.div`
  font-size: 18px;
  margin-top: 32px;
`
const Buttons = styled.div`
  margin-top: 32px;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
`
const Empty = styled.div``

type Props = {
  isOpen: boolean,
  onRequestClose: () => void,
  replica: MainItem,
  destinationEndpoint: Endpoint,
  instancesDetails: Instance[],
  instancesDetailsLoading: boolean,
  networks: Network[],
}
type State = {
  selectedPanel: string,
  destinationData: any,
  updateDisabled: boolean,
  selectedNetworks: NetworkMap[],
  storageMap: StorageMap[],
}

@observer
class EditReplica extends React.Component<Props, State> {
  state = {
    selectedPanel: 'dest_options',
    destinationData: {},
    updateDisabled: false,
    selectedNetworks: [],
    storageMap: [],
  }

  scrollableRef: HTMLElement

  componentWillMount() {
    if (this.hasStorageMap()) {
      endpointStore.loadStorage(this.props.destinationEndpoint.id, {})
    }

    providerStore.loadDestinationSchema(this.props.destinationEndpoint.type, 'replica').then(() => {
      return providerStore.getDestinationOptions(this.props.destinationEndpoint.id, this.props.destinationEndpoint.type)
    }).then(() => {
      this.loadEnvDestinationOptions()
    })
  }

  hasStorageMap() {
    return Boolean(storageProviders.find(p => p === this.props.destinationEndpoint.type))
  }

  isUpdateDisabled() {
    let isLoadingDestOptions = this.state.selectedPanel === 'dest_options'
      && (providerStore.destinationSchemaLoading || providerStore.destinationOptionsLoading)
    let isLoadingNetwork = this.state.selectedPanel === 'network_mapping' && this.props.instancesDetailsLoading
    let isLoadingStorage = this.state.selectedPanel === 'storage_mapping'
      && (this.props.instancesDetailsLoading || endpointStore.storageLoading)
    return this.state.updateDisabled || isLoadingDestOptions || isLoadingNetwork || isLoadingStorage
  }

  parseReplicaData() {
    let data = {}
    let destEnv = this.props.replica.destination_environment
    if (!destEnv) {
      return data
    }
    Object.keys(destEnv).forEach(key => {
      if (destEnv[key] && typeof destEnv[key] === 'object') {
        Object.keys(destEnv[key]).forEach(subkey => {
          let destParent: any = destEnv[key]
          if (destParent[subkey]) {
            data[`${key}/${subkey}`] = destParent[subkey]
          }
        })
      } else {
        data[key] = destEnv[key]
      }
    })
    return data
  }

  loadEnvDestinationOptions(field?: Field) {
    let envData = getFieldChangeDestOptions({
      provider: this.props.destinationEndpoint.type,
      destSchema: providerStore.destinationSchema,
      data: {
        ...this.parseReplicaData(),
        ...this.state.destinationData,
      },
      field,
    })

    if (envData) {
      providerStore.getDestinationOptions(this.props.destinationEndpoint.id, this.props.destinationEndpoint.type, envData)
    }
  }

  validateDestinationOptions() {
    let isValid = isOptionsPageValid({
      ...this.parseReplicaData(),
      ...this.state.destinationData,
    }, providerStore.destinationSchema)

    this.setState({ updateDisabled: !isValid })
  }

  handlePanelChange(panel: string) {
    this.setState({ selectedPanel: panel })
  }

  handleDestinationFieldChange(field: Field, value: any) {
    let destinationData = { ...this.state.destinationData }
    if (field.type === 'array') {
      let oldValues: string[] = destinationData[field.name] || []
      if (oldValues.find(v => v === value)) {
        destinationData[field.name] = oldValues.filter(v => v !== value)
      } else {
        destinationData[field.name] = [...oldValues, value]
      }
    } else {
      destinationData[field.name] = value
    }

    this.setState({ destinationData }, () => {
      if (field.type !== 'string' || field.enum) {
        this.loadEnvDestinationOptions(field)
      }

      this.validateDestinationOptions()
    })
  }

  handleUpdateClick() {
    this.setState({ updateDisabled: true })

    replicaStore.update(this.props.replica, this.props.destinationEndpoint, {
      destination: this.state.destinationData,
      network: this.state.selectedNetworks.length > 0 ? this.getSelectedNetworks() : [],
      storage: this.state.destinationData.default_storage || this.state.storageMap.length > 0 ? this.getStorageMap() : [],
    }).then(() => {
      window.location.href = `/#/replica/executions/${this.props.replica.id}`
      this.props.onRequestClose()
    })
  }

  handleNetworkChange(sourceNic: Nic, targetNetwork: Network) {
    this.setState({
      selectedNetworks: [...this.state.selectedNetworks, { sourceNic, targetNetwork }],
    })
  }

  handleStorageChange(source: Disk, target: StorageBackend, type: 'backend' | 'disk') {
    let diskFieldName = type === 'backend' ? 'storage_backend_identifier' : 'id'
    let storageMap = this.state.storageMap
      .filter(n => n.type !== type || n.source[diskFieldName] !== source[diskFieldName])
    storageMap.push({ source, target, type })

    this.setState({ storageMap })
  }

  getFieldValue(fieldName: string, defaultValue: any) {
    if (this.state.destinationData[fieldName] === undefined) {
      let replicaData = this.parseReplicaData()
      if (replicaData[fieldName] !== undefined) {
        return replicaData[fieldName]
      }
      return defaultValue
    }
    return this.state.destinationData[fieldName]
  }

  getSelectedNetworks(): NetworkMap[] {
    let selectedNetworks: NetworkMap[] = []
    let networkMap = this.props.replica.network_map

    if (networkMap) {
      Object.keys(networkMap).forEach(sourceNetworkName => {
        let network = this.props.networks.find(n => n.name === networkMap[sourceNetworkName])
        if (!network) {
          return
        }
        selectedNetworks.push({
          sourceNic: { id: '', network_name: sourceNetworkName, mac_address: '', network_id: '' },
          targetNetwork: network,
        })
      })
    }
    selectedNetworks = selectedNetworks.map(mapping => {
      let updatedMapping = this.state.selectedNetworks.find(m => m.sourceNic.network_name === mapping.sourceNic.network_name)
      return updatedMapping || mapping
    })
    return selectedNetworks
  }

  getStorageMap(): StorageMap[] {
    let storageMap: StorageMap[] = []
    let currentStorage = this.props.replica.storage_mappings || {}
    let buildStorageMap = (type: 'backend' | 'disk', mapping: any) => {
      return {
        type,
        source: { storage_backend_identifier: mapping.source, id: mapping.disk_id },
        target: { name: mapping.destination, id: mapping.destination },
      }
    }
    let backendMappings = currentStorage.backend_mappings || []
    backendMappings.forEach(mapping => {
      storageMap.push(buildStorageMap('backend', mapping))
    })

    let diskMappings = currentStorage.disk_mappings || []
    diskMappings.forEach(mapping => {
      storageMap.push(buildStorageMap('disk', mapping))
    })

    this.state.storageMap.forEach(mapping => {
      let fieldName = mapping.type === 'backend' ? 'storage_backend_identifier' : 'id'
      let existingMapping = storageMap.find(m => m.type === mapping.type &&
        // $FlowIgnore
        m[fieldName] === mapping[fieldName]
      )
      if (existingMapping) {
        existingMapping.target = mapping.target
      } else {
        storageMap.push(mapping)
      }
    })

    return storageMap
  }

  renderDestinationOptions() {
    if (providerStore.destinationSchemaLoading || providerStore.destinationOptionsLoading) {
      return this.renderLoading('Loading destination options ...')
    }

    return (
      <WizardOptions
        wizardType="dest-edit"
        getFieldValue={(f, d) => this.getFieldValue(f, d)}
        fields={providerStore.destinationSchema.filter(f => !f.readOnly)}
        hasStorageMap={this.hasStorageMap()}
        onChange={(f, v) => { this.handleDestinationFieldChange(f, v) }}
        storageBackends={endpointStore.storageBackends}
        useAdvancedOptions
        columnStyle={{ marginRight: 0 }}
        fieldWidth={StyleProps.inputSizes.large.width}
        onScrollableRef={ref => { this.scrollableRef = ref }}
      />
    )
  }

  renderStorageMapping() {
    if (!this.hasStorageMap()) {
      return <Empty>The destination endpoint does not have storage listing.</Empty>
    }

    if (this.props.instancesDetailsLoading) {
      return this.renderLoading('Loading instances details ...')
    }
    if (endpointStore.storageLoading) {
      return this.renderLoading('Loading storage ...')
    }

    return (
      <WizardStorage
        storageBackends={endpointStore.storageBackends}
        instancesDetails={this.props.instancesDetails}
        storageMap={this.getStorageMap()}
        defaultStorage={this.getFieldValue('default_storage')}
        onChange={(s, t, type) => { this.handleStorageChange(s, t, type) }}
      />
    )
  }

  renderNetworkMapping() {
    return (
      <WizardNetworks
        instancesDetails={this.props.instancesDetails}
        loadingInstancesDetails={this.props.instancesDetailsLoading}
        networks={this.props.networks}
        loading={false}
        onChange={(nic, network) => { this.handleNetworkChange(nic, network) }}
        selectedNetworks={this.getSelectedNetworks()}
      />
    )
  }

  renderContent() {
    let content = null
    switch (this.state.selectedPanel) {
      case 'dest_options':
        content = this.renderDestinationOptions()
        break
      case 'network_mapping':
        content = this.renderNetworkMapping()
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
          >Cancel</Button>
          <Button
            large
            onClick={() => { this.handleUpdateClick() }}
            disabled={this.isUpdateDisabled()}
          >Update</Button>
        </Buttons>
      </PanelContent>
    )
  }

  renderLoading(message: string) {
    let loadingMessage = message || 'Loading ...'

    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>{loadingMessage}</LoadingText>
      </LoadingWrapper>
    )
  }

  render() {
    const navigationItems: NavigationItem[] = [
      { value: 'dest_options', label: 'Destination Options' },
      { value: 'network_mapping', label: 'Network Mapping' },
      { value: 'storage_mapping', label: 'Storage Mapping' },
    ]

    return (
      <Modal
        isOpen={this.props.isOpen}
        title="Edit Replica"
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
        />
      </Modal>
    )
  }
}

export default EditReplica
