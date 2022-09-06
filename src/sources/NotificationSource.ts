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

import configLoader from "@src/utils/Config";
import Api from "@src/utils/ApiCaller";
import type {
  NotificationItemData,
  NotificationItem,
} from "@src/@types/NotificationItem";
import {
  TransferItem,
  MigrationItem,
  ReplicaItem,
  getTransferItemTitle,
} from "@src/@types/MainItem";

class NotificationStorage {
  static storeName = "seenNotifications";

  static loadSeen(): NotificationItemData[] | null {
    const storage: string | null = localStorage.getItem(this.storeName);

    if (!storage) {
      return null;
    }

    const notificationItems: NotificationItem[] = JSON.parse(storage);
    const notificationItem: NotificationItem | undefined =
      notificationItems.find(n => n.projectId === Api.projectId);

    if (!notificationItem) {
      return null;
    }

    return notificationItem.items;
  }

  static saveSeen(items: NotificationItemData[]) {
    const currentStorage: string | null = localStorage.getItem(this.storeName);
    let currentItems: NotificationItem[] = [];

    if (currentStorage) {
      currentItems = JSON.parse(currentStorage) as NotificationItem[];
      currentItems = currentItems.filter(i => i.projectId !== Api.projectId);
    }

    const newItem: NotificationItem = {
      projectId: Api.projectId,
      items,
    };
    localStorage.setItem(
      this.storeName,
      JSON.stringify([...currentItems, newItem])
    );
  }

  static clean(notificationItems: NotificationItemData[]) {
    let storageData = this.loadSeen();
    if (!storageData) {
      return;
    }
    storageData = storageData.filter(i =>
      notificationItems.find(j => i.id === j.id)
    );
    this.saveSeen(storageData);
  }
}

class DataUtils {
  static getItemDescription(item: TransferItem) {
    return `New ${item.type} ${item.id.substr(
      0,
      7
    )}... status: ${item.last_execution_status
      .toLowerCase()
      .replace(/_/g, " ")}`;
  }
}

class NotificationSource {
  async loadData(): Promise<NotificationItemData[]> {
    const [migrationsResponse, replicasResponse] = await Promise.all([
      Api.send({
        url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/migrations`,
        skipLog: true,
        quietError: true,
      }),
      Api.send({
        url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas`,
        skipLog: true,
        quietError: true,
      }),
    ]);

    const migrations: MigrationItem[] = migrationsResponse.data.migrations;
    const replicas: ReplicaItem[] = replicasResponse.data.replicas;
    const apiData = [...migrations, ...replicas];
    apiData.sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at).getTime() -
        new Date(a.updated_at || a.created_at).getTime()
    );

    const notificationItems: NotificationItemData[] = apiData
      .map(item => {
        const newItem: NotificationItemData = {
          id: item.id,
          status: item.last_execution_status,
          type: item.type,
          name: getTransferItemTitle(item) || "",
          updatedAt: item.updated_at,
          description: DataUtils.getItemDescription(item),
        };
        return newItem;
      })
      .filter(item => item.status)
      .filter((_, i) => i < 10);

    let storageData = NotificationStorage.loadSeen();
    if (!storageData) {
      NotificationStorage.saveSeen(notificationItems);
      storageData = NotificationStorage.loadSeen() || [];
    }
    notificationItems.forEach(item => {
      item.unseen = true;

      storageData?.forEach(storageItem => {
        if (
          storageItem.id === item.id &&
          storageItem.status === item.status &&
          storageItem.updatedAt === item.updatedAt
        ) {
          item.unseen = false;
        }
      });
    });
    NotificationStorage.clean(notificationItems);
    return notificationItems;
  }

  saveSeen(notificationItems: NotificationItemData[]) {
    NotificationStorage.saveSeen(notificationItems);
  }
}

export default new NotificationSource();
