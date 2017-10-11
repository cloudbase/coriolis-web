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

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './DropdownButton.scss';

class DropdownButton extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.object.isRequired,
    onButtonClick: PropTypes.func,
    disabled: PropTypes.bool
  }

  constructor(props) {
    super(props)

    this.onPageClick = this.onPageClick.bind(this)

    this.state = {
      value: props.value,
      options: props.options,
      showMenu: false
    }
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.onPageClick, false)
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.onPageClick, false)
  }

  onPageClick() {
    if (!this.itemMouseDown) {
      this.closeMenu()
    }
  }

  onMenuItemClick(option) {
    if (this.props.onChange) {
      this.props.onChange(option)
    }

    this.closeMenu()
    this.setState({
      value: option,
      firstItemHover: false
    })
  }

  onLabelClick() {
    if (this.props.onButtonClick && !this.isDisabled()) {
      this.props.onButtonClick()
    }
  }

  onMenuItemMouseEnter(index) {
    if (index === 0) {
      this.setState({ firstItemHover: true })
    }
  }

  onMenuItemMouseLeave(index) {
    if (index === 0) {
      this.setState({ firstItemHover: false })
    }
  }

  isDisabled() {
    return typeof this.props.disabled !== 'undefined' ? this.props.disabled : false
  }

  toggleMenu() {
    if (!this.isDisabled()) {
      this.setState({ showMenu: !this.state.showMenu })
    }
  }

  closeMenu() {
    this.setState({ showMenu: false })
  }

  renderMenu() {
    if (!this.state.showMenu || this.state.options.length === 0) {
      return null
    }

    return (
      <div className={s.menu + (this.state.firstItemHover ? ' ' + s.firstItemHover : '')}>
        {this.state.options.map((o, i) => (
          <div key={o.value}
            className={s.menuItem + (o.value === this.state.value.value ? ' ' + s.selected : '')}
            onMouseEnter={() => { this.onMenuItemMouseEnter(i) }}
            onMouseLeave={() => { this.onMenuItemMouseLeave(i) }}
            onMouseDown={() => { this.itemMouseDown = true }}
            onMouseUp={() => { this.itemMouseDown = false }}
            onClick={() => { this.onMenuItemClick(o) }}
          >{o.label}</div>
        ))}
      </div>
    )
  }

  render() {
    let className = this.props.className || ' '

    if (this.isDisabled()) {
      className += ' ' + s.disabled
    }

    return (
      <div className={s.root + ' ' + className}>
        <div className={s.label}
          onClick={this.onLabelClick.bind(this)}
        >{this.state && this.state.value.label}</div>
        <div className={s.arrow}
          onClick={this.toggleMenu.bind(this)}
          onMouseDown={() => { this.itemMouseDown = true }}
          onMouseUp={() => { this.itemMouseDown = false }}
        />
        {this.renderMenu()}
      </div>
    )
  }
}

export default withStyles(DropdownButton, s);
