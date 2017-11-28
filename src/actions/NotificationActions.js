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

import alt from '../alt'

import NotificationSource from '../sources/NotificationSource'

class NotificationActions {
  notify(message, level, options) {
    if (options && options.persist) {
      NotificationSource.notify(message, level, options).then(
        notification => { this.notifySuccess(notification) },
        response => { this.notifyFailed(response) }
      )
    }

    return { message, level, ...options }
  }

  notifySuccess(notification) {
    return notification
  }

  notifyFailed(response) {
    return response || true
  }

  loadNotifications() {
    NotificationSource.loadNotifications().then(
      notifications => { this.loadNotificationsSuccess(notifications) },
      response => { this.loadNotificationsFailed(response) }
    )

    return true
  }

  loadNotificationsSuccess(notifications) {
    return notifications
  }

  loadNotificationsFailed(response) {
    return response || true
  }

  clearNotifications() {
    NotificationSource.clearNotifications().then(
      () => { this.clearNotificationsSuccess() },
      response => { this.clearNotificationsFailed(response) }
    )

    return true
  }

  clearNotificationsSuccess() {
    return true
  }

  clearNotificationsFailed(response) {
    return response || true
  }
}

export default alt.createActions(NotificationActions)
