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

import moment from 'moment'

import { servicesUrl } from '../config'
import Api from '../utils/ApiCaller'
import type { NotificationItemData, NotificationItem } from '../types/NotificationItem'

class NotificationStorage {
  static storeName: string = 'seenNotifications'

  static loadSeen(): ?NotificationItemData[] {
    let storage: ?string = localStorage.getItem(this.storeName)

    if (!storage) {
      return null
    }

    let notificationItems: NotificationItem[] = JSON.parse(storage)
    let notificationItem: ?NotificationItem = notificationItems.find(n => n.projectId === Api.projectId)

    if (!notificationItem) {
      return null
    }

    return notificationItem.items
  }

  static saveSeen(items: NotificationItemData[]) {
    let currentStorage: ?string = localStorage.getItem(this.storeName)
    let currentItems: NotificationItem[] = []

    if (currentStorage) {
      currentItems = (JSON.parse(currentStorage): NotificationItem[])
      currentItems = currentItems.filter(i => i.projectId !== Api.projectId)
    }

    let newItem: NotificationItem = {
      projectId: Api.projectId,
      items,
    }
    localStorage.setItem(this.storeName, JSON.stringify([
      ...currentItems,
      newItem,
    ]))
  }

  static clean(notificationItems: NotificationItemData[]) {
    let storageData = this.loadSeen()
    if (!storageData) {
      return
    }
    storageData = storageData.filter(i => notificationItems.find(j => i.id === j.id))
    this.saveSeen(storageData)
  }
}

class DataUtils {
  static getMainInfo(item: any) {
    if (item.type === 'migration') {
      return item
    }
    if (item.executions && item.executions.length) {
      let availableExecutions = item.executions.filter(i => !i.deleted_at)
      if (availableExecutions.length) {
        availableExecutions.sort((a, b) => b.number - a.number)
        return availableExecutions[0]
      }
    }

    return item
  }

  static getUpdatedAt(item: any) {
    let info = this.getMainInfo(item)
    return info.updated_at || info.created_at
  }

  static getItemDescription(item: any) {
    let type = item.type === 'replica' ? 'Replica' : 'Migration'
    let mainInfo = this.getMainInfo(item)
    let description = ''
    let id = `${mainInfo.id.substr(0, 7)}...`
    switch (mainInfo.status) {
      case 'COMPLETED':
        description = `${type} execution ${id} completed successfully`
        break
      case 'ERROR':
        description = `${type} execution ${id} failed`
        break
      case 'RUNNING':
        description = `${type} execution ${id} running`
        break
      default:
        break
    }
    return description
  }
}

class NotificationSource {
  static loadData(): Promise<NotificationItemData[]> {
    return Promise.all([
      Api.send({ url: `${servicesUrl.coriolis}/${Api.projectId}/migrations`, skipLog: true, quietError: true }),
      Api.send({ url: `${servicesUrl.coriolis}/${Api.projectId}/replicas/detail`, skipLog: true, quietError: true }),
    ]).then(([migrationsResponse, replicasResponse]) => {
      let migrations = migrationsResponse.data.migrations
      let replicas = replicasResponse.data.replicas
      let apiData = [...migrations, ...replicas]
      apiData.sort((a, b) => moment(DataUtils.getUpdatedAt(b)).diff(DataUtils.getUpdatedAt(a)))

      let notificationItems: NotificationItemData[] = apiData.map(item => {
        let mainInfo = DataUtils.getMainInfo(item)

        let newItem: NotificationItemData = {
          id: item.id,
          status: mainInfo.status,
          type: item.type,
          name: item.instances[0],
          updatedAt: mainInfo.updated_at,
          description: DataUtils.getItemDescription(item),
        }
        return newItem
      }).filter(item => item.status).filter((item, i) => i < 10)

      let storageData = NotificationStorage.loadSeen()
      if (!storageData) {
        NotificationStorage.saveSeen(notificationItems)
        storageData = NotificationStorage.loadSeen() || []
      }
      notificationItems.forEach(item => {
        item.unseen = true
        // $FlowIgnore
        storageData.forEach(storageItem => {
          if (storageItem.id === item.id && storageItem.status === item.status && storageItem.updatedAt === item.updatedAt) {
            item.unseen = false
          }
        })
      })
      NotificationStorage.clean(notificationItems)
      return notificationItems
    })
  }

  static saveSeen(notificationItems: NotificationItemData[]) {
    NotificationStorage.saveSeen(notificationItems)
  }
}

export default NotificationSource
