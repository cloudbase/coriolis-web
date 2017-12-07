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

import alt from '../alt'
import MigrationActions from '../actions/MigrationActions'
import NotificationActions from '../actions/NotificationActions'

class MigrationStore {
  constructor() {
    this.migrations = []
    this.migrationDetails = {}
    this.loading = true
    this.canceling = true
    this.detailsLoading = true

    this.bindListeners({
      handleGetMigrations: MigrationActions.GET_MIGRATIONS,
      handleGetMigrationsSuccess: MigrationActions.GET_MIGRATIONS_SUCCESS,
      handleGetMigrationsFailed: MigrationActions.GET_MIGRATIONS_FAILED,
      handleGetMigration: MigrationActions.GET_MIGRATION,
      handleGetMigrationSuccess: MigrationActions.GET_MIGRATION_SUCCESS,
      handleGetMigrationFailed: MigrationActions.GET_MIGRATION_FAILED,
      handleDeleteSuccess: MigrationActions.DELETE_SUCCESS,
      handleMigrateReplicaSuccess: MigrationActions.MIGRATE_REPLICA_SUCCESS,
      handleCancel: MigrationActions.CANCEL,
      handleCancelSuccess: MigrationActions.CANCEL_SUCCESS,
      handleCancelFailed: MigrationActions.CANCEL_FAILED,
      handleClearDetails: MigrationActions.CLEAR_DETAILS,
    })
  }

  handleGetMigrations({ showLoading }) {
    if (showLoading || this.migrations.length === 0) {
      this.loading = true
    }
  }

  handleGetMigrationsSuccess(migrations) {
    this.migrations = migrations.map(migration => {
      let oldMigration = this.migrations.find(r => r.id === migration.id)
      if (oldMigration) {
        migration.executions = oldMigration.executions
      }

      return migration
    })
    this.loading = false
  }

  handleGetMigrationsFailed() {
    this.loading = false
  }

  handleGetMigration({ showLoading }) {
    this.detailsLoading = showLoading
  }

  handleGetMigrationSuccess(migration) {
    this.detailsLoading = false
    this.migrationDetails = migration
  }

  handleGetMigrationFailed() {
    this.detailsLoading = false
  }

  handleDeleteSuccess(migrationId) {
    this.migrations = this.migrations.filter(r => r.id !== migrationId)
  }

  handleMigrateReplicaSuccess(migration) {
    this.migrations = [
      migration,
      ...this.migrations,
    ]

    setTimeout(() => {
      NotificationActions.notify('Migration successfully created from replica.', 'success', {
        action: {
          label: 'View Migration Status',
          callback: () => {
            window.location.href = `/#/migration/tasks/${migration.id}`
          },
        },
        persist: true,
        persistInfo: { title: 'Migration created' },
      })
    }, 0)
  }

  handleCancel() {
    this.canceling = true
  }

  handleCancelSuccess() {
    this.canceling = false
  }

  handleCancelFailed() {
    this.canceling = { failed: true }
  }

  handleClearDetails() {
    this.detailsLoading = true
  }
}

export default alt.createStore(MigrationStore)
