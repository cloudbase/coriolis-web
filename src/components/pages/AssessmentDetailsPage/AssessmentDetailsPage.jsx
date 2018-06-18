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

import DetailsTemplate from '../../templates/DetailsTemplate'
import { DetailsPageHeader } from '../../organisms/DetailsPageHeader'
import DetailsContentHeader from '../../organisms/DetailsContentHeader'
import AssessmentDetailsContent from '../../organisms/AssessmentDetailsContent'
import Modal from '../../molecules/Modal'
import AssessmentMigrationOptions from '../../organisms/AssessmentMigrationOptions'
import type { Endpoint } from '../../../types/Endpoint'
import type { Nic } from '../../../types/Instance'
import type { VmItem, VmSize } from '../../../types/Assessment'
import type { Field } from '../../../types/Field'
import type { Network, NetworkMap } from '../../../types/Network'

import azureStore from '../../../stores/AzureStore'
import endpointStore from '../../../stores/EndpointStore'
import notificationStore from '../../../stores/NotificationStore'
import replicaStore from '../../../stores/ReplicaStore'
import instanceStore from '../../../stores/InstanceStore'
import networkStore from '../../../stores/NetworkStore'
import userStore from '../../../stores/UserStore'
import assessmentStore from '../../../stores/AssessmentStore'

import assessmentImage from './images/assessment.svg'

const Wrapper = styled.div``

type Props = {
  match: any,
}
type State = {
  sourceEndpoint: ?Endpoint,
  selectedVms: VmItem[],
  selectedNetworks: NetworkMap[],
  showMigrationOptions: boolean,
  executeButtonDisabled: boolean,
  vmSizes: { [string]: VmSize },
  vmSearchValue: string,
}
@observer
class AssessmentDetailsPage extends React.Component<Props, State> {
  constructor() {
    super()

    this.state = {
      sourceEndpoint: null,
      selectedVms: [],
      selectedNetworks: [],
      showMigrationOptions: false,
      executeButtonDisabled: false,
      vmSizes: {},
      vmSearchValue: '',
    }
  }

  componentWillMount() {
    document.title = 'Assessment Details'

    this.azureAuthenticate()
  }

  componentWillUnmount() {
    azureStore.clearAssessmentDetails()
    azureStore.clearAssessedVms()
    instanceStore.clearInstancesDetails()
  }

  getUrlInfo() {
    let urlInfo = JSON.parse(atob(decodeURIComponent(this.props.match.params.info)))
    return urlInfo
  }

  getEndpoints() {
    let vms = azureStore.assessedVms
    let connectionsInfo = endpointStore.connectionsInfo

    if (vms.length === 0 || connectionsInfo.length === 0) {
      return []
    }
    let endpoints = connectionsInfo.filter(
      // $FlowIgnore
      endpoint => vms.find(vm => vm.properties.datacenterManagementServer.toLowerCase() === endpoint.connection_info.host.toLowerCase())
    )
    return endpoints
  }

  getInstancesDetailsProgress() {
    let count = instanceStore.instancesDetailsCount
    if (count < 5) {
      return null
    }
    let remaining = instanceStore.instancesDetailsRemaining
    return (count - remaining) / count
  }

  getFilteredAssessedVms(vms?: VmItem[]) {
    if (!vms) {
      vms = azureStore.assessedVms
    }
    return vms.filter(vm =>
      `${vm.properties.datacenterContainer}/${vm.properties.displayName}`.toLowerCase().indexOf(this.state.vmSearchValue.toLowerCase()) > -1
    )
  }

  getSourceEndpointId() {
    return this.state.sourceEndpoint ? this.state.sourceEndpoint.id : ''
  }

  getEnabledVms() {
    let sourceConnInfo = endpointStore.connectionsInfo.find(e => e.id === this.getSourceEndpointId())
    if (!sourceConnInfo) {
      return []
    }

    let sourceHost = sourceConnInfo.connection_info.host
    if (!sourceHost) {
      return []
    }
    return azureStore.assessedVms.filter(vm => {
      if (vm.properties.datacenterManagementServer.toLowerCase() === sourceHost.toLowerCase() &&
        instanceStore.instances.find(i => i.instance_name === `${vm.properties.datacenterContainer}/${vm.properties.displayName}`)) {
        return true
      }
      return false
    })
  }

  getSelectAllVmsChecked() {
    if (this.getFilteredAssessedVms().length === 0 || this.getEnabledVms().length === 0) {
      return false
    }

    return this.state.selectedVms.length === this.getFilteredAssessedVms(this.getEnabledVms()).length
  }

  handleVmSelectedChange(vm: VmItem, selected: boolean) {
    if (selected) {
      this.setState({ selectedVms: [...this.state.selectedVms, vm] }, () => { this.loadInstancesDetails() })
    } else {
      this.setState({ selectedVms: this.state.selectedVms.filter(m => m.id !== vm.id) }, () => { this.loadInstancesDetails() })
    }
  }

  handleSelectAllVmsChange(selected: boolean) {
    let selectedVms = selected ? [...this.getFilteredAssessedVms(this.getEnabledVms())] : []
    this.setState({ selectedVms }, () => { this.loadInstancesDetails() })
  }

  handleSourceEndpointChange(sourceEndpoint: ?Endpoint) {
    this.setState({ sourceEndpoint, selectedVms: [], selectedNetworks: [] })
    instanceStore.loadInstances(this.getSourceEndpointId(), true, true).then(() => {
      this.initSelectedVms()
      this.loadInstancesDetails()
    })
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

  handleBackButtonClick() {
    window.location.href = '/#/planning'
  }

  handleNetworkChange(sourceNic: Nic, targetNetwork: Network) {
    let selectedNetworks = this.state.selectedNetworks

    selectedNetworks = selectedNetworks.filter(n => n.sourceNic.network_name !== sourceNic.network_name)
    selectedNetworks.push({ sourceNic, targetNetwork })
    this.setState({ selectedNetworks })
  }

  handleRefresh() {
    let urlInfo = this.getUrlInfo()
    azureStore.getAssessmentDetails({ ...urlInfo })
    azureStore.getAssessedVms({ ...urlInfo })
    this.loadInstancesDetails()
  }

  handleMigrateClick() {
    this.setState({ showMigrationOptions: true })
  }

  handleCloseMigrationOptions() {
    this.setState({ showMigrationOptions: false })
  }

  handleMigrationExecute(options: Field[]) {
    let selectedInstances = instanceStore.instancesDetails
      .filter(i => this.state.selectedVms.find(m => i.instance_name === `${m.properties.datacenterContainer}/${m.properties.displayName}`))
    let vmSizes = {}
    selectedInstances.forEach(i => {
      let vm = this.state.selectedVms.find(m => i.instance_name === `${m.properties.datacenterContainer}/${m.properties.displayName}`)
      vmSizes[i.instance_name] = vm ? this.state.vmSizes[vm.id].name : ''
    })

    this.setState({ executeButtonDisabled: true })

    assessmentStore.migrate({
      source: this.state.sourceEndpoint,
      target: this.getUrlInfo().endpoint,
      networks: [...this.state.selectedNetworks],
      options: [...options],
      destinationEnv: {
        resource_group: this.getUrlInfo().resourceGroupName,
        location: azureStore.assessmentDetails ? azureStore.assessmentDetails.properties.azureLocation : '',
      },
      vmSizes,
      selectedInstances,
    }).then(() => {
      this.setState({ showMigrationOptions: false })
      let useReplicaOption = options.find(o => o.name === 'use_replica')
      let type = useReplicaOption && useReplicaOption.value ? 'Replica' : 'Migration'
      notificationStore.notify(`${type} was succesfully created`, 'success', { persist: true, persistInfo: { title: `${type} created` } })

      if (type === 'Replica') {
        assessmentStore.migrations.forEach(replica => {
          replicaStore.execute(replica.id, options)
        })
      }

      window.location.href = `/#/${type.toLowerCase()}s`
    })
  }

  handleVmSizeChange(vm: VmItem, vmSize: VmSize) {
    let vmSizes = this.state.vmSizes
    vmSizes[vm.id] = vmSize

    this.setState({ vmSizes })
  }

  handleGetVmSize(vm: VmItem): VmSize {
    return this.state.vmSizes[vm.id]
  }

  handleVmSearchValueChange(vmSearchValue: string) {
    this.setState({ vmSearchValue })
  }

  azureAuthenticate() {
    let connectionInfo = this.getUrlInfo().connectionInfo
    azureStore.authenticate(connectionInfo.user_credentials.username, connectionInfo.user_credentials.password).then(() => {
      this.loadAssessmentDetails()
    })
  }

  loadSourceEndpoints() {
    endpointStore.getEndpoints({ showLoading: true }).then(() => {
      endpointStore.getConnectionsInfo(endpointStore.endpoints.filter(e => e.type === 'vmware_vsphere')).then(() => {
        let endpoints = this.getEndpoints()
        let sourceEndpoint = endpoints.find(e => e.id === this.getSourceEndpointId())
        if (sourceEndpoint) {
          this.handleSourceEndpointChange(sourceEndpoint)
        } else if (endpoints.length > 0) {
          this.handleSourceEndpointChange(endpoints[0])
        } else {
          this.handleSourceEndpointChange(null)
        }
      })
    })
  }

  loadAssessmentDetails() {
    let urlInfo = this.getUrlInfo()
    azureStore.getAssessmentDetails({ ...urlInfo }).then(() => {
      azureStore.getVmSizes({ ...urlInfo, location: azureStore.assessmentDetails ? azureStore.assessmentDetails.properties.azureLocation : '' })
      this.loadNetworks()
    })
    azureStore.getAssessedVms({ ...urlInfo }).then(() => {
      this.initVmSizes()
      this.loadSourceEndpoints()
    })
  }

  initSelectedVms() {
    this.setState({ selectedVms: this.getEnabledVms() })
  }

  initVmSizes() {
    let vmSizes = {}
    let vms = azureStore.assessedVms

    vms.forEach(vm => {
      vmSizes[vm.id] = { name: vm.properties.recommendedSize }
    })

    this.setState({ vmSizes })
  }

  loadNetworks() {
    this.setState({ selectedNetworks: [] })
    let details = azureStore.assessmentDetails
    networkStore.loadNetworks(this.getUrlInfo().endpoint.id, {
      location: details ? details.properties.azureLocation : '',
      resource_group: this.getUrlInfo().resourceGroupName,
    })
  }

  loadInstancesDetails() {
    let instances = instanceStore.instances.filter(i => this.state.selectedVms.find(m => i.instance_name === `${m.properties.datacenterContainer}/${m.properties.displayName}`))
    instanceStore.clearInstancesDetails()
    instanceStore.loadInstancesDetails(this.getSourceEndpointId(), instances)
  }

  render() {
    let details = azureStore.assessmentDetails
    let loading = azureStore.loadingAssessmentDetails || azureStore.authenticating || azureStore.loadingAssessedVms
    let endpointsLoading = endpointStore.connectionsInfoLoading || endpointStore.loading
    let status = details ? details.properties.status.toUpperCase() : ''
    let statusLabel = status === 'COMPLETED' ? 'READY' : status

    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={userStore.loggedUser}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          contentHeaderComponent={<DetailsContentHeader
            item={
              // $FlowIgnore
              {
                ...details,
                type: 'Azure Migrate',
                status,
              }
            }
            statusLabel={statusLabel}
            onBackButonClick={() => { this.handleBackButtonClick() }}
            typeImage={assessmentImage}
          />}
          contentComponent={(
            <AssessmentDetailsContent
              item={details}
              detailsLoading={loading}
              targetEndpoint={this.getUrlInfo().endpoint}
              sourceEndpoints={this.getEndpoints()}
              sourceEndpointsLoading={endpointsLoading}
              sourceEndpoint={this.state.sourceEndpoint}
              assessedVmsCount={azureStore.assessedVms.length}
              filteredAssessedVms={this.getFilteredAssessedVms()}
              onSourceEndpointChange={endpoint => this.handleSourceEndpointChange(endpoint)}
              selectedVms={this.state.selectedVms}
              onVmSelectedChange={(vm, selected) => { this.handleVmSelectedChange(vm, selected) }}
              selectAllVmsChecked={this.getSelectAllVmsChecked()}
              onSelectAllVmsChange={checked => { this.handleSelectAllVmsChange(checked) }}
              instances={instanceStore.instances}
              instancesDetails={instanceStore.instancesDetails}
              instancesDetailsLoading={instanceStore.loadingInstancesDetails}
              instancesLoading={instanceStore.instancesLoading}
              networksLoading={networkStore.loading}
              instancesDetailsProgress={this.getInstancesDetailsProgress()}
              networks={networkStore.networks}
              selectedNetworks={this.state.selectedNetworks}
              loadingVmSizes={azureStore.loadingVmSizes}
              vmSizes={azureStore.vmSizes}
              onVmSizeChange={(vm, size) => {
                // $FlowIgnore
                this.handleVmSizeChange(vm, size)
              }}
              vmSearchValue={this.state.vmSearchValue}
              onVmSearchValueChange={value => { this.handleVmSearchValueChange(value) }}
              onGetVmSize={vm => this.handleGetVmSize(vm)}
              onNetworkChange={(sourceNic, targetNetwork) => { this.handleNetworkChange(sourceNic, targetNetwork) }}
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
            onExecuteClick={options => { this.handleMigrationExecute(options) }}
            executeButtonDisabled={this.state.executeButtonDisabled}
          />
        </Modal>
      </Wrapper>
    )
  }
}

export default AssessmentDetailsPage
