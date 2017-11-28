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
import NotificationActions from '../actions/NotificationActions'

class NotificationStore {
  constructor() {
    this.bindListeners({
      notify: NotificationActions.NOTIFY,
      notifySuccess: NotificationActions.NOTIFY_SUCCESS,
      loadNotificationsSuccess: NotificationActions.LOAD_NOTIFICATIONS_SUCCESS,
      clearNotificationsSuccess: NotificationActions.CLEAR_NOTIFICATIONS_SUCCESS,
    })

    this.notifications = []
    this.persistedNotifications = []
  }

  notify(options) {
    let newItem = {
      ...options,
    }

    this.notifications = this.notifications.concat(newItem)
  }

  notifySuccess(notification) {
    this.persistedNotifications = this.persistedNotifications.concat([notification])
  }

  loadNotificationsSuccess(notifications) {
    this.persistedNotifications = notifications
  }

  clearNotificationsSuccess() {
    this.persistedNotifications = []
  }
}

export default alt.createStore(NotificationStore)
