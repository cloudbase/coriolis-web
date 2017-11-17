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

import cookie from 'js-cookie'
import moment from 'moment'

import Api from '../utils/ApiCaller'

import { servicesUrl } from '../config'

class MigrationSourceUtils {
  static sortMigrations(migrations) {
    migrations.sort((a, b) => {
      return moment(b.created_at).diff(moment(a.created_at))
    })
  }
}

class MigrationSource {
  static getMigrations() {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
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

  static getMigration(migrationId) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/migrations/${migrationId}`,
        method: 'GET',
      }).then(response => {
        let migration = response.data.migration
        resolve(migration)
      }, reject).catch(reject)
    })
  }

  static cancel(migrationId) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/migrations/${migrationId}/actions`,
        method: 'POST',
        data: { cancel: null },
      }).then(() => {
        resolve(migrationId)
      }, reject).catch(reject)
    })
  }

  static delete(migrationId) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/migrations/${migrationId}`,
        method: 'DELETE',
      }).then(() => { resolve(migrationId) }, reject).catch(reject)
    })
  }

  static migrateReplica(replicaId, options) {
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
        url: `${servicesUrl.coriolis}/${projectId}/migrations`,
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

