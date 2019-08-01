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

import { OptionsSchemaPlugin } from '../plugins/endpoint'
import { sortTasks } from './ReplicaSource'

import Api from '../utils/ApiCaller'
import type { MainItem } from '../types/MainItem'
import type { Field } from '../types/Field'
import type { NetworkMap } from '../types/Network'
import type { Endpoint, StorageMap } from '../types/Endpoint'

import { servicesUrl } from '../constants'

class MigrationSourceUtils {
  static sortTaskUpdates(updates) {
    if (!updates) {
      return
    }
    updates.sort((a, b) => {
      let sortNull = !a && b ? 1 : a && !b ? -1 : !a && !b ? 0 : false
      if (sortNull !== false) {
        return sortNull
      }
      return moment(a.created_at).toDate().getTime() - moment(b.created_at).toDate().getTime()
    })
  }

  static sortMigrations(migrations) {
    migrations.sort((a, b) => moment(b.created_at).diff(moment(a.created_at)))

    migrations.forEach(migration => {
      sortTasks(migration.tasks, MigrationSourceUtils.sortTaskUpdates)
    })
  }
}

class MigrationSource {
  static getMigrations(skipLog?: boolean): Promise<MainItem[]> {
    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/migrations/detail`,
      skipLog,
    }).then(response => {
      let migrations = response.data.migrations
      MigrationSourceUtils.sortMigrations(migrations)
      return migrations
    })
  }

  static getMigration(migrationId: string, skipLog?: boolean): Promise<MainItem> {
    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/migrations/${migrationId}`,
      skipLog,
    }).then(response => {
      let migration = response.data.migration
      sortTasks(migration.tasks, MigrationSourceUtils.sortTaskUpdates)
      return migration
    })
  }

  static recreate(opts: {
    sourceEndpoint: Endpoint,
    destEndpoint: Endpoint,
    instanceNames: string[],
    destEnv: ?{ [string]: any },
    updatedDestEnv: ?{ [string]: any },
    sourceEnv?: ?{ [string]: any },
    updatedSourceEnv?: ?{ [string]: any },
    storageMappings: ?{ [string]: any },
    updatedStorageMappings: ?StorageMap[],
    networkMappings: ?{ [string]: any },
    updatedNetworkMappings: ?NetworkMap[],
  }): Promise<MainItem> {
    const getValue = (fieldName: string): ?string => {
      return (opts.updatedDestEnv && opts.updatedDestEnv[fieldName]) ||
        (opts.destEnv && opts.destEnv[fieldName])
    }

    const sourceParser = OptionsSchemaPlugin[opts.sourceEndpoint.type] || OptionsSchemaPlugin.default
    const destParser = OptionsSchemaPlugin[opts.destEndpoint.type] || OptionsSchemaPlugin.default
    let payload: any = {}

    payload.migration = {
      origin_endpoint_id: opts.sourceEndpoint.id,
      destination_endpoint_id: opts.destEndpoint.id,
      destination_environment: {
        ...opts.destEnv,
        ...destParser.getDestinationEnv(opts.updatedDestEnv),
      },
      instances: opts.instanceNames,
      notes: getValue('description') || '',
    }

    if (getValue('skip_os_morphing') != null) {
      payload.migration.skip_os_morphing = getValue('skip_os_morphing')
    }

    if (opts.networkMappings || (opts.updatedNetworkMappings && opts.updatedNetworkMappings.length)) {
      payload.migration.network_map = {
        ...opts.networkMappings,
        ...destParser.getNetworkMap(opts.updatedNetworkMappings),
      }
    }

    if ((opts.storageMappings && Object.keys(opts.storageMappings).length)
      || (opts.updatedStorageMappings && opts.updatedStorageMappings.length)) {
      payload.migration.storage_mappings = {
        ...opts.storageMappings,
        ...destParser.getStorageMap(getValue('default_storage'), opts.updatedStorageMappings),
      }
    }

    if (opts.sourceEnv || opts.updatedSourceEnv) {
      payload.migration.source_environment = {
        ...opts.sourceEnv,
        ...sourceParser.getDestinationEnv(opts.updatedSourceEnv),
      }
    }

    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/migrations`,
      method: 'POST',
      data: payload,
    }).then(response => response.data.migration)
  }

  static cancel(migrationId: string): Promise<string> {
    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/migrations/${migrationId}/actions`,
      method: 'POST',
      data: { cancel: null },
    }).then(() => migrationId)
  }

  static delete(migrationId: string): Promise<string> {
    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/migrations/${migrationId}`,
      method: 'DELETE',
    }).then(() => migrationId)
  }

  static migrateReplica(replicaId: string, options: Field[]): Promise<MainItem> {
    let payload = {
      migration: {
        replica_id: replicaId,
      },
    }
    options.forEach(o => {
      payload.migration[o.name] = o.value || false
    })

    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/migrations`,
      method: 'POST',
      data: payload,
    }).then(response => response.data.migration)
  }
}

export default MigrationSource

