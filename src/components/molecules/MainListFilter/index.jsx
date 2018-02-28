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
import SearchInput from '../SearchInput'
import Dropdown from '../Dropdown'
import ReloadButton from '../../atoms/ReloadButton'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  padding-top: 8px;
  flex-wrap: wrap;
`
const Main = styled.div`
  display: flex;
  margin-right: 16px;
  flex-grow: 1;
  margin-bottom: 32px;
  height: 32px;
  align-items: center;
`
const FilterGroup = styled.div`
  display: flex;
  margin: 0 16px 0 32px;
  border-right: 1px solid ${Palette.grayscale[4]};
`
const FilterItem = styled.div`
  margin-right: 32px;
  color: ${props => props.selected ? Palette.primary : Palette.grayscale[4]};
  ${props => props.selected ? 'text-decoration: underline;' : ''}
  cursor: pointer;
  white-space: nowrap;

  &:last-child {
    margin-right: 16px;
  }
`
const Selection = styled.div`
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
const SelectionText = styled.div`
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
  onActionChange: (action: string) => void,
  actions: DictItem[],
  selectedValue: string,
  selectionInfo: { total: number, selected: number, label: string },
  selectAllSelected: ?boolean,
  items: DictItem[],
}
class MainListFilter extends React.Component<Props> {
  renderFilterGroup() {
    return (
      <FilterGroup>
        {this.props.items.map(item => {
          return (
            <FilterItem
              onClick={() => this.props.onFilterItemClick(item)}
              key={item.value}
              selected={this.props.selectedValue === item.value}
            >{item.label}
            </FilterItem>
          )
        })}
      </FilterGroup>
    )
  }

  renderSelectionInfo() {
    if (!this.props.selectionInfo.selected) {
      return null
    }

    return (
      <Selection>
        <SelectionText>
          {this.props.selectionInfo.selected} of {this.props.selectionInfo.total}&nbsp;
          {this.props.selectionInfo.label}(s) selected
        </SelectionText>
        <Dropdown
          noSelectionMessage="Select an action"
          items={this.props.actions}
          onChange={item => { this.props.onActionChange(item.value) }}
        />
      </Selection>
    )
  }

  render() {
    return (
      <Wrapper>
        <Main>
          <Checkbox
            onChange={checked => { this.props.onSelectAllChange(checked) }}
            checked={!!this.props.selectAllSelected}
          />
          {this.renderFilterGroup()}
          <ReloadButton style={{ marginRight: '16px' }} onClick={this.props.onReloadButtonClick} />
          <SearchInput onChange={this.props.onSearchChange} />
        </Main>
        {this.renderSelectionInfo()}
      </Wrapper>
    )
  }
}

export default MainListFilter
