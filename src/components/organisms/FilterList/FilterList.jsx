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

import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { MainListFilter, MainList } from 'components'

const Wrapper = styled.div`
`

class FilterList extends React.Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    actions: PropTypes.array,
    loading: PropTypes.bool,
    onReloadButtonClick: PropTypes.func,
    onItemClick: PropTypes.func,
    onActionChange: PropTypes.func,
    selectionLabel: PropTypes.string,
    renderItemComponent: PropTypes.func,
    itemFilterFunction: PropTypes.func.isRequired,
    filterItems: PropTypes.array.isRequired,
    emptyListImage: PropTypes.string,
    emptyListMessage: PropTypes.string,
    emptyListExtraMessage: PropTypes.string,
    emptyListButtonLabel: PropTypes.string,
    onEmptyListButtonClick: PropTypes.func,
  }

  constructor() {
    super()

    this.state = {
      items: [],
      filterStatus: 'all',
      filterText: '',
      selectedItems: [],
    }
  }

  componentWillMount() {
    this.setState({ items: this.props.items })
  }

  componentWillReceiveProps(props) {
    if (props.items.length !== this.props.items.length) {
      this.setState({
        items: props.items,
        filterStatus: 'all',
        filterText: '',
        selectedItems: [],
      })
      return
    }

    this.setState({ items: this.filterItems(props.items) })
  }

  handleFilterItemClick(item) {
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
    })
  }

  handleSearchChange(text) {
    this.setState({
      filterText: text,
      items: this.filterItems(this.props.items, null, text),
    })
  }

  filterItems(items, filterStatus, filterText) {
    filterStatus = filterStatus || this.state.filterStatus
    filterText = typeof filterText === 'undefined' ? this.state.filterText : filterText
    let filteredItems = items.filter(item => {
      return this.props.itemFilterFunction(item, filterStatus, filterText)
    })

    return filteredItems
  }

  handleItemSelectedChange(item, selected) {
    let items = this.state.selectedItems.slice(0)
    let selectedItems = items.filter(i => item.id !== i.id) || []

    if (selected) {
      selectedItems.push(item)
    }

    this.setState({ selectedItems, selectAllSelected: false })
  }

  handleSelectAllChange(selected) {
    let selectedItems = []
    if (selected) {
      selectedItems = this.state.items.slice(0)
    }

    this.setState({ selectedItems, selectAllSelected: selected })
  }

  handleActionChange(action) {
    this.props.onActionChange(this.state.selectedItems, action)
  }

  render() {
    return (
      <Wrapper>
        <MainListFilter
          onFilterItemClick={item => { this.handleFilterItemClick(item) }}
          selectedValue={this.state.filterStatus}
          onReloadButtonClick={this.props.onReloadButtonClick}
          onSearchChange={text => { this.handleSearchChange(text) }}
          onSelectAllChange={selected => { this.handleSelectAllChange(selected) }}
          selectAllSelected={this.state.selectAllSelected}
          selectionInfo={{
            selected: this.state.selectedItems.length,
            total: this.state.items.length,
            label: this.props.selectionLabel,
          }}
          items={this.props.filterItems}
          actions={this.props.actions}
          onActionChange={action => { this.handleActionChange(action) }}
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
        />
      </Wrapper>
    )
  }
}

export default FilterList
