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

import Checkbox from '../../atoms/Checkbox'
import InfoIcon from '../../atoms/InfoIcon'
import DropdownLink from '../../molecules/DropdownLink'
import type { VmItem, VmSize } from '../../../types/Assessment'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const Wrapper = styled.div`
  position: relative;
`
const Content = styled.div`
  display: flex;
  margin-left: -16px;

  & > div {
    margin-left: 16px;
  }

  opacity: ${props => props.disabled ? 0.6 : 1};
`
const DisplayName = styled.div`
  display: flex;
  ${props => StyleProps.exactWidth(props.width)}
`
const DisplayNameLabel = styled.div`
  margin-left: 8px;
`
const Value = styled.div`
  color: ${Palette.grayscale[4]};
  ${props => props.width ? StyleProps.exactWidth(props.width) : ''}
`
const InfoIconStyled = styled(InfoIcon) `
  position: absolute;
  left: -36px;
  top: 0px;
`

type Props = {
  item: VmItem,
  columnsWidths: string[],
  selected: boolean,
  onSelectedChange: (item: VmItem, isChecked: boolean) => void,
  disabled: boolean,
  loadingVmSizes: boolean,
  vmSizes: VmSize[],
  onVmSizeChange: (size: VmSize) => void,
  selectedVmSize: ?VmSize,
  recommendedVmSize: string,
}
class AssessedVmListItem extends React.Component<Props> {
  getColumnWidth(index: number) {
    let width = parseInt(this.props.columnsWidths[index], 10)
    return `${width - 16}px`
  }

  renderInfoIcon() {
    if (!this.props.disabled) {
      return null
    }

    return <InfoIconStyled warning text="We could not detect this VM on the source endpoint. Either the VM is missing or the selected endpoint is not the same as in the Azure Migrare Assesment." />
  }

  render() {
    let disks = this.props.item.properties.disks
    let standardCount = 0
    let premiumCount = 0
    Object.keys(disks).forEach(diskKey => {
      if (disks[diskKey].recommendedDiskType === 'Standard') {
        standardCount += 1
      }
      if (disks[diskKey].recommendedDiskType === 'Premium') {
        premiumCount += 1
      }
    })

    return (
      <Wrapper>
        {this.renderInfoIcon()}
        <Content disabled={this.props.disabled}>
          <DisplayName width={this.getColumnWidth(0)}>
            <Checkbox
              checked={this.props.selected}
              onChange={checked => { this.props.onSelectedChange(this.props.item, checked) }}
              disabled={this.props.disabled}
            />
            <DisplayNameLabel>{`${this.props.item.properties.datacenterContainer}/${this.props.item.properties.displayName}`}</DisplayNameLabel>
          </DisplayName>
          <Value width={this.getColumnWidth(1)}>
            {this.props.item.properties.operatingSystem}
          </Value>
          <Value width={this.getColumnWidth(2)}>
            {standardCount} Standard, {premiumCount} Premium
          </Value>
          <Value>
            <DropdownLink
              searchable
              width={this.props.columnsWidths[3]}
              noItemsLabel="Loading..."
              items={this.props.loadingVmSizes ? [] : this.props.vmSizes.map(s => ({ value: s.name, label: s.name, size: s }))}
              selectedItem={this.props.selectedVmSize ? this.props.selectedVmSize.name : ''}
              listWidth="200px"
              onChange={item => { this.props.onVmSizeChange(item.size) }}
              disabled={this.props.disabled}
              highlightedItem={this.props.recommendedVmSize}
            />
          </Value>
        </Content>
      </Wrapper>
    )
  }
}

export default AssessedVmListItem
