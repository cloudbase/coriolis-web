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

import { observable, action, runInAction } from "mobx";

import type {
  UpdateData,
  MigrationItem,
  MigrationItemDetails,
  MigrationItemOptions,
  UserScriptData,
} from "@src/@types/MainItem";
import type { Field } from "@src/@types/Field";
import type { Endpoint } from "@src/@types/Endpoint";
import type { InstanceScript } from "@src/@types/Instance";
import MigrationSource from "@src/sources/MigrationSource";
import apiCaller from "@src/utils/ApiCaller";

class MigrationStore {
  @observable migrations: MigrationItem[] = [];

  @observable migrationDetails: MigrationItemDetails | null = null;

  @observable loading = true;

  @observable detailsLoading = true;

  migrationsLoaded = false;

  @action async getMigrations(options?: {
    showLoading?: boolean;
    skipLog?: boolean;
  }) {
    if ((options && options.showLoading) || !this.migrationsLoaded) {
      this.loading = true;
    }

    try {
      const migrations = await MigrationSource.getMigrations(
        options && options.skipLog
      );
      runInAction(() => {
        this.migrations = migrations;
        this.loading = false;
        this.migrationsLoaded = true;
      });
    } catch (ex) {
      runInAction(() => {
        this.loading = false;
      });
      throw ex;
    }
  }

  getDefaultSkipOsMorphing(migration: MigrationItemDetails | null) {
    const tasks = migration && migration.tasks;
    if (tasks && !tasks.find(t => t.task_type === "OS_MORPHING")) {
      return true;
    }
    return null;
  }

  @action async recreateFullCopy(migration: MigrationItemOptions) {
    return MigrationSource.recreateFullCopy(migration);
  }

  @action async recreate(opts: {
    migration: MigrationItemDetails;
    sourceEndpoint: Endpoint;
    destEndpoint: Endpoint;
    updateData: UpdateData;
    defaultStorage: { value: string | null; busType?: string | null };
    updatedDefaultStorage:
      | { value: string | null; busType?: string | null }
      | undefined;
    replicationCount: number | null | undefined;
  }): Promise<MigrationItemDetails> {
    const {
      migration,
      sourceEndpoint,
      destEndpoint,
      updateData,
      defaultStorage,
      updatedDefaultStorage,
      replicationCount,
    } = opts;
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
      uploadedScripts: updateData.uploadedScripts,
      removedScripts: updateData.removedScripts,
    });
    return migrationResult;
  }

  @action async getMigration(
    migrationId: string,
    options?: { showLoading?: boolean; skipLog?: boolean }
  ) {
    if (options && options.showLoading) {
      this.detailsLoading = true;
    }

    try {
      const migration = await MigrationSource.getMigration(
        migrationId,
        options && options.skipLog
      );
      runInAction(() => {
        this.migrationDetails = migration;
        this.migrations = this.migrations.map(m =>
          m.id === migration.id ? migration : m
        );
      });
    } finally {
      runInAction(() => {
        this.detailsLoading = false;
      });
    }
  }

  @action async cancel(migrationId: string, force?: boolean | null) {
    await MigrationSource.cancel(migrationId, force);
  }

  @action async delete(migrationId: string) {
    await MigrationSource.delete(migrationId);
    runInAction(() => {
      this.migrations = this.migrations.filter(r => r.id !== migrationId);
    });
  }

  @action async migrateReplica(opts: {
    replicaId: string;
    fields: Field[];
    uploadedUserScripts: InstanceScript[];
    removedUserScripts: InstanceScript[];
    userScriptData: UserScriptData | null | undefined;
    minionPoolMappings: { [instance: string]: string };
  }) {
    const {
      replicaId,
      fields: options,
      uploadedUserScripts,
      removedUserScripts,
      userScriptData,
      minionPoolMappings,
    } = opts;
    const migration = await MigrationSource.migrateReplica({
      replicaId,
      options,
      uploadedUserScripts,
      removedUserScripts,
      userScriptData,
      minionPoolMappings,
    });
    runInAction(() => {
      this.migrations = [migration, ...this.migrations];
    });
    return migration;
  }

  @action cancelMigrationDetails() {
    if (this.migrationDetails) {
      apiCaller.cancelRequests(this.migrationDetails.id);
    }
    this.detailsLoading = false;
  }

  @action clearDetails() {
    this.detailsLoading = true;
    this.migrationDetails = null;
  }
}

export default new MigrationStore();
