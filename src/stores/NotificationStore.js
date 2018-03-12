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

// @flow

import { observable, action } from 'mobx'

import type { NotificationItem } from '../types/NotificationItem'
import NotificationSource from '../sources/NotificationSource'

class NotificationStore {
  @observable notifications: NotificationItem[] = []
  @observable persistedNotifications: NotificationItem[] = []

  @action notify(message: string, level?: $PropertyType<NotificationItem, 'level'>, options?: $PropertyType<NotificationItem, 'options'>): Promise<void> {
    this.notifications.push({ message, level, options })

    if (options && options.persist) {
      return NotificationSource.notify(message, level, options).then((notification: NotificationItem) => {
        this.persistedNotifications.push(notification)
      })
    }

    return Promise.resolve()
  }

  @action loadNotifications(): Promise<void> {
    return NotificationSource.loadNotifications().then((notifications: NotificationItem[]) => {
      this.persistedNotifications = notifications
    })
  }

  @action clearNotifications(): Promise<void> {
    return NotificationSource.clearNotifications().then(() => {
      this.persistedNotifications = []
    })
  }
}

export default new NotificationStore()
