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

import { observable, action } from "mobx";

import AssessmentSource from "@src/sources/AssessmentSource";
import type { Endpoint } from "@src/@types/Endpoint";
import type { Assessment, MigrationInfo } from "@src/@types/Assessment";
import { MigrationItem } from "@src/@types/MainItem";

class AssessmentStore {
  @observable selectedEndpoint: Endpoint | null = null;

  @observable selectedResourceGroup: Assessment["group"] | null = null;

  @observable migrating = false;

  @observable migrations: MigrationItem[] = [];

  @action updateSelectedEndpoint(endpoint: Endpoint) {
    this.selectedEndpoint = endpoint;
  }

  @action updateSelectedResourceGroup(
    resourceGroup: Assessment["group"] | null
  ) {
    this.selectedResourceGroup = resourceGroup;
  }

  @action async migrate(data: MigrationInfo): Promise<void> {
    this.migrating = true;
    this.migrations = [];
    const separateVm = data.fieldValues.separate_vm;

    if (separateVm) {
      try {
        const items = await AssessmentSource.migrateMultiple(data);
        this.migrating = false;
        this.migrations = items;
      } catch (e) {
        this.migrating = false;
      }
    }

    try {
      const item = await AssessmentSource.migrate(data);
      this.migrating = false;
      this.migrations = [item];
    } catch (e) {
      this.migrating = false;
    }
  }

  @action clearSelection() {
    this.selectedEndpoint = null;
    this.selectedResourceGroup = null;
  }
}

export default new AssessmentStore();
