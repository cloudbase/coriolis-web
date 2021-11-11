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

import MainListFilter from '@src/components/ui/Lists/MainListFilter'
import Pagination from '@src/components/ui/Pagination'
import type { Action as DropdownAction } from '@src/components/ui/Dropdowns/ActionDropdown'
import type { ItemComponentProps } from '@src/components/ui/Lists/MainList'
import MainList from '@src/components/ui/Lists/MainList'

import configLoader from '@src/utils/Config'

const Wrapper = styled.div<any>`
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
  renderItemComponent: (componentProps: ItemComponentProps) => React.ReactNode,
  itemFilterFunction: (item: any, filterStatus?: string | null, filterState?: string) => boolean,
  onSelectedItemsChange?: (items: any[]) => void,
  onPaginatedItemsChange?: (items: any[]) => void
  filterItems: DictItem[],
  emptyListImage?: string | null,
  emptyListMessage?: string,
  emptyListExtraMessage?: string,
  emptyListButtonLabel?: string,
  onEmptyListButtonClick?: () => void,
  customFilterComponent?: React.ReactNode,
  largeDropdownActionItems?: boolean
}
type State = {
  items: any[],
  filterStatus: string,
  filterText: string,
  selectedItems: any[],
  selectAllSelected: boolean,
  currentPage: number,
}
@observer
class FilterList extends React.Component<Props, State> {
  state: State = {
    items: [],
    filterStatus: 'all',
    filterText: '',
    selectedItems: [],
    selectAllSelected: false,
    currentPage: 1,
  }

  UNSAFE_componentWillMount() {
    this.setState({ items: this.props.items }, () => {
      if (this.props.onPaginatedItemsChange) {
        this.props.onPaginatedItemsChange(this.paginatedItems)
      }
    })
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    if (props.items.length !== this.props.items.length) {
      this.setState({
        items: props.items,
        filterStatus: 'all',
        filterText: '',
        selectedItems: [],
        currentPage: 1,
      }, () => {
        if (this.props.onPaginatedItemsChange) {
          this.props.onPaginatedItemsChange(this.paginatedItems)
        }
      })
      if (this.props.onSelectedItemsChange) this.props.onSelectedItemsChange([])
      return
    }

    this.setState({
      items: this.filterItems(props.items),
    }, () => {
      if (this.props.onPaginatedItemsChange) {
        this.props.onPaginatedItemsChange(this.paginatedItems)
      }
    })
  }

  get paginatedItems() {
    let paginatedItems = this.state.items
    if (paginatedItems.length > configLoader.config.mainListItemsPerPage) {
      paginatedItems = this.state.items
        .filter((_, i) => i < (configLoader.config.mainListItemsPerPage * this.state.currentPage)
        && i >= (configLoader.config.mainListItemsPerPage * (this.state.currentPage - 1)))
    }
    return paginatedItems
  }

  handleFilterItemClick(item: DictItem) {
    this.setState(prevState => {
      const items = this.filterItems(this.props.items, item.value)
      const selectedItems = prevState.selectedItems.filter(selItem => {
        if (items.find(i => selItem.id === i.id)) {
          return true
        }

        return false
      })

      const selectAllSelected = selectedItems.length > 0 && selectedItems.length === items.length
      this.setState({
        selectedItems,
        selectAllSelected,
        filterStatus: item.value,
        items,
        currentPage: 1,
      }, () => {
        if (this.props.onSelectedItemsChange) {
          this.props.onSelectedItemsChange(selectedItems)
        }
        if (this.props.onPaginatedItemsChange) {
          this.props.onPaginatedItemsChange(this.paginatedItems)
        }
      })
    })
  }

  handleSearchChange(text: string) {
    this.setState({
      filterText: text,
      items: this.filterItems(this.props.items, null, text),
      currentPage: 1,
    }, () => {
      if (this.props.onPaginatedItemsChange) {
        this.props.onPaginatedItemsChange(this.paginatedItems)
      }
    })
  }

  handleItemSelectedChange(item: any, selected: boolean) {
    const items = this.state.selectedItems.slice(0)
    const selectedItems = items.filter(i => item.id !== i.id) || []

    if (selected) {
      selectedItems.push(item)
    }

    this.setState({ selectedItems, selectAllSelected: false }, () => {
      if (this.props.onSelectedItemsChange) this.props.onSelectedItemsChange(selectedItems)
    })
  }

  handleSelectAllChange(selected: boolean) {
    let selectedItems: any[] = []
    if (selected) {
      selectedItems = this.paginatedItems.slice(0)
    }

    this.setState({ selectedItems, selectAllSelected: selected }, () => {
      if (this.props.onSelectedItemsChange) this.props.onSelectedItemsChange(selectedItems)
    })
  }

  filterItems(items: any[], filterStatus?: string | null, filterText?: string): any[] {
    const newFilterStatus = filterStatus || this.state.filterStatus
    const newFilterText = typeof filterText === 'undefined' ? this.state.filterText : filterText
    const filteredItems = items
      .filter(item => this.props.itemFilterFunction(item, newFilterStatus, newFilterText))

    return filteredItems
  }

  handlePageClick(page: number) {
    this.setState({ currentPage: page }, () => {
      if (this.props.onPaginatedItemsChange) {
        this.props.onPaginatedItemsChange(this.paginatedItems)
      }
    })
  }

  renderPagination() {
    const itemsCount = this.state.items.length
    const totalPages = Math.ceil(itemsCount / configLoader.config.mainListItemsPerPage)
    const hasNextPage = this.state.currentPage
      * configLoader.config.mainListItemsPerPage < itemsCount
    const isPreviousDisabled = this.state.currentPage === 1
    const isNextDisabled = !hasNextPage

    return itemsCount > configLoader.config.mainListItemsPerPage ? (
      <Pagination
        currentPage={this.state.currentPage}
        totalPages={totalPages}
        nextDisabled={isNextDisabled}
        previousDisabled={isPreviousDisabled}
        onNextClick={() => { this.handlePageClick(this.state.currentPage + 1) }}
        onPreviousClick={() => { this.handlePageClick(this.state.currentPage - 1) }}
        style={{ margin: '32px 0 16px 0' }}
      />
    ) : null
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
          largeDropdownActionItems={this.props.largeDropdownActionItems}
        />
        <MainList
          loading={this.props.loading}
          items={this.paginatedItems}
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
        />
        {this.renderPagination()}
      </Wrapper>
    )
  }
}

export default FilterList
