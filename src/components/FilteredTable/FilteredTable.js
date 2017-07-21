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
import s from './FilteredTable.scss';
import LoadingIcon from "../LoadingIcon/LoadingIcon";


class FilteredTable extends Component {

  static defaultProps = {
    items: null,
    filterFn: null,
    renderSearchItem: null,
    customClassName: null
  }

  static propTypes = {
    items: PropTypes.array,
    filterFn: PropTypes.func,
    queryText: PropTypes.string,
    filters: PropTypes.array,
    renderSearch: PropTypes.func,
    customClassName: PropTypes.string
  }

  constructor(props) {
    super(props)
    if (props.items) {
      this.state = {
        filteredData: props.items
      }
    } else {
      this.state = {
        filteredData: null
      }
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.items) {
      this.setState({ filteredData: newProps.items }, () => {
        this.searchItem()
      })
    }
  }

  searchItem() {
    let queryResult = []
    if (this.props.items.length) {
      this.props.items.forEach((item) => {
        if (this.props.filterFn(item, this.props.queryText, this.props.filters)) {
          queryResult.push(item)
        }
      }, this)
    }

    this.setState({
      filteredData: queryResult
    })
  }

  render() {
    let output = <LoadingIcon />
    if (this.state.filteredData) {
      if (this.state.filteredData.length) {
        output = (<div className="items-list">{this.props.renderSearch(this.state.filteredData)}</div>)
      } else {
        output = (<div className="no-results">No results</div>)
      }
    }
    return (
      <div className={s.root + " " + this.props.customClassName}>
        {output}
      </div>
    );
  }

}

export default withStyles(FilteredTable, s);
