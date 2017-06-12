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

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './NewDropdown.scss';
import Dropdown from 'react-dropdown';

class NewDropdown extends Dropdown {
  constructor(props) {
    super(props)
    this.state.hovered = null
  }
  buildMenu() {
    let buildMenuResult = super.buildMenu.call(this)

    let newFirstElement = React.cloneElement(buildMenuResult[0], {
      onMouseEnter: () => {
        this.setState({ firstHover: true })
      },
      onMouseLeave: () => {
        this.setState({ firstHover: false })
      }
    })
    buildMenuResult[0] = newFirstElement
    return (
      <div className={"wrapper " + (this.state.firstHover ? "hovered" : "")}>
        <div className="scroller">
          {buildMenuResult}
        </div>
      </div>
    )
  }

  handleMouseDown(event) {
    super.handleMouseDown.call(this, event)
    this.setState({ firstHover: false })
  }

  render() {
    let result = super.render.call(this)

    let children = Object.assign({}, result.props.children)
    let newChildProps = Object.assign({}, children[0].props)
    newChildProps.onFocus = () => {
      this.setState({
        isOpen: true,
        //hovered: this.state.selected.value == '' ? null : this.state.selected
      })
    }
    newChildProps.onBlur = () => {this.setState({ isOpen: false })}
    newChildProps.onKeyPress = (e) => {
      console.log(e) // eslint-disable-line no-console
    }
    newChildProps.tabIndex = 0

    children[0] = React.cloneElement(children[0], newChildProps)
    let newResult = React.cloneElement(result, { children: [children[0], children[1]] })
    return newResult
  }
}

export default withStyles(NewDropdown, s);
