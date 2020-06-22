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

import moment from 'moment'

import configLoader from '../utils/Config'
import Api from '../utils/ApiCaller'
import type { NotificationItemData, NotificationItem } from '../@types/NotificationItem'

class NotificationStorage {
  static storeName: string = 'seenNotifications'

  static loadSeen(): NotificationItemData[] | null {
    const storage: string | null = localStorage.getItem(this.storeName)

    if (!storage) {
      return null
    }

    const notificationItems: NotificationItem[] = JSON.parse(storage)
    const notificationItem: NotificationItem | undefined = notificationItems
      .find(n => n.projectId === Api.projectId)

    if (!notificationItem) {
      return null
    }

    return notificationItem.items
  }

  static saveSeen(items: NotificationItemData[]) {
    const currentStorage: string | null = localStorage.getItem(this.storeName)
    let currentItems: NotificationItem[] = []

    if (currentStorage) {
      currentItems = JSON.parse(currentStorage) as NotificationItem[]
      currentItems = currentItems.filter(i => i.projectId !== Api.projectId)
    }

    const newItem: NotificationItem = {
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
      const availableExecutions = item.executions.filter((i: any) => !i.deleted_at)
      if (availableExecutions.length) {
        availableExecutions.sort((a: any, b: any) => b.number - a.number)
        return availableExecutions[0]
      }
    }

    return item
  }

  static getUpdatedAt(item: any) {
    const info = this.getMainInfo(item)
    return info.updated_at || info.created_at
  }

  static getItemDescription(item: any) {
    const type = item.type === 'replica' ? 'Replica' : 'Migration'
    const mainInfo = this.getMainInfo(item)
    let description = ''
    const id = `${mainInfo.id.substr(0, 7)}...`
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
  async loadData(): Promise<NotificationItemData[]> {
    const [migrationsResponse, replicasResponse] = await Promise.all([
      Api.send({ url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/migrations`, skipLog: true, quietError: true }),
      Api.send({ url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas`, skipLog: true, quietError: true }),
    ])

    const migrations = migrationsResponse.data.migrations
    const replicas = replicasResponse.data.replicas
    const apiData = [...migrations, ...replicas]
    apiData.sort((a, b) => moment(DataUtils.getUpdatedAt(b)).diff(DataUtils.getUpdatedAt(a)))

    const notificationItems: NotificationItemData[] = apiData.map(item => {
      const mainInfo = DataUtils.getMainInfo(item)

      const newItem: NotificationItemData = {
        id: item.id,
        status: mainInfo.status,
        type: item.type,
        name: item.instances[0],
        updatedAt: mainInfo.updated_at,
        description: DataUtils.getItemDescription(item),
      }
      return newItem
    }).filter(item => item.status).filter((_, i) => i < 10)

    let storageData = NotificationStorage.loadSeen()
    if (!storageData) {
      NotificationStorage.saveSeen(notificationItems)
      storageData = NotificationStorage.loadSeen() || []
    }
    notificationItems.forEach(item => {
      // eslint-disable-next-line no-param-reassign
      item.unseen = true

      storageData?.forEach(storageItem => {
        if (storageItem.id === item.id
          && storageItem.status === item.status && storageItem.updatedAt === item.updatedAt) {
          // eslint-disable-next-line no-param-reassign
          item.unseen = false
        }
      })
    })
    NotificationStorage.clean(notificationItems)
    return notificationItems
  }

  saveSeen(notificationItems: NotificationItemData[]) {
    NotificationStorage.saveSeen(notificationItems)
  }
}

export default new NotificationSource()
