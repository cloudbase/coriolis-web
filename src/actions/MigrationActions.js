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

import MigrationSource from '../sources/MigrationSource'

class MigrationActions {
  getMigrations(options) {
    return {
      ...options,
      promise: MigrationSource.getMigrations().then(
        response => { this.getMigrationsSuccess(response) },
        response => { this.getMigrationsFailed(response) },
      ),
    }
  }

  getMigrationsSuccess(migrations) {
    return migrations || true
  }

  getMigrationsFailed(response) {
    return response || true
  }

  getMigration(migrationId, showLoading) {
    MigrationSource.getMigration(migrationId).then(
      migration => { this.getMigrationSuccess(migration) },
      response => { this.getMigrationFailed(response) },
    )

    return { migrationId, showLoading }
  }

  getMigrationSuccess(migration) {
    return migration
  }

  getMigrationFailed(response) {
    return response || true
  }

  cancel(migrationId) {
    return {
      migrationId,
      promise: MigrationSource.cancel(migrationId).then(
        () => { this.cancelSuccess(migrationId) },
        response => { this.cancelFailed(response) },
      ),
    }
  }

  cancelSuccess(migrationId) {
    return { migrationId }
  }

  cancelFailed(response) {
    return response || true
  }

  delete(migrationId) {
    MigrationSource.delete(migrationId).then(
      () => { this.deleteSuccess(migrationId) },
      response => { this.deleteFailed(response) },
    )
    return migrationId
  }

  deleteSuccess(migrationId) {
    return migrationId
  }

  deleteFailed(response) {
    return response || true
  }

  migrateReplica(replicaId, options) {
    MigrationSource.migrateReplica(replicaId, options).then(
      migration => { this.migrateReplicaSuccess(migration) },
      response => { this.migrateReplicaFailed(response) },
    )

    return { replicaId, options }
  }

  migrateReplicaSuccess(migration) {
    return migration
  }

  migrateReplicaFailed(response) {
    return response || true
  }

  clearDetails() {
    return true
  }
}

export default alt.createActions(MigrationActions)
