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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import type { MainItem } from '../../../types/MainItem'
import MainListFilter from '../../molecules/MainListFilter'

import type { Action as DropdownAction } from '../../molecules/ActionDropdown'
import type { ItemComponentProps } from '../../organisms/MainList'
import MainList from '../../organisms/MainList'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
`

type DictItem = { value: string, label: string }
type Props = {
  items: any[],
  dropdownActions?: DropdownAction[],
  loading: boolean,
  onReloadButtonClick: () => void,
  onItemClick: (item: any) => void,
  selectionLabel: string,
  renderItemComponent: (componentProps: ItemComponentProps) => React.Node,
  itemFilterFunction: (item: any, filterStatus?: ?string, filterState?: string) => boolean,
  onSelectedItemsChange?: (items: any[]) => void,
  filterItems: DictItem[],
  emptyListImage?: ?string,
  emptyListMessage?: string,
  emptyListExtraMessage?: string,
  emptyListButtonLabel?: string,
  onEmptyListButtonClick?: () => void,
  customFilterComponent?: React.Node,
}
type State = {
  items: any[],
  filterStatus: string,
  filterText: string,
  selectedItems: any[],
  selectAllSelected: boolean,
}
@observer
class FilterList extends React.Component<Props, State> {
  state = {
    items: [],
    filterStatus: 'all',
    filterText: '',
    selectedItems: [],
    selectAllSelected: false,
  }

  componentWillMount() {
    this.setState({ items: this.props.items })
  }

  componentWillReceiveProps(props: Props) {
    if (props.items.length !== this.props.items.length) {
      this.setState({
        items: props.items,
        filterStatus: 'all',
        filterText: '',
        selectedItems: [],
      })
      this.props.onSelectedItemsChange && this.props.onSelectedItemsChange([])
      return
    }

    this.setState({ items: this.filterItems(props.items) })
  }

  handleFilterItemClick(item: DictItem) {
    let items = this.filterItems(this.props.items, item.value)
    let selectedItems = this.state.selectedItems.filter(selItem => {
      if (items.find(i => selItem.id === i.id)) {
        return true
      }

      return false
    })

    let selectAllSelected = selectedItems.length > 0 && selectedItems.length === items.length
    this.setState({
      selectedItems,
      selectAllSelected,
      filterStatus: item.value,
      items,
    }, () => {
      this.props.onSelectedItemsChange && this.props.onSelectedItemsChange(selectedItems)
    })
  }

  handleSearchChange(text: string) {
    this.setState({
      filterText: text,
      items: this.filterItems(this.props.items, null, text),
    })
  }
  handleItemSelectedChange(item: MainItem, selected: boolean) {
    let items = this.state.selectedItems.slice(0)
    let selectedItems = items.filter(i => item.id !== i.id) || []

    if (selected) {
      selectedItems.push(item)
    }

    this.setState({ selectedItems, selectAllSelected: false }, () => {
      this.props.onSelectedItemsChange && this.props.onSelectedItemsChange(selectedItems)
    })
  }

  handleSelectAllChange(selected: boolean) {
    let selectedItems = []
    if (selected) {
      selectedItems = this.state.items.slice(0)
    }

    this.setState({ selectedItems, selectAllSelected: selected }, () => {
      this.props.onSelectedItemsChange && this.props.onSelectedItemsChange(selectedItems)
    })
  }

  filterItems(items: MainItem[], filterStatus?: ?string, filterText?: string): MainItem[] {
    filterStatus = filterStatus || this.state.filterStatus
    filterText = typeof filterText === 'undefined' ? this.state.filterText : filterText
    let filteredItems = items.filter(item =>
      this.props.itemFilterFunction(item, filterStatus, filterText)
    )

    return filteredItems
  }

  render() {
    return (
      <Wrapper>
        <MainListFilter
          onFilterItemClick={item => { this.handleFilterItemClick(item) }}
          selectedValue={this.state.filterStatus}
          onReloadButtonClick={this.props.onReloadButtonClick}
          onSearchChange={text => { this.handleSearchChange(text) }}
          searchValue={this.state.filterText}
          onSelectAllChange={selected => { this.handleSelectAllChange(selected) }}
          selectAllSelected={this.state.selectAllSelected}
          customFilterComponent={this.props.customFilterComponent}
          selectionInfo={{
            selected: this.state.selectedItems.length,
            total: this.state.items.length,
            label: this.props.selectionLabel,
          }}
          items={this.props.filterItems}
          dropdownActions={this.props.dropdownActions || []}
          data-test-id="filterList-filter"
        />
        <MainList
          loading={this.props.loading}
          items={this.state.items}
          selectedItems={this.state.selectedItems}
          onSelectedChange={(item, selected) => { this.handleItemSelectedChange(item, selected) }}
          onItemClick={this.props.onItemClick}
          renderItemComponent={this.props.renderItemComponent}
          showEmptyList={this.state.items.length === 0 && this.state.filterStatus === 'all' && this.state.filterText === ''}
          emptyListImage={this.props.emptyListImage}
          emptyListMessage={this.props.emptyListMessage}
          emptyListExtraMessage={this.props.emptyListExtraMessage}
          emptyListButtonLabel={this.props.emptyListButtonLabel}
          onEmptyListButtonClick={this.props.onEmptyListButtonClick}
          data-test-id="filterList-mainList"
        />
      </Wrapper>
    )
  }
}

export default FilterList
