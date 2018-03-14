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

import type { NotificationItem } from '../types/NotificationItem'

class NotificationSource {
  static notify(message: string, level?: $PropertyType<NotificationItem, 'level'>, options?: $PropertyType<NotificationItem, 'options'>): Promise<NotificationItem> {
    return new Promise(resolve => {
      let notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      let newItem = {
        id: new Date().getTime().toString(),
        message,
        level,
        options,
      }
      notifications.push(newItem)
      localStorage.setItem('notifications', JSON.stringify(notifications))
      resolve(newItem)
    })
  }

  static loadNotifications(): Promise<NotificationItem[]> {
    return new Promise(resolve => {
      resolve(JSON.parse(localStorage.getItem('notifications') || '[]'))
    })
  }

  static clearNotifications(): Promise<void> {
    return new Promise(resolve => {
      localStorage.setItem('notifications', '[]')
      resolve()
    })
  }
}

export default NotificationSource
