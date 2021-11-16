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

import { OptionsSchemaPlugin } from '../plugins'
import DefaultOptionsSchemaPlugin from '../plugins/default/OptionsSchemaPlugin'
import { sortTasks } from './ReplicaSource'

import Api from '../utils/ApiCaller'
import type { InstanceScript } from '../@types/Instance'
import type { Field } from '../@types/Field'
import type { NetworkMap } from '../@types/Network'
import type { Endpoint, StorageMap } from '../@types/Endpoint'

import configLoader from '../utils/Config'
import { ProgressUpdate, Task } from '../@types/Task'
import {
  MigrationItem, MigrationItemOptions, MigrationItemDetails, UserScriptData,
} from '../@types/MainItem'

import { INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS } from '../components/modules/WizardModule/WizardOptions/WizardOptions'

class MigrationSourceUtils {
  static sortTaskUpdates(updates: ProgressUpdate[]) {
    if (!updates) {
      return
    }
    updates.sort((a, b) => {
      const sortNull = !a && b ? 1 : a && !b ? -1 : !a && !b ? 0 : false
      if (sortNull !== false) {
        return sortNull
      }
      return a.index - b.index
    })
  }

  static sortMigrations(migrations: any[]) {
    migrations.sort((a: any, b: any) => moment(b.created_at).diff(moment(a.created_at)))

    migrations.forEach((migration: { tasks: Task[] }) => {
      sortTasks(migration.tasks, MigrationSourceUtils.sortTaskUpdates)
    })
  }
}

class MigrationSource {
  async getMigrations(skipLog?: boolean): Promise<MigrationItem[]> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/migrations`,
      skipLog,
    })
    const migrations = response.data.migrations
    MigrationSourceUtils.sortMigrations(migrations)
    return migrations
  }

  async getMigration(migrationId: string, skipLog?: boolean): Promise<MigrationItemDetails> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/migrations/${migrationId}`,
      skipLog,
      cancelId: migrationId,
    })
    const migration = response.data.migration
    sortTasks(migration.tasks, MigrationSourceUtils.sortTaskUpdates)
    return migration
  }

  async recreateFullCopy(migration: MigrationItemOptions): Promise<MigrationItem> {
    const {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      origin_endpoint_id, destination_endpoint_id, destination_environment,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      network_map, instances, storage_mappings, notes, destination_minion_pool_id,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      origin_minion_pool_id, instance_osmorphing_minion_pool_mappings,
    } = migration

    const payload: any = {
      migration: {
        origin_endpoint_id,
        destination_endpoint_id,
        destination_environment,
        network_map,
        instances,
        storage_mappings,
        notes,
        destination_minion_pool_id,
        origin_minion_pool_id,
        instance_osmorphing_minion_pool_mappings,
      },
    }

    if (migration.skip_os_morphing != null) {
      payload.migration.skip_os_morphing = migration.skip_os_morphing
    }

    if (migration.source_environment) {
      payload.migration.source_environment = migration.source_environment
    }

    payload.migration.shutdown_instances = Boolean(migration.shutdown_instances)
    payload.migration.replication_count = migration.replication_count || 2

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/migrations`,
      method: 'POST',
      data: payload,
    })
    return response.data.migration
  }

  async recreate(opts: {
    sourceEndpoint: Endpoint,
    destEndpoint: Endpoint,
    instanceNames: string[],
    destEnv: { [prop: string]: any } | null,
    updatedDestEnv: { [prop: string]: any } | null,
    sourceEnv?: { [prop: string]: any } | null,
    updatedSourceEnv?: { [prop: string]: any } | null,
    storageMappings?: { [prop: string]: any } | null,
    updatedStorageMappings: StorageMap[] | null,
    defaultStorage?: { value: string | null, busType?: string | null },
    updatedDefaultStorage?: { value: string | null, busType?: string | null },
    networkMappings?: any,
    updatedNetworkMappings: NetworkMap[] | null,
    defaultSkipOsMorphing: boolean | null,
    replicationCount?: number | null,
    migration: MigrationItemDetails,
    uploadedScripts: InstanceScript[]
    removedScripts: InstanceScript[]
  }): Promise<MigrationItemDetails> {
    const getValue = (fieldName: string): string | null => {
      const updatedDestEnv = opts.updatedDestEnv && opts.updatedDestEnv[fieldName]
      return updatedDestEnv != null ? updatedDestEnv
        : (opts.destEnv && opts.destEnv[fieldName])
    }

    const sourceParser = OptionsSchemaPlugin.for(opts.sourceEndpoint.type)
    const destParser = OptionsSchemaPlugin.for(opts.destEndpoint.type)
    const payload: any = {}

    payload.migration = {
      origin_endpoint_id: opts.sourceEndpoint.id,
      destination_endpoint_id: opts.destEndpoint.id,
      shutdown_instances: Boolean(opts.updatedDestEnv && opts.updatedDestEnv.shutdown_instances),
      replication_count: (opts.updatedDestEnv
        && opts.updatedDestEnv.replication_count) || opts.replicationCount || 2,
      instances: opts.instanceNames,
      notes: getValue('title') || getValue('notes') || '',
    }

    const skipOsMorphingValue = getValue('skip_os_morphing')
    if (skipOsMorphingValue != null) {
      payload.migration.skip_os_morphing = skipOsMorphingValue
    } else if (opts.defaultSkipOsMorphing != null) {
      payload.migration.skip_os_morphing = opts.defaultSkipOsMorphing
    }

    if (opts.networkMappings
      || (opts.updatedNetworkMappings && opts.updatedNetworkMappings.length)) {
      payload.migration.network_map = {
        ...opts.networkMappings,
        ...destParser.getNetworkMap(opts.updatedNetworkMappings),
      }
    }

    if ((opts.storageMappings && Object.keys(opts.storageMappings).length)
      || (opts.updatedStorageMappings && opts.updatedStorageMappings.length)) {
      payload.migration.storage_mappings = {
        ...opts.storageMappings,
        ...destParser
          .getStorageMap(opts.updatedDefaultStorage
            || opts.defaultStorage, opts.updatedStorageMappings),
      }
    }
    const { migration } = opts
    const sourceEnv: any = {
      ...opts.sourceEnv,
    }
    const updatedSourceEnv = opts.updatedSourceEnv
      ? sourceParser.getDestinationEnv(opts.updatedSourceEnv) : {}
    const sourceMinionPoolId = opts?.updatedSourceEnv?.minion_pool_id
      || migration.origin_minion_pool_id
    if (sourceMinionPoolId) {
      payload.migration.origin_minion_pool_id = sourceMinionPoolId
    }
    payload.migration.source_environment = {
      ...sourceEnv,
      ...updatedSourceEnv,
    }

    const destEnv: any = {
      ...opts.destEnv,
    }
    const updatedDestEnv = opts.updatedDestEnv
      ? sourceParser.getDestinationEnv(opts.updatedDestEnv) : {}
    const destMinionPoolId = opts?.updatedDestEnv?.minion_pool_id
      || migration.destination_minion_pool_id
    if (destMinionPoolId) {
      payload.migration.destination_minion_pool_id = destMinionPoolId
    }

    const updatedDestEnvMappings = updatedDestEnv[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS] || {}
    const oldMappings = migration[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS] || {}
    const mergedMappings = { ...oldMappings, ...updatedDestEnvMappings }
    if (Object.keys(mergedMappings).length) {
      const newMappings: any = {}
      Object.keys(mergedMappings).forEach(k => {
        if (mergedMappings[k] !== null) {
          newMappings[k] = mergedMappings[k]
        }
      })
      payload.migration[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS] = newMappings
    }

    delete updatedDestEnv[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS]

    payload.migration.destination_environment = {
      ...destEnv,
      ...updatedDestEnv,
    }

    if (opts.uploadedScripts?.length || opts.removedScripts?.length || migration.user_scripts) {
      payload.migration.user_scripts = DefaultOptionsSchemaPlugin
        .getUserScripts(
          opts.uploadedScripts || [],
          opts.removedScripts || [],
          migration.user_scripts,
        )
    }

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/migrations`,
      method: 'POST',
      data: payload,
    })
    return response.data.migration
  }

  async cancel(migrationId: string, force?: boolean | null): Promise<string> {
    const data: any = { cancel: null }
    if (force) {
      data.cancel = { force: true }
    }
    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/migrations/${migrationId}/actions`,
      method: 'POST',
      data,
    })
    return migrationId
  }

  async delete(migrationId: string): Promise<string> {
    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/migrations/${migrationId}`,
      method: 'DELETE',
    })
    return migrationId
  }

  async migrateReplica(
    replicaId: string,
    options: Field[],
    uploadedUserScripts: InstanceScript[],
    removedUserScripts: InstanceScript[],
    userScriptData: UserScriptData | null | undefined,
    minionPoolMappings: { [instance: string]: string },
  ): Promise<MigrationItem> {
    const payload: any = {
      migration: {
        replica_id: replicaId,
      },
    }
    options.forEach(o => {
      payload.migration[o.name] = o.value || o.default || false
    })

    if (uploadedUserScripts.length || removedUserScripts.length || userScriptData) {
      payload.migration.user_scripts = DefaultOptionsSchemaPlugin
        .getUserScripts(uploadedUserScripts, removedUserScripts, userScriptData)
    }

    if (Object.keys(minionPoolMappings).length) {
      const newMappings: any = {}
      Object.keys(minionPoolMappings).forEach(k => {
        if (minionPoolMappings[k] !== null) {
          newMappings[k] = minionPoolMappings[k]
        }
      })
      payload.migration[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS] = newMappings
    } else {
      payload.migration[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS] = null
    }

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/migrations`,
      method: 'POST',
      data: payload,
    })
    return response.data.migration
  }
}

export default new MigrationSource()
