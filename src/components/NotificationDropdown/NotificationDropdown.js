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
import s from './NotificationDropdown.scss';
import Dropdown from 'react-dropdown';
import UserStore from '../../stores/UserStore';
import NotificationActions from '../../actions/NotificationActions';

class NotificationDropdown extends Dropdown {
  static defaultProps = {
    notifications: [],
    baseClassName: "NotificationDropdown",
    options: [{ label: "", value: "" }]
  }
  constructor(props) {
    super(props)
    this.store = UserStore
  }

  buildMenu() {
    let notifications = <p className={s.noNotifications}>You have no notifications</p>

    if (this.props.notifications.length) {
      notifications = this.props.notifications.map((notification, index) => (
          <div
            className="notifications-wrapper"
            key={index}
            onClick={notification.action ? notification.action.callback : null}
          >
            <div className={"notification notification-" + notification.type}>
              <div className="notification-title">{notification.title}</div>
              <div className="notification-message">{notification.message}</div>
            </div>
          </div>
        ), this)
    }
    return (
      <div>
        <div className={s.notificationList}>
          {notifications}
        </div>
      </div>
    )
  }

  unreadNotifications() {
    let count = 0
    this.props.notifications.forEach(notification => {
      if (notification.unread) {
        count++
      }
    })
    return count
  }

  handleMouseDown(event) {
    super.handleMouseDown.call(this, event)
    this.setState({ firstHover: false })
    NotificationActions.markAsRead()
  }

  render() {
    let result = super.render.call(this)
    let children = Object.assign({}, result.props.children)
    children = [
      <div className={s.userIcon + (this.props.dark ? " dark" : "")} onMouseDown={(e) => this.handleMouseDown(e)}>
        <span className={s.notificationCount + " count-" + this.unreadNotifications()}>
          {this.unreadNotifications()}
        </span>
      </div>,
      children[1]
    ]
    let newResult = React.cloneElement(result, { children: children })
    return newResult
  }
}

export default withStyles(NotificationDropdown, s);
