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
    items: null,
    filters: [],
    actions: null,
    refresh: false
  }

  constructor(props) {
    super(props)

    this.state = {
      queryText: '',
      items: this.props.items,
      filters: [],
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

    this.filter = this.filter.bind(this)
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(newProps) {
    let stateFilters = this.state.filters
    this.props.filters.forEach(filter => {
      if (!stateFilters[filter.field]) {
        stateFilters[filter.field] = null
      }
    })
    this.setState({ items: newProps.items, filters: stateFilters })
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

  itemsSelected() {
    let count = 0
    let total = 0
    if (this.state.items) {
      count = this.selectedCount()
      total = this.state.items.length
    }

    return `${count} of ${total} ${this.props.itemName}(s) selected`;
  }

  itemDetail(e, item) {
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

  filter(filter, option) {
    let stateFilters = this.state.filters
    stateFilters[filter.field] = option.value
    this.setState({ filters: stateFilters })
    this.searchItem(this.state.queryText)
  }

  filterFn(item, queryText, filters) {
    let valid = true
    if (item.name.toLowerCase().indexOf(queryText.toLowerCase()) == -1) {
      valid = false
    }
    for (let field in filters) {
      if (item[field] != filters[field] && filters[field] != null) {
        valid = false
      }
    }

    return valid
  }

  renderSearch(items) {
    if (items) {
      let output = items.map((item) => {
        return (
          <div className={s.row + " " + (item.selected ? "selected" : "")} key={"row_" + item.id}>
            <div className={"checkbox-container " + (this.props.actions == null ? "hidden" : "")}>
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
    let items = this.state.items.filter(item => item.selected)
    if (this.props.actions[option.value].confirm) {
      this.setState({
        confirmationDialog: {
          visible: true,
          onConfirm: () => {
            this.setState({ confirmationDialog: { visible: false }})
            if (this.props.actions[option.value].action) {
              items.forEach((item) => {
                this.props.actions[option.value].action(item)
              })
            }
          },
          onCancel: () => {
            this.setState({ confirmationDialog: { visible: false }})
          }
        }
      })
    } else {
      if (this.props.actions[option.value].action) {
        items.forEach((item) => {
          this.props.actions[option.value].action(item)
        })
      }
    }
  }

  refreshList() {
    this.props.refresh()
  }

  render() {
    let tableFilters = this.props.filters.map(filter => {
      let filterTemplate = filter.options.map((option) => (
        <a
          className={this.state.filters[filter.field] == option.value ? "selected" : ""}
          onClick={() => this.filter(filter, option)} key={filter.field + "_" + option.value}
        >{option.label}</a>
      ), this)
      return <div className="category-filter" key={"filter_" + filter.field}>{filterTemplate}</div>
    }, this)

    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.listHeader}>
            <div className="filters">
              <div className={"checkbox-container " + (this.props.actions == null ? "hidden" : "")}>
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
              <div className={s.bulkActions + (this.selectedCount() === 0 ? " invisible " : " ") +
                (this.props.actions == null ? "hidden" : "")}
              >
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
              filters={this.state.filters}
              queryText={this.state.queryText}
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
