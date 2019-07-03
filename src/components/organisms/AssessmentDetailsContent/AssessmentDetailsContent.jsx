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
import styled, { css } from 'styled-components'
import moment from 'moment'
import { observer } from 'mobx-react'

import DetailsNavigation from '../../molecules/DetailsNavigation'
import Button from '../../atoms/Button'
import StatusImage from '../../atoms/StatusImage'
import DropdownLink from '../../molecules/DropdownLink'
import Table from '../../molecules/Table'
import AssessedVmListItem from '../../molecules/AssessedVmListItem'
import DropdownFilter from '../../molecules/DropdownFilter'
import Checkbox from '../../atoms/Checkbox'
import SmallLoading from '../../atoms/SmallLoading'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import type { Assessment, VmItem, Location } from '../../../types/Assessment'
import type { Endpoint } from '../../../types/Endpoint'
import type { Instance, Nic } from '../../../types/Instance'
import type { Network, NetworkMap } from '../../../types/Network'

import azureMigrateImage from './images/logo.svg'
import arrowImage from './images/arrow.svg'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`
const Buttons = styled.div`
  margin-top: 46px;
  display: flex;
  flex-direction: column;

  button:first-child {
    margin-bottom: 16px;
  }
`
const DetailsBody = styled.div`
  ${StyleProps.exactWidth(StyleProps.contentWidth)}
  margin-bottom: 32px;
`
const Columns = styled.div`
  display: flex;
  margin-left: -32px;
`
const Column = styled.div`
  width: 50%;
  margin-left: 32px;
`
const Row = styled.div`
  margin-bottom: 32px;
`
const Field = styled.div`
  display: flex;
  flex-direction: column;
`
const Label = styled.div`
  font-size: 10px;
  color: ${Palette.grayscale[3]};
  font-weight: ${StyleProps.fontWeights.medium};
  text-transform: uppercase;
`
const Value = styled.div`
  display: ${props => props.flex ? 'flex' : 'inline-table'};
  margin-top: 3px;
  ${props => props.capitalize ? 'text-transform: capitalize;' : ''}
`
const AzureMigrateLogo = styled.div`
  width: 208px;
  height: 32px;
  background: url('${azureMigrateImage}') center no-repeat;
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
const SmallLoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
const SmallLoadingText = styled.div`
  font-size: 14px;
  margin-left: 16px;
`
const TableStyled = styled(Table)`
  margin-top: 62px;
  ${props => props.addWidthPadding ? css`
    margin-left: -24px;
    &:after {
      margin-left: 24px;
    }
  ` : ''}
`
const TableHeaderStyle = css`
  margin-left: 24px;
`
const TableBodyStyle = css`
  padding-left: 24px;
`
const NetworkItem = styled.div`
  display: flex;
  width: 100%;
`
const column = () => css`
  padding-right: 32px;
  width: 100%;
  max-width: 25%;
`
const NetworkName = styled.div`
  ${column()}
`
const Arrow = styled.div`
  width: 32px;
  height: 16px;
  position: absolute;
  right: 0;
  background: url('${arrowImage}') no-repeat;
  background-position-y: center;
`
const ColumnStub = styled.div`
  ${column()}
  position: relative;
  &:last-child {
    padding-right: 0;
  }
`
const VmHeaderItem = styled.div`
  display: flex;
  font-size: 14px;
`
const VmHeaderItemLabel = styled.div`
  font-size: 10px;
  margin-left: 8px;
`

const NavigationItems = [
  {
    label: 'Details',
    value: '',
  },
]

type Props = {
  item: ?Assessment,
  detailsLoading: boolean,
  instancesDetailsLoading: boolean,
  instancesLoading: boolean,
  networksLoading: boolean,
  instancesDetailsProgress: ?number,
  targetEndpoint: Endpoint,
  targetEndpoints: Endpoint[],
  onTargetEndpointChange: (endpoint: Endpoint) => void,
  targetEndpointsLoading: boolean,
  sourceEndpoints: Endpoint[],
  sourceEndpoint: ?Endpoint,
  sourceEndpointsLoading: boolean,
  locations: Location[],
  selectedLocation: ?string,
  onLocationChange: (locationName: string) => void,
  selectedResourceGroup: string,
  resourceGroups: string[],
  onResourceGroupChange: (resourceGroupName: string) => void,
  targetOptionsLoading: boolean,
  assessedVmsCount: number,
  filteredAssessedVms: VmItem[],
  selectedVms: string[],
  instancesDetails: Instance[],
  instances: Instance[],
  loadingVmSizes: boolean,
  vmSizes: string[],
  onVmSizeChange: (vmId: string, size: string) => void,
  onGetSelectedVmSize: (vm: VmItem) =>?string,
  networks: Network[],
  page: string,
  onSourceEndpointChange: (endpoint: Endpoint) => void,
  onVmSearchValueChange: (value: string) => void,
  vmSearchValue: string,
  onVmSelectedChange: (vm: VmItem, selected: boolean) => void,
  onNetworkChange: (sourceNic: Nic, targetNetwork: Network) => void,
  onRefresh: () => void,
  onMigrateClick: () => void,
  selectedNetworks: NetworkMap[],
  selectAllVmsChecked: boolean,
  onSelectAllVmsChange: (selected: boolean) => void,
}
@observer
class AssessmentDetailsContent extends React.Component<Props> {
  static defaultProps: $Shape<Props> = {
    page: '',
  }

  doesVmMatchSource(vm: VmItem) {
    if (!this.props.sourceEndpoint || !this.props.sourceEndpoint.connection_info) {
      return false
    }

    if (this.props.instances.length > 0 &&
      !this.props.instances.find(i => i.id === `${vm.properties.datacenterMachineId}`)) {
      return false
    }

    return this.props.sourceEndpoint.connection_info.host === vm.properties.datacenterManagementServer
  }

  renderBottomControls() {
    return (
      <Buttons>
        <Button
          alert
          hollow
          onClick={() => { }}
        >Migrate</Button>
      </Buttons>
    )
  }

  renderMainDetails() {
    if (this.props.page !== '' || !this.props.item || !this.props.item.id) {
      return null
    }

    let status = this.props.item ?
      this.props.item.properties.status === 'Completed' ? 'Ready for Migration' : this.props.item.properties.status : ''

    let locationItem: ?Location = this.props.locations.find(l => l.id.toLowerCase() === (this.props.selectedLocation ? this.props.selectedLocation.toLowerCase() : null))

    return (
      <Columns>
        <Column>
          <Row>
            <AzureMigrateLogo />
          </Row>
          <Row>
            <Field>
              <Label>Last Update</Label>
              <Value>
                {this.props.item ? moment(this.props.item.properties.updatedTimestamp).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Migration Project</Label>
              <Value>{this.props.item ? this.props.item.projectName : ''}</Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>VM Group</Label>
              <Value>{this.props.item ? this.props.item.groupName : ''}</Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Status</Label>
              <Value>{status}</Value>
            </Field>
          </Row>
        </Column>
        <Column>
          <Row>
            <Field>
              <Label>Source Endpoint</Label>
              <Value>
                <DropdownLink
                  selectedItem={this.props.sourceEndpoint ? this.props.sourceEndpoint.id : ''}
                  items={this.props.sourceEndpoints.map(endpoint => ({ label: endpoint.name, value: endpoint.id, endpoint }))}
                  onChange={item => { this.props.onSourceEndpointChange(item.endpoint) }}
                  selectItemLabel="Select Endpoint"
                  noItemsLabel={this.props.sourceEndpointsLoading ? 'Loading ....' : 'No matching endpoints'}
                />
              </Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Target endpoint</Label>
              <Value>
                <DropdownLink
                  selectedItem={this.props.targetEndpoint ? this.props.targetEndpoint.id : ''}
                  items={this.props.targetEndpoints.map(endpoint => ({ label: endpoint.name, value: endpoint.id, endpoint }))}
                  onChange={item => { this.props.onTargetEndpointChange(item.endpoint) }}
                  selectItemLabel="Select Endpoint"
                  noItemsLabel={this.props.targetEndpointsLoading ? 'Loading ....' : 'No Azure endpoints'}
                />
              </Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Resource Group</Label>
              <Value>
                <DropdownLink
                  selectedItem={this.props.selectedResourceGroup}
                  items={this.props.resourceGroups.map(group => ({ label: group, value: group }))}
                  onChange={item => { this.props.onResourceGroupChange(item.value) }}
                  noItemsLabel={this.props.targetOptionsLoading ? 'Loading ....' : 'No Resource Groups found'}
                />
              </Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Location</Label>
              <Value>
                <DropdownLink
                  selectedItem={locationItem ? locationItem.id : ''}
                  items={this.props.locations.map(location => ({ label: location.name, value: location.id }))}
                  onChange={item => { this.props.onLocationChange(item.value) }}
                  noItemsLabel={this.props.targetOptionsLoading ? 'Loading ....' : 'No Locations found'}
                />
              </Value>
            </Field>
          </Row>
        </Column>
      </Columns>
    )
  }

  renderVmsTable() {
    let loading = this.props.instancesLoading

    let items = this.props.filteredAssessedVms.map(vm => {
      return (
        <AssessedVmListItem
          item={vm}
          selected={this.props.selectedVms.filter(m => m === vm.properties.datacenterMachineId).length > 0}
          onSelectedChange={(vm, selected) => { this.props.onVmSelectedChange(vm, selected) }}
          disabled={!this.doesVmMatchSource(vm)}
          loadingVmSizes={this.props.loadingVmSizes}
          recommendedVmSize={vm.properties.recommendedSize}
          vmSizes={this.props.vmSizes}
          selectedVmSize={this.props.onGetSelectedVmSize(vm)}
          onVmSizeChange={size => { this.props.onVmSizeChange(vm.properties.datacenterMachineId, size) }}
        />
      )
    })

    let vmCountLabel = `(${this.props.filteredAssessedVms.length === this.props.assessedVmsCount ? this.props.assessedVmsCount :
      `${this.props.filteredAssessedVms.length} OUT OF ${this.props.assessedVmsCount}`})`
    let vmHeaderItem = (
      <VmHeaderItem>
        {loading ? null : <Checkbox checked={this.props.selectAllVmsChecked} onChange={checked => { this.props.onSelectAllVmsChange(checked) }} />}
        <VmHeaderItemLabel>Virtual Machine {vmCountLabel}</VmHeaderItemLabel>
        <DropdownFilter
          searchPlaceholder="Filter Virtual Machines"
          searchValue={this.props.vmSearchValue}
          onSearchChange={value => { this.props.onVmSearchValueChange(value) }}
        />
      </VmHeaderItem>
    )


    return (
      <TableStyled
        addWidthPadding
        items={loading ? [] : items}
        bodyStyle={TableBodyStyle}
        headerStyle={TableHeaderStyle}
        header={[vmHeaderItem, 'OS', 'Target Disk Type', 'Azure VM Size']}
        useSecondaryStyle
        noItemsComponent={this.renderLoading('Loading instances, please wait ...')}
      />
    )
  }

  renderNetworkTable() {
    let loading = this.props.networksLoading || this.props.instancesDetailsLoading

    if (loading) {
      return (
        <TableStyled
          items={[]}
          header={['Source Network', '', '', 'Target Network']}
          useSecondaryStyle
          noItemsStyle={{ marginLeft: 0 }}
          noItemsComponent={this.renderNetworksLoading()}
        />
      )
    }

    let nics = []
    this.props.instancesDetails.forEach(instance => {
      if (!instance.devices || !instance.devices.nics) {
        return
      }
      instance.devices.nics.forEach(nic => {
        if (nics.find(n => n.network_name === nic.network_name)) {
          return
        }
        nics.push(nic)
      })
    })

    if (nics.length === 0) {
      return null
    }

    let items = nics.map(nic => {
      let selectedNetworkName = this.props.selectedNetworks && this.props.selectedNetworks.find(n => n.sourceNic.network_name === nic.network_name)
      if (selectedNetworkName) {
        selectedNetworkName = selectedNetworkName.targetNetwork.name
      }

      return (
        // $FlowIgnore
        <NetworkItem key={nic.network_name}>
          <NetworkName width="25%">{nic.network_name}</NetworkName>
          <ColumnStub width="25%"><Arrow /></ColumnStub>
          <ColumnStub width="25%" />
          <ColumnStub width="25%">
            <DropdownLink
              width="208px"
              noItemsLabel="No Networks found"
              selectItemLabel="Select Network"
              selectedItem={selectedNetworkName}
              onChange={item => { this.props.onNetworkChange(nic, item.network) }}
              items={this.props.networks.map(network => ({ value: network.name || '', label: network.name || '', network }))}
            />
          </ColumnStub>
        </NetworkItem>
      )
    })
    return (
      <TableStyled
        items={loading ? [] : items}
        header={['Source Network', '', '', 'Target Network']}
        useSecondaryStyle
        noItemsStyle={{ marginLeft: 0 }}
        noItemsComponent={this.renderNetworksLoading()}
      />
    )
  }

  renderNetworksLoading() {
    let loadingProgress = -1
    if (this.props.instancesDetailsLoading) {
      if (this.props.instancesDetailsProgress != null) {
        loadingProgress = Math.round(this.props.instancesDetailsProgress * 100)
      }
    }

    return (
      <SmallLoadingWrapper>
        <SmallLoading loadingProgress={loadingProgress} />
        <SmallLoadingText>Loading networks, please wait ...</SmallLoadingText>
      </SmallLoadingWrapper>
    )
  }

  renderButtons() {
    return (
      <Buttons>
        <Button secondary onClick={this.props.onRefresh}>Refresh</Button>
        <Button
          disabled={this.props.selectedVms.length === 0 || this.props.selectedNetworks.length === 0}
          onClick={() => { this.props.onMigrateClick() }}
        >Migrate / Replicate</Button>
      </Buttons>
    )
  }

  renderLoading(message: string) {
    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>{message}</LoadingText>
      </LoadingWrapper>
    )
  }

  render() {
    return (
      <Wrapper>
        <DetailsNavigation
          items={NavigationItems}
          selectedValue={this.props.page}
          itemId={this.props.item ? this.props.item.id : ''}
          customHref={() => null}
        />
        <DetailsBody>
          {this.props.detailsLoading ? null : this.renderMainDetails()}
          {this.props.detailsLoading ? this.renderLoading('Loading assessment...') : null}
          {this.props.detailsLoading ? null : this.renderVmsTable()}
          {this.props.detailsLoading || this.props.instancesLoading ? null : this.renderNetworkTable()}
          {this.props.detailsLoading ? null : this.renderButtons()}
        </DetailsBody>
      </Wrapper>
    )
  }
}

export default AssessmentDetailsContent
