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
import s from './SearchBox.scss';

class SearchBox extends Component {

  static propTypes = {
    maxLines: PropTypes.number,
    minimize: PropTypes.bool,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string
  };

  static defaultProps = {
    maxLines: 1,
    minimize: false,
    placeholder: "Search"
  };

  constructor(props) {
    super(props)
    this.state = {
      isMin: this.props.minimize,
      queryText: ""
    }
  }

  componentDidMount() {

  }

  onBlurAction() {
    if (this.state.queryText.trim() == "" && this.props.minimize) {
      this.setState({ isMin: true })
    }
  }

  onChange(queryText) {
    this.setState({ queryText: queryText.target.value })
    this.props.onChange(queryText.target.value)
  }

  toggleSearch() {
    this.setState({ isMin: false })
  }

  render() {
    return (
      <div className={s.root}>
        <input
          type="text"
          placeholder={this.props.placeholder}
          value={this.state.queryText}
          onChange={(e) => this.onChange(e)}
          onClick={(e) => this.toggleSearch(e)}
          onBlur={(e) => this.onBlurAction(e)}
          className={s.searchBox + " " + (this.state.isMin ? s.minimize : "") + " searchBox " + this.props.className}
        />
      </div>
    );
  }

}

export default withStyles(SearchBox, s);
