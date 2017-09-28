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
import s from './Switch.scss';

class Switch extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    checked: PropTypes.bool,
    checkedLabel: PropTypes.string,
    uncheckedLabel: PropTypes.string
  }

  constructor(props) {
    super(props)

    this.state = {
      checked: props && props.checked
    }
  }

  handleChange(e) {
    if (this.props.onChange) {
      this.props.onChange(e)
    }

    this.setState({ checked: e.target.checked })
  }

  render() {
    let renderLabel = () => {
      if ((this.state.checked && this.props.checkedLabel) || (!this.state.checked && this.props.uncheckedLabel)) {
        return (
          <div className={s.label}>
            {this.state.checked ? this.props.checkedLabel : this.props.uncheckedLabel}
          </div>
        )
      }
      return null
    }

    return (
      <div className={s.root}>
        <input
          type="checkbox"
          className={s.input}
          checked={this.state.checked}
          className="ios-switch tinyswitch"
          onChange={this.handleChange.bind(this)}
        />
        <div><div></div></div>
        {renderLabel()}
      </div>
    )
  }
}

export default withStyles(Switch, s);
