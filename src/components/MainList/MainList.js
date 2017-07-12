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

import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Dropdown from '../NewDropdown';
import SearchBox from '../SearchBox';
import Moment from 'react-moment';
import s from './MainList.scss';
import FilteredTable from '../FilteredTable';
import TextTruncate from 'react-text-truncate';
import ConfirmationDialog from '../ConfirmationDialog'


class MainList extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  }

  static propTypes = {
    itemName: PropTypes.string,
    items: PropTypes.array,
    renderItem: PropTypes.func,
    filters: PropTypes.array,
    actions: PropTypes.object,
    refresh: PropTypes.any,
    detailAction: PropTypes.func
  }

  static defaultProps = {
    itemName: "items",
    items: [],
    filters: [],
    actions: [],
    refresh: false
  }

  constructor(props) {
    super(props)

    this.state = {
      queryText: '',
      items: this.props.items,
      filterType: "all",
      filterStatus: "all",
      searchMin: true,
      selectedAll: false,
      confirmationDialog: {
        visible: false,
        message: "Are you sure?",
        onConfirm: null,
        onCancel: null
      }
    }
    this.listActions = []
    for (let i in this.props.actions) {
      this.listActions.push({ label: props.actions[i].label, value: i })
    }
  }

  componentWillMount() {
    this.setState({ items: this.props.items }) // eslint-disable-line react/no-did-mount-set-state
  }

  componentWillReceiveProps(newProps, oldProps) {
    this.setState({ items: newProps.items })
  }

  itemsSelected() {
    let count = 0
    let total = 0
    if (this.state.items) {
      count = this.selectedCount()
      total = this.state.items.length
    }

    return `${count} of ${total} ${this.props.itemName}(s) selected`;
  }

  selectedCount() {
    let count = 0
    if (this.state.items) {
      this.state.items.forEach((item) => {
        if (item.selected) {
          count++
        }
      })
    }
    return count
  }

  itemDetail(e, item) {
    console.log(this.props.detailAction, typeof this.props.detailAction)
    if (typeof this.props.detailAction == "function") {
      this.props.detailAction(item)
    }
  }

  checkItem(e, itemRef) {
    let items = this.state.items
    items.forEach((item) => {
      if (item == itemRef) {
        item.selected = !item.selected
      }
    })
    this.setState({ items: items, selectedAll: false })
  }

  checkAll() {
    let items = this.state.items
    let selectedAll = this.state.selectedAll

    items.forEach((item) => {
      item.selected = !selectedAll
    })

    this.setState({ items: items, selectedAll: !selectedAll })
  }

  searchItem(queryText) {
    if (queryText.target) {
      this.setState({ queryText: queryText.target.value })
    } else {
      this.setState({ queryText: queryText })
    }
  }

  filterType(e, type) {
    this.setState({ filterType: type }, () => {
      this.searchItem({ target: { value: this.state.queryText } })
    })
  }

  filterStatus(e, status) {
    this.setState({ filterStatus: status }, () => {
      this.searchItem({ target: { value: this.state.queryText } })
    })
  }

  filterFn(item, queryText, filterType, filterStatus) {
    return (
      item.name.toLowerCase().indexOf(queryText.toLowerCase()) != -1 &&
      (filterType == "all" || filterType == item.type) &&
      (filterStatus == "all" || filterStatus == item.status)
    )
  }

  renderSearch(items) {
    if (items) {
      let output = items.map((item) => {
        return (
          <div className={s.row + " " + (item.selected ? "selected" : "")}>
            <div className="checkbox-container">
              <input
                id={"vm_check_" + item.id}
                type="checkbox"
                checked={item.selected}
                onChange={(e) => this.checkItem(e, item)}
                className="checkbox-normal"
              />
              <label htmlFor={"vm_check_" + item.id}></label>
            </div>
            {this.props.renderItem(item)}
          </div>
        )
      })
      return output
    } else {
      return (<div className="no-results">Your search returned no results</div>)
    }
  }

  onActionChange(option) {
    let items = this.state.items.forEach((item) => {
      if (item.selected) {
        return item
      }
    })
    if (this.props.actions[option.value].action) {
      items.forEach((item) => {
        this.props.actions[option.value].action(item)
      })
    }
  }

  refreshList() {
    this.props.refresh()
  }

  render() {
    let _this = this
    let tableFilters = this.props.filters.map(filter => {
      let filterTemplate = filter.options.map((state, index) => (
          <a
            className={_this.state.filterStatus == state.type || (_this.state.filterStatus == null && state.type == "all") ?
              "selected" : ""}
            onClick={(e) => _this.filterStatus(e, state.type)} key={"status_" + index}
          >{state.label}</a>
        )
      )
      return <div className="category-filter">{filterTemplate}</div>
    })

    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.listHeader}>
            <div className="filters">
              <div className="checkbox-container">
                <input
                  id={"vm_check_all"}
                  type="checkbox"
                  checked={this.state.selectedAll[this.state.filterType]}
                  onChange={(e) => this.checkAll()}
                  className="checkbox-normal"
                />
                <label htmlFor={"vm_check_all"}></label>
              </div>
              {tableFilters}
              {this.props.refresh && (
                <div className={s.refreshBtn}>
                  <div className="icon refresh" onClick={(e) => this.refreshList(e)}></div>
                </div>
              )}
              <div className="name-filter">
                <SearchBox
                  placeholder="Search"
                  value={this.state.queryText}
                  onChange={(e) => this.searchItem(e)}
                  minimize={true} // eslint-disable-line react/jsx-boolean-value
                  onClick={(e) => this.toggleSearch(e)}
                  className={"searchBox " + (this.state.searchMin ? "minimize" : "")}
                />
              </div>
              <div className={s.bulkActions + (this.selectedCount() === 0 ? " invisible" : "")}>
                <div className={s.itemsCount}>
                  {this.itemsSelected()}
                </div>
                <Dropdown
                  options={this.listActions}
                  onChange={(e) => this.onActionChange(e)}
                  placeholder="More Actions"
                />
              </div>
            </div>
          </div>
          <div className={s.listContent}>
            <FilteredTable
              items={this.state.items}
              filterFn={this.filterFn}
              queryText={this.state.queryText}
              filterType={this.state.filterType}
              filterStatus={this.state.filterStatus}
              renderSearch={(e) => this.renderSearch(e)}
              customClassName={s.mainTable}
            ></FilteredTable>
          </div>
        </div>
        <ConfirmationDialog
          visible={this.state.confirmationDialog.visible}
          message={this.state.confirmationDialog.message}
          onConfirm={(e) => this.state.confirmationDialog.onConfirm(e)}
          onCancel={(e) => this.state.confirmationDialog.onCancel(e)}
        />
      </div>
    );
  }

}

export default withStyles(MainList, s);
