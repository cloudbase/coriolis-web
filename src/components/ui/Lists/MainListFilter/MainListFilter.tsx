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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Checkbox from '../../Checkbox/Checkbox'
import SearchInput from '../../SearchInput/SearchInput'
import ActionDropdown from '../../Dropdowns/ActionDropdown/ActionDropdown'
import ReloadButton from '../../ReloadButton/ReloadButton'

import Palette from '../../../styleUtils/Palette'
import StyleProps from '../../../styleUtils/StyleProps'

import type { Action as DropdownAction } from '../../Dropdowns/ActionDropdown/ActionDropdown'

const Wrapper = styled.div<any>`
  display: flex;
  align-items: center;
  padding-top: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
`
const Main = styled.div<any>`
  display: flex;
  margin-right: 16px;
  flex-grow: 1;
  margin-bottom: 32px;
  height: 32px;
  align-items: center;
`
const FilterGroup = styled.div<any>`
  display: flex;
  margin: 0 16px 0 ${props => (props.noMargin ? '0' : '32px')};
  border-right: 1px solid ${Palette.grayscale[4]};
`
const FilterItem = styled.div<any>`
  margin-right: 32px;
  color: ${props => (props.selected ? Palette.primary : Palette.grayscale[4])};
  ${props => (props.selected ? 'text-decoration: underline;' : '')}
  cursor: pointer;
  white-space: nowrap;

  &:last-child {
    margin-right: 16px;
  }
`
const Selection = styled.div<any>`
  display: flex;
  align-items: center;
  transition: all ${StyleProps.animations.swift};
  margin-bottom: 32px;
  animation: show-animation .4s;

  @keyframes show-animation {
    from {opacity: 0;}
    to {opacity: 1;}
  }
`
const SelectionText = styled.div<any>`
  margin-right: 16px;
  color: ${Palette.grayscale[4]};
  white-space: nowrap;
`

type DictItem = { value: string, label: string }
type Props = {
  onFilterItemClick: (item: DictItem) => void,
  onReloadButtonClick: () => void,
  onSearchChange: (value: string) => void,
  onSelectAllChange: (checked: boolean) => void,
  selectedValue: string,
  selectionInfo: { total: number, selected: number, label: string },
  selectAllSelected: boolean | null,
  items: DictItem[],
  customFilterComponent?: React.ReactNode,
  searchValue?: string,
  dropdownActions: DropdownAction[] | null,
  largeDropdownActionItems?: boolean
}
@observer
class MainListFilter extends React.Component<Props> {
  renderFilterGroup() {
    const renderCustomComponent = () => {
      if (this.props.customFilterComponent) {
        return this.props.customFilterComponent
      }
      return null
    }

    return (
      <FilterGroup
        noMargin={!this.props.dropdownActions || this.props.dropdownActions.length === 0}
      >
        {renderCustomComponent()}
        {this.props.items.map(item => (
          <FilterItem
            data-test-id={`mainListFilter-filterItem-${item.value}`}
            onClick={() => this.props.onFilterItemClick(item)}
            key={item.value}
            selected={this.props.selectedValue === item.value}
          >{item.label}
          </FilterItem>
        ))}
      </FilterGroup>
    )
  }

  renderSelectionInfo() {
    if (!this.props.selectionInfo.selected) {
      return null
    }

    return (
      <Selection>
        <SelectionText data-test-id="mainListFilter-selectionText">
          {this.props.selectionInfo.selected} of {this.props.selectionInfo.total}&nbsp;
          {this.props.selectionInfo.label}(s) selected
        </SelectionText>
        {this.props.dropdownActions && this.props.dropdownActions.length ? (
          <ActionDropdown
            actions={this.props.dropdownActions}
            largeItems={this.props.largeDropdownActionItems}
            style={{ marginLeft: '8px' }}
            data-test-id="mainListFilter-actionButton"
          />
        ) : null}
      </Selection>
    )
  }

  render() {
    const renderCheckbox = () => {
      if (this.props.dropdownActions && this.props.dropdownActions.length > 0) {
        return (
          <Checkbox
            onChange={checked => { this.props.onSelectAllChange(checked) }}
            checked={!!this.props.selectAllSelected}
          />
        )
      }
      return null
    }

    return (
      <Wrapper>
        <Main>
          {renderCheckbox()}
          {this.renderFilterGroup()}
          <ReloadButton
            data-test-id="mainListFilter-reloadButton"
            style={{ marginRight: '16px' }}
            onClick={this.props.onReloadButtonClick}
          />
          <SearchInput onChange={this.props.onSearchChange} value={this.props.searchValue} />
        </Main>
        {this.renderSelectionInfo()}
      </Wrapper>
    )
  }
}

export default MainListFilter
