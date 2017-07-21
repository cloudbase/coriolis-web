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
import NotificationActions from '../../actions/NotificationActions';
import s from './Notifications.scss';
import NotificationSystem from 'react-notification-system';

class Notifications extends Component {

  static propTypes = {
    notifications: PropTypes.array
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
  }

  componentWillReceiveProps(newProps, oldProps) {
    if (newProps != oldProps && newProps.notifications.length) {
      this.send(
        newProps.notifications[0].message,
        newProps.notifications[0].type,
        newProps.notifications[0].title,
        newProps.notifications[0].hideDelay,
        newProps.notifications[0].action
      )
      if (newProps.notifications[0].keep === true) {
        newProps.notifications[0].unread = true
        NotificationActions.keepNotification(newProps.notifications[0])
      }
      NotificationActions.removeNotification()
    }
  }

  _addNotification(event) {
    event.preventDefault();
    this._notificationSystem.addNotification({
      message: 'Notification message',
      level: 'success'
    });
  }

  _notificationSystem = null

  send(message, type = 'info', title = null, hideDelay = 5000, action = null) {
    if (title === null) {
      title = message
      message = null
    }
    this._notificationSystem.addNotification({
      title: title,
      message: message,
      level: type,
      position: "br",
      autoDismiss: 10,
      action: action
    })
  }

  render() {
    return (
      <div>
        <NotificationSystem ref="notificationSystem" />
      </div>
    );
  }

}

export default withStyles(Notifications, s);
