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

import { observer } from "mobx-react";
import React from "react";
import styled, { css } from "styled-components";

import AssessedVmListItem from "@src/components/modules/AssessmentModule/AssessedVmListItem";
import DetailsNavigation from "@src/components/modules/NavigationModule/DetailsNavigation";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import Button from "@src/components/ui/Button";
import Checkbox from "@src/components/ui/Checkbox";
import DropdownFilter from "@src/components/ui/Dropdowns/DropdownFilter";
import DropdownLink from "@src/components/ui/Dropdowns/DropdownLink";
import SmallLoading from "@src/components/ui/SmallLoading";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";
import Table from "@src/components/ui/Table";
import DateUtils from "@src/utils/DateUtils";

import arrowImage from "./images/arrow.svg";
import azureMigrateImage from "./images/logo.svg";

import type { Assessment, VmItem, AzureLocation } from "@src/@types/Assessment";
import type { Endpoint } from "@src/@types/Endpoint";
import type { Instance, Nic } from "@src/@types/Instance";
import type { Network, NetworkMap } from "@src/@types/Network";
const Wrapper = styled.div<any>`
  display: flex;
  justify-content: center;
`;
const Buttons = styled.div<any>`
  margin-top: 46px;
  display: flex;
  flex-direction: column;

  button:first-child {
    margin-bottom: 16px;
  }
`;
const DetailsBody = styled.div<any>`
  ${ThemeProps.exactWidth(ThemeProps.contentWidth)}
  margin-bottom: 32px;
`;
const Columns = styled.div<any>`
  display: flex;
  margin-left: -32px;
`;
const Column = styled.div<any>`
  width: 50%;
  margin-left: 32px;
`;
const Row = styled.div<any>`
  margin-bottom: 32px;
`;
const Field = styled.div<any>`
  display: flex;
  flex-direction: column;
`;
const Label = styled.div<any>`
  font-size: 10px;
  color: ${ThemePalette.grayscale[3]};
  font-weight: ${ThemeProps.fontWeights.medium};
  text-transform: uppercase;
`;
const Value = styled.div<any>`
  display: ${props => (props.flex ? "flex" : "inline-table")};
  margin-top: 3px;
  ${props => (props.capitalize ? "text-transform: capitalize;" : "")}
`;
const AzureMigrateLogo = styled.div<any>`
  width: 208px;
  height: 32px;
  background: url("${azureMigrateImage}") center no-repeat;
`;
const LoadingWrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0;
`;
const LoadingText = styled.div<any>`
  font-size: 18px;
  margin-top: 32px;
`;
const SmallLoadingWrapper = styled.div<any>`
  display: flex;
  align-items: center;
  justify-content: center;
`;
const SmallLoadingText = styled.div<any>`
  font-size: 14px;
  margin-left: 16px;
`;
const TableStyled = styled(Table)<any>`
  margin-top: 62px;
  ${props =>
    props.addWidthPadding
      ? css`
          margin-left: -24px;
          &:after {
            margin-left: 24px;
          }
        `
      : ""}
`;
const TableHeaderStyle = css`
  margin-left: 24px;
`;
const TableBodyStyle = css`
  padding-left: 24px;
`;
const NetworkItem = styled.div<any>`
  display: flex;
  width: 100%;
`;
const column = () => css`
  padding-right: 32px;
  width: 100%;
  max-width: 25%;
`;
const NetworkName = styled.div<any>`
  ${column()}
`;
const Arrow = styled.div<any>`
  width: 32px;
  height: 16px;
  position: absolute;
  right: 0;
  background: url("${arrowImage}") no-repeat;
  background-position-y: center;
`;
const ColumnStub = styled.div<any>`
  ${column()}
  position: relative;
  &:last-child {
    padding-right: 0;
  }
`;
const VmHeaderItem = styled.div<any>`
  display: flex;
  font-size: 14px;
`;
const VmHeaderItemLabel = styled.div<any>`
  font-size: 10px;
  margin-left: 8px;
`;

const NavigationItems = [
  {
    label: "Details",
    value: "",
  },
];

type Props = {
  item: Assessment | null;
  detailsLoading: boolean;
  instancesDetailsLoading: boolean;
  instancesLoading: boolean;
  networksLoading: boolean;
  instancesDetailsProgress: number | null;
  targetEndpoint: Endpoint;
  targetEndpoints: Endpoint[];
  onTargetEndpointChange: (endpoint: Endpoint) => void;
  targetEndpointsLoading: boolean;
  sourceEndpoints: Endpoint[];
  sourceEndpoint: Endpoint | null;
  sourceEndpointsLoading: boolean;
  locations: AzureLocation[];
  selectedLocation: string | null;
  onLocationChange: (locationName: string) => void;
  selectedResourceGroup: string;
  resourceGroups: string[];
  onResourceGroupChange: (resourceGroupName: string) => void;
  targetOptionsLoading: boolean;
  assessedVmsCount: number;
  filteredAssessedVms: VmItem[];
  selectedVms: string[];
  instancesDetails: Instance[];
  instances: Instance[];
  loadingVmSizes: boolean;
  vmSizes: string[];
  onVmSizeChange: (vmId: string, size: string) => void;
  onGetSelectedVmSize: (vm: VmItem) => string | null;
  networks: Network[];
  page: string;
  onSourceEndpointChange: (endpoint: Endpoint) => void;
  onVmSearchValueChange: (value: string) => void;
  vmSearchValue: string;
  onVmSelectedChange: (vm: VmItem, selected: boolean) => void;
  onNetworkChange: (sourceNic: Nic, targetNetwork: Network) => void;
  onRefresh: () => void;
  onMigrateClick: () => void;
  selectedNetworks: NetworkMap[];
  selectAllVmsChecked: boolean;
  onSelectAllVmsChange: (selected: boolean) => void;
};
@observer
class AssessmentDetailsContent extends React.Component<Props> {
  static defaultProps = {
    page: "",
  };

  doesVmMatchSource(vm: VmItem) {
    if (
      !this.props.sourceEndpoint ||
      !this.props.sourceEndpoint.connection_info
    ) {
      return false;
    }

    if (
      this.props.instances.length > 0 &&
      !this.props.instances.find(
        i =>
          i.name === vm.properties.displayName ||
          i.instance_name === vm.properties.displayName
      )
    ) {
      return false;
    }

    return (
      this.props.sourceEndpoint.connection_info.host ===
      vm.properties.datacenterManagementServerName
    );
  }

  renderMainDetails() {
    if (this.props.page !== "" || !this.props.item || !this.props.item.id) {
      return null;
    }

    const status = this.props.item
      ? this.props.item.properties.status === "Completed"
        ? "Ready for Migration"
        : this.props.item.properties.status
      : "";

    const locationItem: AzureLocation | undefined = this.props.locations.find(
      l => l.id === this.props.selectedLocation
    );

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
                {this.props.item
                  ? DateUtils.getLocalDate(
                      this.props.item.properties.updatedTimestamp
                    ).toFormat("yyyy-LL-dd HH:mm:ss")
                  : "-"}
              </Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Migration Project</Label>
              <Value>
                {this.props.item ? this.props.item.projectName : ""}
              </Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>VM Group</Label>
              <Value>{this.props.item ? this.props.item.groupName : ""}</Value>
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
                  selectedItem={
                    this.props.sourceEndpoint
                      ? this.props.sourceEndpoint.id
                      : ""
                  }
                  items={this.props.sourceEndpoints.map(endpoint => ({
                    label: endpoint.name,
                    value: endpoint.id,
                    endpoint,
                  }))}
                  onChange={item => {
                    this.props.onSourceEndpointChange(item.endpoint);
                  }}
                  selectItemLabel="Select Endpoint"
                  noItemsLabel={
                    this.props.sourceEndpointsLoading
                      ? "Loading ...."
                      : "No matching endpoints"
                  }
                />
              </Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Target endpoint</Label>
              <Value>
                <DropdownLink
                  selectedItem={
                    this.props.targetEndpoint
                      ? this.props.targetEndpoint.id
                      : ""
                  }
                  items={this.props.targetEndpoints.map(endpoint => ({
                    label: endpoint.name,
                    value: endpoint.id,
                    endpoint,
                  }))}
                  onChange={item => {
                    this.props.onTargetEndpointChange(item.endpoint);
                  }}
                  selectItemLabel="Select Endpoint"
                  noItemsLabel={
                    this.props.targetEndpointsLoading
                      ? "Loading ...."
                      : "No Azure endpoints"
                  }
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
                  items={this.props.resourceGroups.map(group => ({
                    label: group,
                    value: group,
                  }))}
                  onChange={item => {
                    this.props.onResourceGroupChange(item.value);
                  }}
                  noItemsLabel={
                    this.props.targetOptionsLoading
                      ? "Loading ...."
                      : "No Resource Groups found"
                  }
                />
              </Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Location</Label>
              <Value>
                <DropdownLink
                  selectedItem={locationItem ? locationItem.id : ""}
                  items={this.props.locations.map(location => ({
                    label: location.name,
                    value: location.id,
                  }))}
                  onChange={item => {
                    this.props.onLocationChange(item.value);
                  }}
                  noItemsLabel={
                    this.props.targetOptionsLoading
                      ? "Loading ...."
                      : "No Locations found"
                  }
                />
              </Value>
            </Field>
          </Row>
        </Column>
      </Columns>
    );
  }

  renderVmsTable() {
    const loading = this.props.instancesLoading;

    const items = this.props.filteredAssessedVms.map(vm => (
      <AssessedVmListItem
        key={vm.id}
        item={vm}
        selected={
          this.props.selectedVms.filter(m => m === vm.properties.displayName)
            .length > 0
        }
        onSelectedChange={(selectedVm, selected) => {
          this.props.onVmSelectedChange(selectedVm, selected);
        }}
        disabled={!this.doesVmMatchSource(vm)}
        loadingVmSizes={this.props.loadingVmSizes}
        recommendedVmSize={vm.properties.recommendedSize}
        vmSizes={this.props.vmSizes}
        selectedVmSize={this.props.onGetSelectedVmSize(vm)}
        onVmSizeChange={size => {
          this.props.onVmSizeChange(vm.properties.displayName, size);
        }}
      />
    ));

    const vmCountLabel = `(${
      this.props.filteredAssessedVms.length === this.props.assessedVmsCount
        ? this.props.assessedVmsCount
        : `${this.props.filteredAssessedVms.length} OUT OF ${this.props.assessedVmsCount}`
    })`;
    const vmHeaderItem = (
      <VmHeaderItem>
        {loading ? null : (
          <Checkbox
            checked={this.props.selectAllVmsChecked}
            onChange={checked => {
              this.props.onSelectAllVmsChange(checked);
            }}
          />
        )}
        <VmHeaderItemLabel>Virtual Machine {vmCountLabel}</VmHeaderItemLabel>
        <DropdownFilter
          searchPlaceholder="Filter Virtual Machines"
          searchValue={this.props.vmSearchValue}
          onSearchChange={value => {
            this.props.onVmSearchValueChange(value);
          }}
        />
      </VmHeaderItem>
    );

    return (
      <TableStyled
        addWidthPadding
        items={loading ? [] : items}
        bodyStyle={TableBodyStyle}
        headerStyle={TableHeaderStyle}
        header={[vmHeaderItem, "OS", "Target Disk Type", "Azure VM Size"]}
        useSecondaryStyle
        noItemsComponent={this.renderLoading(
          "Loading instances, please wait ..."
        )}
      />
    );
  }

  renderNetworkTable() {
    const loading =
      this.props.networksLoading || this.props.instancesDetailsLoading;

    if (loading) {
      return (
        <TableStyled
          items={[]}
          header={["Source Network", "", "", "Target Network"]}
          useSecondaryStyle
          noItemsStyle={{ marginLeft: 0 }}
          noItemsComponent={this.renderNetworksLoading()}
        />
      );
    }

    const nics: Nic[] = [];
    this.props.instancesDetails.forEach(instance => {
      if (!instance.devices || !instance.devices.nics) {
        return;
      }
      instance.devices.nics.forEach(nic => {
        if (nics.find(n => n.network_name === nic.network_name)) {
          return;
        }
        nics.push(nic);
      });
    });

    if (nics.length === 0) {
      return null;
    }

    const items = nics.map(nic => {
      let selectedNetworkName: string | undefined;
      const selectedNetwork =
        this.props.selectedNetworks &&
        this.props.selectedNetworks.find(
          n => n.sourceNic.network_name === nic.network_name
        );
      if (selectedNetwork) {
        selectedNetworkName = selectedNetwork.targetNetwork?.name;
      }

      return (
        <NetworkItem key={nic.network_name}>
          <NetworkName width="25%">{nic.network_name}</NetworkName>
          <ColumnStub width="25%">
            <Arrow />
          </ColumnStub>
          <ColumnStub width="25%" />
          <ColumnStub width="25%">
            <DropdownLink
              width="208px"
              noItemsLabel="No Networks found"
              selectItemLabel="Select Network"
              selectedItem={selectedNetworkName}
              onChange={item => {
                this.props.onNetworkChange(nic, item.network);
              }}
              items={this.props.networks.map(network => ({
                value: network.name || "",
                label: network.name || "",
                network,
              }))}
            />
          </ColumnStub>
        </NetworkItem>
      );
    });
    return (
      <TableStyled
        items={loading ? [] : items}
        header={["Source Network", "", "", "Target Network"]}
        useSecondaryStyle
        noItemsStyle={{ marginLeft: 0 }}
        noItemsComponent={this.renderNetworksLoading()}
      />
    );
  }

  renderNetworksLoading() {
    let loadingProgress = -1;
    if (this.props.instancesDetailsLoading) {
      if (this.props.instancesDetailsProgress != null) {
        loadingProgress = Math.round(this.props.instancesDetailsProgress * 100);
      }
    }

    return (
      <SmallLoadingWrapper>
        <SmallLoading loadingProgress={loadingProgress} />
        <SmallLoadingText>Loading networks, please wait ...</SmallLoadingText>
      </SmallLoadingWrapper>
    );
  }

  renderButtons() {
    return (
      <Buttons>
        <Button secondary onClick={this.props.onRefresh}>
          Refresh
        </Button>
        <Button
          disabled={
            this.props.selectedVms.length === 0 ||
            this.props.selectedNetworks.length === 0
          }
          onClick={() => {
            this.props.onMigrateClick();
          }}
        >
          Migrate / Replicate
        </Button>
      </Buttons>
    );
  }

  renderLoading(message: string) {
    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>{message}</LoadingText>
      </LoadingWrapper>
    );
  }

  render() {
    return (
      <Wrapper>
        <DetailsNavigation
          items={NavigationItems}
          selectedValue={this.props.page}
          itemId={this.props.item ? this.props.item.id : ""}
          customHref={() => "#"}
        />
        <DetailsBody>
          {this.props.detailsLoading ? null : this.renderMainDetails()}
          {this.props.detailsLoading
            ? this.renderLoading("Loading assessment...")
            : null}
          {this.props.detailsLoading ? null : this.renderVmsTable()}
          {this.props.detailsLoading || this.props.instancesLoading
            ? null
            : this.renderNetworkTable()}
          {this.props.detailsLoading ? null : this.renderButtons()}
        </DetailsBody>
      </Wrapper>
    );
  }
}

export default AssessmentDetailsContent;
