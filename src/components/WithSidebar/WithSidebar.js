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
import s from './WithSidebar.scss';
import Location from '../../core/Location';

class WithSidebar extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    route: PropTypes.string
  }

  constructor(props) {
    super(props)
    this.state = {
      menuItems: [
        {
          label: "Replicas",
          route: "/replicas"
        },
        {
          label: "Migrations",
          route: "/migrations"
        },
        {
          label: "Cloud Endpoints",
          route: "/cloud-endpoints"
        }
      ]
    }
  }

  goToMenu(item) {
    Location.push(item.route)
  }

  render() {
    let menuItems = this.state.menuItems.map((item, index) =>
      (
        <li
          key={"menu_" + index} className={item.route == this.props.route ? s.active : ""}
          onClick={(e) => this.goToMenu(item)}
        >
          {item.label}
        </li>
      ), this)

    return (
      <div className={s.root}>
        <div className={s.sidebar}>
          <div className={s.logo + " logo coriolis-white"} onClick={(e) => this.goToMenu({ route: "/migrations" })}></div>
          <ul>
            {menuItems}
          </ul>
        </div>
        <div className={s.container}>
          {this.props.children}
        </div>
      </div>
    );
  }

}

export default withStyles(WithSidebar, s);
