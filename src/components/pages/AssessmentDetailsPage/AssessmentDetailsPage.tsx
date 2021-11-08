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
import cookie from 'js-cookie'
import { observer } from 'mobx-react'

import DetailsTemplate from '../../templates/DetailsTemplate'
import DetailsPageHeader from '../../organisms/DetailsPageHeader'
import DetailsContentHeader from '../../organisms/DetailsContentHeader'
import AssessmentDetailsContent from '../../organisms/AssessmentDetailsContent'
import Modal from '../../molecules/Modal'
import AssessmentMigrationOptions from '../../organisms/AssessmentMigrationOptions'
import type { Endpoint } from '../../../@types/Endpoint'
import type { Nic } from '../../../@types/Instance'
import type { VmItem } from '../../../@types/Assessment'
import type { Field } from '../../../@types/Field'
import type { Network, NetworkMap } from '../../../@types/Network'

import azureStore from '../../../stores/AzureStore'
import type { LocalData } from '../../../stores/AzureStore'
import endpointStore from '../../../stores/EndpointStore'
import notificationStore from '../../../stores/NotificationStore'
import replicaStore from '../../../stores/ReplicaStore'
import instanceStore from '../../../stores/InstanceStore'
import networkStore from '../../../stores/NetworkStore'
import userStore from '../../../stores/UserStore'
import assessmentStore from '../../../stores/AssessmentStore'
import providerStore from '../../../stores/ProviderStore'

import assessmentImage from './images/assessment.svg'
import DomUtils from '../../../utils/DomUtils'

const Wrapper = styled.div<any>``

type Props = {
  match: any,
  history: any,
}
type State = {
  selectedNetworks: NetworkMap[],
  showMigrationOptions: boolean,
  executeButtonDisabled: boolean,
  vmSearchValue: string,
  loadingTargetVmSizes: boolean,
  replicaSchema: Field[],
  migrationSchema: Field[],
}
@observer
class AssessmentDetailsPage extends React.Component<Props, State> {
  state: State = {
    selectedNetworks: [],
    showMigrationOptions: false,
    executeButtonDisabled: false,
    vmSearchValue: '',
    loadingTargetVmSizes: false,
    replicaSchema: [],
    migrationSchema: [],
  }

  UNSAFE_componentWillMount() {
    document.title = 'Assessment Details'
    const urlData: LocalData = DomUtils.decodeFromBase64Url(this.props.match.params.info)
    if (!azureStore.loadLocalData(urlData.assessmentName)) {
      azureStore.setLocalData(urlData)
    }
    this.azureAuthenticate()
  }

  componentWillUnmount() {
    azureStore.clearAssessmentDetails()
    azureStore.clearAssessedVms()
    instanceStore.clearInstancesDetails()
  }

  getLocalData(): LocalData {
    // at this point we know for sure that at least URL data is there
    const data: any = azureStore.localData
    return data
  }

  getUrlInfo() {
    return DomUtils.decodeFromBase64Url(this.props.match.params.info)
  }

  getSourceEndpoints() {
    const vms = azureStore.assessedVms
    const connectionsInfo = endpointStore.connectionsInfo

    if (vms.length === 0 || connectionsInfo.length === 0) {
      return []
    }
    const endpoints = connectionsInfo.filter(
      endpoint => vms.find(vm => endpoint.connection_info.host
        && endpoint.connection_info.host.toLowerCase() === vm.properties
          .datacenterManagementServerName.toLowerCase()),
    )
    return endpoints
  }

  getTargetEndpoints() {
    const endpoints = endpointStore.endpoints
    return endpoints.filter(e => e.type === 'azure')
  }

  getInstancesDetailsProgress() {
    const count = instanceStore.instancesDetailsCount
    if (count < 5) {
      return null
    }
    const remaining = instanceStore.instancesDetailsRemaining
    return (count - remaining) / count
  }

  getFilteredAssessedVms(vms?: VmItem[]) {
    let usableVms = vms
    if (!usableVms) {
      usableVms = azureStore.assessedVms
    }
    return usableVms.filter(vm => `${vm.properties.displayName}`.toLowerCase().indexOf(this.state.vmSearchValue.toLowerCase()) > -1)
  }

  getSourceEndpointId() {
    const localData = this.getLocalData()
    return localData.sourceEndpoint ? localData.sourceEndpoint.id : null
  }

  getEnabledVms() {
    const sourceConnInfo = endpointStore.connectionsInfo
      .find(e => e.id === this.getSourceEndpointId())
    if (!sourceConnInfo) {
      return []
    }

    const sourceHost = sourceConnInfo.connection_info.host
    if (!sourceHost) {
      return []
    }
    return azureStore.assessedVms.filter(vm => {
      if (vm.properties.datacenterManagementServerName.toLowerCase() === sourceHost.toLowerCase()
        && instanceStore.instances.find(i => i.name === vm.properties.displayName
          || i.instance_name === vm.properties.displayName)) {
        return true
      }
      return false
    })
  }

  getSelectAllVmsChecked() {
    if (this.getFilteredAssessedVms().length === 0 || this.getEnabledVms().length === 0) {
      return false
    }
    const selectedVms = this.getLocalData().selectedVms
    return selectedVms.length === this.getFilteredAssessedVms(this.getEnabledVms()).length
  }

  handleVmSelectedChange(vm: VmItem, selected: boolean) {
    let selectedVms = this.getLocalData().selectedVms
    const instanceInfo = instanceStore.instances.find(i => i.name === vm.properties.displayName
      || i.instance_name === vm.properties.displayName)
    if (selected) {
      selectedVms = [
        ...selectedVms,
        vm.properties.displayName,
      ]
      azureStore.updateSelectedVms(selectedVms)
      if (instanceStore.loadingInstancesDetails) {
        this.loadInstancesDetails()
        return
      }
      const sourceEndpointId = this.getSourceEndpointId()
      if (!sourceEndpointId || !instanceInfo) {
        return
      }
      const localData = this.getLocalData()
      instanceStore.addInstanceDetails({
        endpointId: sourceEndpointId,
        instanceInfo,
        cache: true,
        env: {
          location: localData.locationName,
          resource_group: localData.resourceGroupName,
        },
        targetProvider: 'azure',
      })
    } else {
      selectedVms = selectedVms.filter(m => m !== vm.properties.displayName)
      azureStore.updateSelectedVms(selectedVms)
      if (instanceStore.loadingInstancesDetails) {
        this.loadInstancesDetails()
        return
      }
      if (instanceInfo) {
        instanceStore.removeInstanceDetails(instanceInfo)
      }
    }
  }

  handleSelectAllVmsChange(selected: boolean) {
    const selectedVms = selected ? [...this.getFilteredAssessedVms(this.getEnabledVms())] : []
    azureStore.updateSelectedVms(selectedVms.map(v => v.properties.displayName))
    this.loadInstancesDetails()
  }

  handleSourceEndpointChange(sourceEndpoint: Endpoint | null) {
    this.setState({ selectedNetworks: [] })
    azureStore.updateSourceEndpoint(sourceEndpoint)
    const sourceEndpointId = this.getSourceEndpointId()
    if (!sourceEndpointId) {
      return
    }
    instanceStore.loadInstances(sourceEndpointId).then(() => {
      this.initSelectedVms()
      this.loadInstancesDetails()
    })
  }

  handleResourceGroupChange(resourceGroupName: string) {
    azureStore.updateResourceGroup(resourceGroupName)
    this.loadNetworks()
    this.loadTargetVmSizes()
  }

  handleLocationChange(locationName: string) {
    azureStore.updateLocation(locationName)
    this.loadNetworks()
    this.loadTargetVmSizes()
  }

  handleTargetEndpointChange(endpoint: Endpoint) {
    azureStore.updateTargetEndpoint(endpoint)
    this.loadTargetOptions().then(() => {
      this.loadTargetVmSizes()
      this.loadNetworks()
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

  handleNetworkChange(sourceNic: Nic, targetNetwork: Network) {
    this.setState(prevState => {
      let selectedNetworks = prevState.selectedNetworks

      selectedNetworks = selectedNetworks
        .filter(n => n.sourceNic.network_name !== sourceNic.network_name)
      selectedNetworks.push({ sourceNic, targetNetwork })
      return { selectedNetworks }
    })
  }

  handleRefresh() {
    localStorage.removeItem('instances')
    localStorage.removeItem(`assessments-${cookie.get('projectId') || ''}`)
    localStorage.removeItem('instancesDetails')
    localStorage.removeItem('networks')
    window.location.reload()
  }

  handleMigrateClick() {
    const endpointType = this.getLocalData().endpoint.type
    providerStore.loadOptionsSchema({
      providerName: endpointType,
      optionsType: 'destination',
    }).then(() => {
      this.setState({ replicaSchema: providerStore.destinationSchema })
      return providerStore.loadOptionsSchema({
        providerName: endpointType,
        optionsType: 'destination',
      })
    }).then(() => {
      this.setState({ migrationSchema: providerStore.destinationSchema })
    })
    this.setState({ showMigrationOptions: true })
  }

  handleCloseMigrationOptions() {
    this.setState({ showMigrationOptions: false })
  }

  handleVmSizeChange(vmId: string, vmSize: string) {
    azureStore.updateVmSize(vmId, vmSize)
  }

  handleGetVmSize(vm: VmItem): string {
    return this.getLocalData().selectedVmSizes[vm.properties.displayName]
  }

  handleVmSearchValueChange(vmSearchValue: string) {
    this.setState({ vmSearchValue })
  }

  azureAuthenticate() {
    const connectionInfo = this.getUrlInfo().connectionInfo
    azureStore.authenticate(connectionInfo).then(() => {
      this.loadAssessmentDetails()
    })
  }

  loadEndpoints() {
    endpointStore.getEndpoints({ showLoading: true }).then(() => {
      this.loadSourceEndpointsInfo()
    })
  }

  loadSourceEndpointsInfo() {
    endpointStore.getConnectionsInfo(endpointStore.endpoints.filter(e => e.type === 'vmware_vsphere')).then(() => {
      const endpoints = this.getSourceEndpoints()
      const sourceEndpoint = endpoints.find(e => e.id === this.getSourceEndpointId())
      if (sourceEndpoint) {
        this.handleSourceEndpointChange(sourceEndpoint)
      } else if (endpoints.length > 0) {
        this.handleSourceEndpointChange(endpoints[0])
      } else {
        this.handleSourceEndpointChange(null)
      }
    })
  }

  loadAssessmentDetails() {
    const urlInfo = this.getUrlInfo()
    azureStore.getAssessmentDetails({ ...urlInfo }).then(() => {
      const location = azureStore.assessmentDetails ? azureStore.assessmentDetails.properties.azureLocation : ''
      azureStore.setLocation(location)
      // azureStore.getVmSizes({ ...urlInfo, location })
      this.loadNetworks()
      this.loadTargetOptions()
      this.loadTargetVmSizes()
    })

    azureStore.getAssessedVms({ ...urlInfo }).then(() => {
      this.initVmSizes()
      this.loadEndpoints()
    })
  }

  async loadTargetOptions(): Promise<void> {
    const localData = this.getLocalData()
    const options = await providerStore.getOptionsValues({
      optionsType: 'destination',
      endpointId: localData.endpoint.id,
      providerName: localData.endpoint.type,
      allowMultiple: true,
    })
    const locations = options.find(o => o.name === 'location') as any
    if (locations && locations.values) {
      const localDataFind = locations.values
        .find((l: { id: string }) => l.id === localData.locationName)
      if (!localDataFind) {
        azureStore.updateLocation(locations.values[0].id)
      }

      azureStore.saveLocations(locations.values)
    }
    const resourceGroups = options.find(o_1 => o_1.name === 'resource_group') as any
    if (resourceGroups && resourceGroups.values) {
      const localDataFind = resourceGroups.values
        .find((g: string) => g === localData.resourceGroupName)
      if (!localDataFind) {
        azureStore.updateResourceGroup(resourceGroups.values[0] as string)
      }
      azureStore.saveResourceGroups(resourceGroups.values)
    }
  }

  loadTargetVmSizes() {
    const localData = this.getLocalData()
    this.setState({ loadingTargetVmSizes: true })
    providerStore.getOptionsValues({
      optionsType: 'destination',
      endpointId: localData.endpoint.id,
      providerName: localData.endpoint.type,
      envData: {
        location: localData.locationName,
        resource_group: localData.resourceGroupName,
      },
      allowMultiple: true,
    }).then(options => {
      const vmSizes: any = options.find(o => o.name === 'vm_size')
      if (vmSizes && vmSizes.values) {
        azureStore.saveTargetVmSizes(vmSizes.values)
      }
      this.setState({ loadingTargetVmSizes: false })
    })
  }

  initSelectedVms() {
    const localData = this.getLocalData()
    const enabledVms = this.getEnabledVms().map(vm => vm.properties.displayName)
    if (localData.selectedVms.length === 0) {
      azureStore.updateSelectedVms(enabledVms)
    } else {
      azureStore.updateSelectedVms(
        enabledVms.filter(id => localData.selectedVms.find(i => i === id)),
      )
    }
  }

  initVmSizes() {
    const vmSizes: any = {}
    const vms = azureStore.assessedVms
    const localData = this.getLocalData()

    vms.forEach(vm => {
      vmSizes[vm.properties.displayName] = localData.selectedVmSizes[vm.properties.displayName] || vm.properties.recommendedSize || 'auto'
    })
    azureStore.updateVmSizes(vmSizes)
  }

  loadNetworks() {
    const localData = this.getLocalData()
    this.setState({ selectedNetworks: [] })
    networkStore.loadNetworks(localData.endpoint.id, {
      location: localData.locationName,
      resource_group: localData.resourceGroupName,
    }, { cache: true })
  }

  loadInstancesDetails() {
    const localData = this.getLocalData()
    const selectedVms = localData.selectedVms
    const instancesInfo = instanceStore.instances.filter(i => selectedVms
      .find(m => i.instance_name === m || i.name === m))
    instanceStore.clearInstancesDetails()
    const sourceEndpointId = this.getSourceEndpointId()
    if (!sourceEndpointId) {
      return
    }
    instanceStore.loadInstancesDetails({
      endpointId: sourceEndpointId,
      instances: instancesInfo,
      // cache: true,
      skipLog: true,
      env: {
        location: localData.locationName,
        resource_group: localData.resourceGroupName,
      },
      targetProvider: 'azure',
    })
  }

  handleMigrationExecute(fieldValues: { [prop: string]: any }) {
    const selectedVms = this.getLocalData().selectedVms
    const selectedInstances = instanceStore.instancesDetails
      .filter(i => selectedVms.find(m => i.name === m || i.instance_name === m))
    const vmSizes: any = {}
    const localData = this.getLocalData()
    selectedInstances.forEach(i => {
      const vm = selectedVms.find(m => i.name === m || i.instance_name === m)
      const selectedVmSize = localData.selectedVmSizes[i.instance_name || i.name]
      if (vm && azureStore.vmSizes.find(s => s === selectedVmSize)) {
        vmSizes[i.instance_name || i.name] = selectedVmSize
      }
    })

    this.setState({ executeButtonDisabled: true })
    const fieldValuesLocal = fieldValues
    fieldValuesLocal.resource_group = localData.resourceGroupName
    fieldValuesLocal.location = localData.locationName

    assessmentStore.migrate({
      source: localData.sourceEndpoint,
      target: localData.endpoint,
      networks: [...this.state.selectedNetworks],
      fieldValues: fieldValuesLocal,
      vmSizes,
      selectedInstances,
    }).then(() => {
      this.setState({ showMigrationOptions: false })
      const type = fieldValuesLocal.use_replica ? 'Replica' : 'Migration'
      notificationStore.alert(`${type} was succesfully created`, 'success')

      if (type === 'Replica') {
        assessmentStore.migrations.forEach(replica => {
          replicaStore.execute(replica.id, [{ name: 'shutdown_instances', value: fieldValuesLocal.shutdown_instances || false }])
        })
      }

      this.props.history.push(`/${type.toLowerCase()}s`)
    })
  }

  render() {
    const details = azureStore.assessmentDetails
    const loading = azureStore.loadingAssessmentDetails || azureStore.authenticating
      || azureStore.loadingAssessedVms
    const endpointsLoading = endpointStore.connectionsInfoLoading || endpointStore.loading
    const status = details ? details.properties.status.toUpperCase() : ''
    const statusLabel = status === 'COMPLETED' ? 'READY' : status
    const localData = this.getLocalData()

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
              statusPill={status}
              statusLabel={statusLabel}
              itemTitle={details?.name}
              itemType="Azure Migrate"
              backLink="/planning"
              typeImage={assessmentImage}
            />
)}
          contentComponent={(
            <AssessmentDetailsContent
              item={details}
              detailsLoading={loading}
              instancesDetailsLoading={instanceStore.loadingInstancesDetails}
              instancesDetailsProgress={this.getInstancesDetailsProgress()}
              instancesLoading={instanceStore.instancesLoading}
              networksLoading={networkStore.loading}
              targetEndpointsLoading={endpointStore.loading}
              loadingVmSizes={this.state.loadingTargetVmSizes}
              sourceEndpointsLoading={endpointsLoading}
              targetOptionsLoading={providerStore.destinationOptionsSecondaryLoading}
              targetEndpoints={this.getTargetEndpoints()}
              targetEndpoint={localData.endpoint}
              onTargetEndpointChange={endpoint => { this.handleTargetEndpointChange(endpoint) }}
              sourceEndpoints={this.getSourceEndpoints()}
              sourceEndpoint={localData.sourceEndpoint}
              locations={azureStore.locations}
              selectedLocation={localData.locationName}
              onLocationChange={locationName => { this.handleLocationChange(locationName) }}
              selectedResourceGroup={localData.resourceGroupName}
              resourceGroups={azureStore.coriolisResourceGroups}
              onResourceGroupChange={resourceGroupName => {
                this.handleResourceGroupChange(resourceGroupName)
              }}
              assessedVmsCount={azureStore.assessedVms.length}
              filteredAssessedVms={this.getFilteredAssessedVms()}
              onSourceEndpointChange={endpoint => this.handleSourceEndpointChange(endpoint)}
              selectedVms={localData.selectedVms}
              onVmSelectedChange={(vm, selected) => { this.handleVmSelectedChange(vm, selected) }}
              selectAllVmsChecked={this.getSelectAllVmsChecked()}
              onSelectAllVmsChange={checked => { this.handleSelectAllVmsChange(checked) }}
              instances={instanceStore.instances}
              instancesDetails={instanceStore.instancesDetails}
              networks={networkStore.networks}
              selectedNetworks={this.state.selectedNetworks}
              vmSizes={azureStore.vmSizes}
              onVmSizeChange={(vmId, size) => { this.handleVmSizeChange(vmId, size) }}
              onGetSelectedVmSize={vm => this.handleGetVmSize(vm)}
              vmSearchValue={this.state.vmSearchValue}
              onVmSearchValueChange={value => { this.handleVmSearchValueChange(value) }}
              onNetworkChange={(sourceNic, targetNetwork) => {
                this.handleNetworkChange(sourceNic, targetNetwork)
              }}
              onRefresh={() => this.handleRefresh()}
              onMigrateClick={() => { this.handleMigrateClick() }}
            />
          )}
        />
        <Modal
          isOpen={this.state.showMigrationOptions}
          title="Options"
          onRequestClose={() => { this.handleCloseMigrationOptions() }}
        >
          <AssessmentMigrationOptions
            onCancelClick={() => { this.handleCloseMigrationOptions() }}
            onExecuteClick={fieldValues => { this.handleMigrationExecute(fieldValues) }}
            replicaSchema={this.state.replicaSchema}
            migrationSchema={this.state.migrationSchema}
            executeButtonDisabled={this.state.executeButtonDisabled}
          />
        </Modal>
      </Wrapper>
    )
  }
}

export default AssessmentDetailsPage
