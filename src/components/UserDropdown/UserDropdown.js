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
import s from './UserDropdown.scss';
import Dropdown from 'react-dropdown';
import Location from '../../core/Location';
import UserStore from '../../stores/UserStore';
import UserActions from '../../actions/UserActions';

class UserDropdown extends Dropdown {
  static defaultProps = {
    options: [
      { label: "Profile", value: "profile" },
      { label: "Plans", value: "plans" },
      { label: "Sign Out", value: "signout" },
    ],
    baseClassName: "UserDropdown"
  }

  constructor(props) {
    super(props)
    this.store = UserStore
  }

  setValue(value) {
    switch (value) {
      case "profile":
        Location.push("/user/profile");
        break;
      case "signout":
        UserActions.logout()
        break;
      default:
        break;
    }
  }

  buildMenu() {
    let buildMenuResult = super.buildMenu.call(this)

    return (
      <div>
        <div className={s.userData}>
          <div className={s.userName}>{this.props.userData.name}</div>
          <div className={s.userEmail}>{this.props.userData.email}</div>
        </div>
        <div className={s.userMenu}>
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
    children = [<div className={s.userIcon + (this.props.dark ? " dark" : "")} onMouseDown={(e) => this.handleMouseDown(e)}></div>, children[1]]
    let newResult = React.cloneElement(result, { children: children })
    return newResult
  }
}

export default withStyles(UserDropdown, s);
