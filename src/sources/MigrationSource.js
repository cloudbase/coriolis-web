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

import cookie from 'js-cookie'
import moment from 'moment'

import Api from '../utils/ApiCaller'
import type { MainItem } from '../types/MainItem'
import type { Field } from '../types/Field'

import { servicesUrl } from '../config'

class MigrationSourceUtils {
  static sortTaskUpdates(migration) {
    if (migration && migration.tasks) {
      migration.tasks.forEach(task => {
        if (task && task.progress_updates) {
          task.progress_updates.sort((a, b) => {
            let sortNull = !a && b ? 1 : a && !b ? -1 : !a && !b ? 0 : false
            if (sortNull !== false) {
              return sortNull
            }
            return moment(a.created_at).isBefore(moment(b.created_at))
          })
        }
      })
    }
  }

  static sortMigrations(migrations) {
    migrations.sort((a, b) => moment(b.created_at).diff(moment(a.created_at)))

    migrations.forEach(migration => {
      MigrationSourceUtils.sortTaskUpdates(migration)
    })
  }
}

class MigrationSource {
  static getMigrations(): Promise<MainItem[]> {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId') || 'null'
      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/migrations/detail`,
        method: 'GET',
      }).then(response => {
        let migrations = response.data.migrations
        MigrationSourceUtils.sortMigrations(migrations)
        resolve(migrations)
      }, reject).catch(reject)
    })
  }

  static getMigration(migrationId: string): Promise<MainItem> {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId') || 'null'

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/migrations/${migrationId}`,
        method: 'GET',
      }).then(response => {
        let migration = response.data.migration
        MigrationSourceUtils.sortTaskUpdates(migration)
        resolve(migration)
      }, reject).catch(reject)
    })
  }

  static cancel(migrationId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId') || 'null'

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/migrations/${migrationId}/actions`,
        method: 'POST',
        data: { cancel: null },
      }).then(() => {
        resolve(migrationId)
      }, reject).catch(reject)
    })
  }

  static delete(migrationId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId || 'null'}/migrations/${migrationId}`,
        method: 'DELETE',
      }).then(() => { resolve(migrationId) }, reject).catch(reject)
    })
  }

  static migrateReplica(replicaId: string, options: Field[]): Promise<MainItem> {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
      let payload = {
        migration: {
          replica_id: replicaId,
        },
      }
      options.forEach(o => {
        payload.migration[o.name] = o.value || false
      })

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId || 'null'}/migrations`,
        method: 'POST',
        data: payload,
      }).then(response => {
        let migration = response.data.migration
        resolve(migration)
      }, reject).catch(reject)
    })
  }
}

export default MigrationSource

