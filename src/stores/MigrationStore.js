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

import type { MainItem } from '../types/MainItem'
import type { Field } from '../types/Field'
import notificationStore from '../stores/NotificationStore'
import MigrationSource from '../sources/MigrationSource'

class MigrationStore {
  @observable migrations: MainItem[] = []
  @observable migrationDetails: ?MainItem = null
  @observable loading: boolean = true
  @observable canceling: boolean | { failed: boolean } = true
  @observable detailsLoading: boolean = true

  migrationsLoaded: boolean = false

  @action getMigrations(options?: { showLoading: boolean }) {
    if ((options && options.showLoading) || !this.migrationsLoaded) {
      this.loading = true
    }

    return MigrationSource.getMigrations().then(migrations => {
      this.migrations = migrations.map(migration => {
        let oldMigration = this.migrations.find(r => r.id === migration.id)
        if (oldMigration) {
          migration.executions = oldMigration.executions
        }

        return migration
      })
      this.loading = false
      this.migrationsLoaded = true
    }).catch(() => {
      this.loading = false
    })
  }

  @action getMigration(migrationId: string, showLoading: boolean) {
    this.detailsLoading = showLoading

    return MigrationSource.getMigration(migrationId).then(migration => {
      this.detailsLoading = false
      this.migrationDetails = migration
    }).catch(() => {
      this.detailsLoading = false
    })
  }

  @action cancel(migrationId: string) {
    this.canceling = true
    return MigrationSource.cancel(migrationId).then(() => {
      this.canceling = false
    }).catch(() => {
      this.canceling = { failed: true }
    })
  }

  @action delete(migrationId: string) {
    return MigrationSource.delete(migrationId).then(() => {
      this.migrations = this.migrations.filter(r => r.id !== migrationId)
    })
  }

  @action migrateReplica(replicaId: string, options: Field[]) {
    return MigrationSource.migrateReplica(replicaId, options).then(migration => {
      this.migrations = [
        migration,
        ...this.migrations,
      ]

      notificationStore.alert('Migration successfully created from replica.', 'success', {
        action: {
          label: 'View Migration Status',
          callback: () => {
            window.location.href = `/#/migration/tasks/${migration.id}`
          },
        },
      })
    })
  }

  @action clearDetails() {
    this.detailsLoading = true
  }
}

export default new MigrationStore()
