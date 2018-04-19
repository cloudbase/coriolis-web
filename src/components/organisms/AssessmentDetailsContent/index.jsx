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
import Tooltip from '../../atoms/Tooltip'
import Checkbox from '../../atoms/Checkbox'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import type { Assessment, VmItem, VmSize } from '../../../types/Assessment'
import type { Endpoint } from '../../../types/Endpoint'
import type { Instance, Nic } from '../../../types/Instance'
import type { Network, NetworkMap } from '../../../types/Network'

import azureMigrateImage from './images/azure-migrate.svg'
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
  display: flex;
  text-align: center;
`
const AzureMigrateLogoImage = styled.div`
  width: 48px;
  height: 33px;
  background: url('${azureMigrateImage}') center no-repeat;
`
const AzureMigrateLogoText = styled.div`
  font-size: 27px;
  color: #2E97DE;
  margin-left: 12px;
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
  targetEndpoint: Endpoint,
  detailsLoading: boolean,
  instancesDetailsLoading: boolean,
  instancesLoading: boolean,
  networksLoading: boolean,
  instancesDetailsProgress: ?number,
  sourceEndpoints: Endpoint[],
  sourceEndpointsLoading: boolean,
  assessedVmsCount: number,
  filteredAssessedVms: VmItem[],
  selectedVms: VmItem[],
  instancesDetails: Instance[],
  instances: Instance[],
  loadingVmSizes: boolean,
  vmSizes: VmSize[],
  onVmSizeChange: (vm: VmItem, size: { name: string }) => void,
  onGetVmSize: (vm: VmItem) => ?VmSize,
  networks: Network[],
  sourceEndpoint: ?Endpoint,
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

  componentDidUpdate() {
    Tooltip.rebuild()
  }

  doesVmMatchSource(vm: VmItem) {
    if (!this.props.sourceEndpoint || !this.props.sourceEndpoint.connection_info) {
      return false
    }

    if (this.props.instances.length > 0 &&
      !this.props.instances.find(i => i.instance_name === `${vm.properties.datacenterContainer}/${vm.properties.displayName}`)) {
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

  renderSourceDropdown() {
    return (
      <DropdownLink
        selectedItem={this.props.sourceEndpoint ? this.props.sourceEndpoint.id : ''}
        items={this.props.sourceEndpoints.map(endpoint => ({ label: endpoint.name, value: endpoint.id, endpoint }))}
        onChange={item => { this.props.onSourceEndpointChange(item.endpoint) }}
        selectItemLabel="Select Endpoint"
        noItemsLabel={this.props.sourceEndpointsLoading ? 'Loading ....' : 'No matching endpoints'}
      />
    )
  }

  renderMainDetails() {
    if (this.props.detailsLoading) {
      return null
    }

    if (this.props.page !== '' || !this.props.item || !this.props.item.id) {
      return null
    }

    let status = this.props.item ?
      this.props.item.properties.status === 'Completed' ? 'Ready' : this.props.item.properties.status : ''

    return (
      <Columns>
        <Column>
          <Row>
            <Field>
              <Label>Type</Label>
              <Value>Azure Migrate</Value>
            </Field>
          </Row>
          <Row>
            <AzureMigrateLogo>
              <AzureMigrateLogoImage />
              <AzureMigrateLogoText>Azure Migrate</AzureMigrateLogoText>
            </AzureMigrateLogo>
          </Row>
          <Row>
            <Field>
              <Label>Last Update</Label>
              <Value>
                {moment(this.props.item.properties.updatedTimestamp).format('YYYY-MM-DD HH:mm:ss')}
              </Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Status</Label>
              <Value>{status}</Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Source Endpoint</Label>
              <Value>{this.renderSourceDropdown()}</Value>
            </Field>
          </Row>
        </Column>
        <Column>
          <Row>
            <Field>
              <Label>Project</Label>
              <Value>{this.props.item ? this.props.item.projectName : ''}</Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Location</Label>
              <Value>{this.props.item ? this.props.item.properties.azureLocation : ''}</Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Resource Group</Label>
              <Value>{this.props.item ? this.props.item.resourceGroupName : ''}</Value>
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
              <Label>Target endpoint</Label>
              <Value>{this.props.targetEndpoint.name}</Value>
            </Field>
          </Row>
        </Column>
      </Columns>
    )
  }

  renderVmsTable() {
    if (this.props.detailsLoading || this.props.sourceEndpointsLoading || this.props.instancesLoading) {
      return null
    }

    let items = this.props.filteredAssessedVms.map(vm => {
      let filteredVm = this.props.filteredAssessedVms.find(v => v.id === vm.id)
      return (
        <AssessedVmListItem
          item={vm}
          selected={this.props.selectedVms.filter(m => m.id === vm.id).length > 0}
          onSelectedChange={(vm, selected) => { this.props.onVmSelectedChange(vm, selected) }}
          disabled={!this.doesVmMatchSource(vm)}
          loadingVmSizes={this.props.loadingVmSizes}
          recommendedVmSize={filteredVm ? filteredVm.properties.recommendedSize : ''}
          vmSizes={this.props.vmSizes}
          selectedVmSize={this.props.onGetVmSize(vm)}
          onVmSizeChange={size => { this.props.onVmSizeChange(vm, size) }}
        />
      )
    })

    let vmCountLabel = `(${this.props.filteredAssessedVms.length === this.props.assessedVmsCount ? this.props.assessedVmsCount :
      `${this.props.filteredAssessedVms.length} OUT OF ${this.props.assessedVmsCount}`})`
    let vmHeaderItem = (
      <VmHeaderItem>
        <Checkbox checked={this.props.selectAllVmsChecked} onChange={checked => { this.props.onSelectAllVmsChange(checked) }} />
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
        items={items}
        bodyStyle={TableBodyStyle}
        headerStyle={TableHeaderStyle}
        header={[vmHeaderItem, 'OS', 'Target Disk Type', 'Azure VM Size']}
        useSecondaryStyle
        noItemsLabel="No VMs found!"
      />
    )
  }

  renderNetworkTable() {
    if (this.props.detailsLoading || this.props.sourceEndpointsLoading || this.props.instancesDetailsLoading || this.props.networksLoading || this.props.instancesLoading) {
      return null
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
        items={items}
        header={['Source Network', '', '', 'Target Network']}
        useSecondaryStyle
      />
    )
  }

  renderButtons() {
    if (this.props.detailsLoading) {
      return null
    }

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

  renderLoading() {
    let message = ''
    let loadingProgress = -1
    if (!this.props.detailsLoading && !this.props.sourceEndpointsLoading && !this.props.instancesDetailsLoading && !this.props.networksLoading && !this.props.instancesLoading) {
      return null
    }

    if (this.props.instancesDetailsLoading) {
      if (this.props.instancesDetailsProgress !== undefined && this.props.instancesDetailsProgress !== null) {
        loadingProgress = Math.round(this.props.instancesDetailsProgress * 100)
      }
      message = 'Loading instances details, please wait ...'
    }

    if (this.props.instancesLoading) {
      message = 'Loading instances ...'
    }

    if (this.props.networksLoading) {
      message = 'Loading networks ...'
    }

    if (this.props.sourceEndpointsLoading) {
      message = 'Loading source endpoints ...'
    }

    if (this.props.detailsLoading) {
      message = 'Loading assessment ...'
    }

    return (
      <LoadingWrapper>
        <StatusImage loading loadingProgress={loadingProgress} />
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
          {this.renderMainDetails()}
          {this.renderVmsTable()}
          {this.renderNetworkTable()}
          {this.renderLoading()}
          {this.renderButtons()}
          <Tooltip />
        </DetailsBody>
      </Wrapper>
    )
  }
}

export default AssessmentDetailsContent
