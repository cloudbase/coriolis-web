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

import { observable, action, runInAction } from 'mobx'

import type {
  UpdateData, MigrationItem, MigrationItemDetails, MigrationItemOptions,
} from '../@types/MainItem'
import type { Field } from '../@types/Field'
import type { Endpoint } from '../@types/Endpoint'
import type { InstanceScript } from '../@types/Instance'
import MigrationSource from '../sources/MigrationSource'

class MigrationStore {
  @observable migrations: MigrationItem[] = []

  @observable migrationDetails: MigrationItemDetails | null = null

  @observable loading: boolean = true

  @observable detailsLoading: boolean = true

  migrationsLoaded: boolean = false

  @action async getMigrations(options?: { showLoading?: boolean, skipLog?: boolean }) {
    if ((options && options.showLoading) || !this.migrationsLoaded) {
      this.loading = true
    }

    try {
      const migrations = await MigrationSource.getMigrations(options && options.skipLog)
      runInAction(() => {
        this.migrations = migrations
        this.loading = false
        this.migrationsLoaded = true
      })
    } catch (ex) {
      runInAction(() => { this.loading = false })
      throw ex
    }
  }

  getDefaultSkipOsMorphing(migration: MigrationItemDetails | null) {
    const tasks = migration && migration.tasks
    if (tasks && !tasks.find(t => t.task_type === 'OS_MORPHING')) {
      return true
    }
    return null
  }

  @action async recreateFullCopy(migration: MigrationItemOptions) {
    return MigrationSource.recreateFullCopy(migration)
  }

  @action async recreate(
    migration: MigrationItemDetails,
    sourceEndpoint: Endpoint,
    destEndpoint: Endpoint,
    updateData: UpdateData,
    defaultStorage: string | null | undefined,
    updatedDefaultStorage: string | null | undefined,
    replicationCount: number | null | undefined,
  ): Promise<MigrationItemDetails> {
    const migrationResult = await MigrationSource.recreate({
      sourceEndpoint,
      destEndpoint,
      migration,
      instanceNames: migration.instances,
      sourceEnv: migration.source_environment,
      updatedSourceEnv: updateData.source,
      destEnv: migration.destination_environment,
      updatedDestEnv: updateData.destination,
      storageMappings: migration.storage_mappings,
      updatedStorageMappings: updateData.storage,
      defaultStorage,
      updatedDefaultStorage,
      networkMappings: migration.network_map,
      updatedNetworkMappings: updateData.network,
      defaultSkipOsMorphing: this.getDefaultSkipOsMorphing(migration),
      replicationCount,
    })
    return migrationResult
  }

  @action async getMigration(
    migrationId: string, options?: { showLoading?: boolean, skipLog?: boolean },
  ) {
    if (options && options.showLoading) {
      this.detailsLoading = true
    }

    try {
      const migration = await MigrationSource.getMigration(migrationId, options && options.skipLog)
      runInAction(() => {
        this.migrationDetails = migration
        this.migrations = this.migrations.map(m => (m.id === migration.id ? migration : m))
      })
    } finally {
      runInAction(() => { this.detailsLoading = false })
    }
  }

  @action async cancel(migrationId: string, force?: boolean | null) {
    await MigrationSource.cancel(migrationId, force)
  }

  @action async delete(migrationId: string) {
    await MigrationSource.delete(migrationId)
    runInAction(() => { this.migrations = this.migrations.filter(r => r.id !== migrationId) })
  }

  @action async migrateReplica(
    replicaId: string,
    options: Field[],
    userScripts: InstanceScript[],
    minionPoolMappings: { [instance: string]: string },
  ) {
    const migration = await MigrationSource.migrateReplica(
      replicaId,
      options,
      userScripts,
      minionPoolMappings,
    )
    runInAction(() => {
      this.migrations = [
        migration,
        ...this.migrations,
      ]
    })
    return migration
  }

  @action clearDetails() {
    this.detailsLoading = true
    this.migrationDetails = null
  }
}

export default new MigrationStore()
