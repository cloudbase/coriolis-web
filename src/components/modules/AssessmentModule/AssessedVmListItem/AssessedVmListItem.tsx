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

import React from "react";
import { observer } from "mobx-react";
import styled, { css } from "styled-components";

import Checkbox from "@src/components/ui/Checkbox";
import InfoIcon from "@src/components/ui/InfoIcon";
import DropdownLink from "@src/components/ui/Dropdowns/DropdownLink";
import type { VmItem } from "@src/@types/Assessment";
import { ThemePalette } from "@src/components/Theme";

const Wrapper = styled.div<any>`
  position: relative;
  width: 100%;
`;
const Content = styled.div<any>`
  display: flex;
  margin-left: -32px;

  & > div {
    margin-left: 32px;
  }

  opacity: ${(props: any) => (props.disabled ? 0.6 : 1)};
`;
const columnWidth = (width: string) => css`
  width: 100%;
  max-width: ${width};
`;
const DisplayName = styled.div<any>`
  display: flex;
  ${(props: any) => columnWidth(props.width)}
`;
const Value = styled.div<any>`
  color: ${ThemePalette.grayscale[4]};
  ${(props: any) => columnWidth(props.width)}
`;
const DisplayNameLabel = styled.div<any>`
  margin-left: 8px;
  word-break: break-word;
`;
const InfoIconStyled = styled(InfoIcon)`
  position: absolute;
  left: -36px;
  top: 0px;
  z-index: 10000;
`;

type Props = {
  item: VmItem;
  selected: boolean;
  onSelectedChange: (item: VmItem, isChecked: boolean) => void;
  disabled: boolean;
  loadingVmSizes: boolean;
  vmSizes: string[];
  onVmSizeChange: (size: string) => void;
  selectedVmSize: string | null;
  recommendedVmSize: string;
};
@observer
class AssessedVmListItem extends React.Component<Props> {
  renderInfoIcon() {
    if (!this.props.disabled) {
      return null;
    }

    return (
      <InfoIconStyled
        warning
        text="We could not detect this VM on the source endpoint. Either the VM is missing or the selected endpoint is not the same as in the Azure Migrare Assesment."
      />
    );
  }

  render() {
    const { disks } = this.props.item.properties;
    let standardCount = 0;
    let premiumCount = 0;
    Object.keys(disks).forEach(diskKey => {
      if (disks[diskKey].recommendedDiskType === "Standard") {
        standardCount += 1;
      }
      if (disks[diskKey].recommendedDiskType === "Premium") {
        premiumCount += 1;
      }
    });

    return (
      <Wrapper>
        {this.renderInfoIcon()}
        <Content disabled={this.props.disabled}>
          <DisplayName width="25%">
            <Checkbox
              checked={this.props.selected}
              onChange={checked => {
                this.props.onSelectedChange(this.props.item, checked);
              }}
              disabled={this.props.disabled}
            />
            <DisplayNameLabel>{`${this.props.item.properties.displayName}`}</DisplayNameLabel>
          </DisplayName>
          <Value width="25%">
            {this.props.item.properties.operatingSystemName}
          </Value>
          <Value width="25%">
            {standardCount} Standard, {premiumCount} Premium
          </Value>
          <Value width="25%">
            <DropdownLink
              searchable
              width="208px"
              noItemsLabel={
                this.props.loadingVmSizes ? "Loading..." : "No data"
              }
              selectItemLabel="Auto Determined"
              items={
                this.props.loadingVmSizes
                  ? []
                  : this.props.vmSizes.map(s => ({ value: s, label: s }))
              }
              selectedItem={this.props.selectedVmSize || ""}
              listWidth="200px"
              onChange={item => {
                this.props.onVmSizeChange(item.value);
              }}
              disabled={this.props.disabled}
              highlightedItem={this.props.recommendedVmSize}
            />
          </Value>
        </Content>
      </Wrapper>
    );
  }
}

export default AssessedVmListItem;
