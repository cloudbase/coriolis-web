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

import AssessmentSource from '../sources/AssessmentSource'
import type { Endpoint } from '../types/Endpoint'
import type { Assessment, MigrationInfo } from '../types/Assessment'
import type { MainItem } from '../types/MainItem'

class AssessmentStore {
  @observable selectedEndpoint: ?Endpoint = null
  @observable selectedResourceGroup: ?$PropertyType<Assessment, 'group'> = null
  @observable migrating: boolean = false
  @observable migrations: MainItem[] = []

  @action updateSelectedEndpoint(endpoint: Endpoint) {
    this.selectedEndpoint = endpoint
  }

  @action updateSelectedResourceGroup(resourceGroup: ?$PropertyType<Assessment, 'group'>) {
    this.selectedResourceGroup = resourceGroup
  }

  @action migrate(data: MigrationInfo): Promise<void> {
    if (!data.options) {
      return Promise.resolve()
    }

    this.migrating = true
    this.migrations = []
    let seperateVmField = data.options.find(o => o.name === 'separate_vm')
    let separateVm = seperateVmField ? seperateVmField.value : ''

    if (separateVm) {
      return AssessmentSource.migrateMultiple(data).then((items: MainItem[]) => {
        this.migrating = false
        this.migrations = items
      }).catch(() => {
        this.migrating = false
      })
    }

    return AssessmentSource.migrate(data).then((item: MainItem) => {
      this.migrating = false
      this.migrations = [item]
    }).catch(() => {
      this.migrating = false
    })
  }

  @action clearSelection() {
    this.selectedEndpoint = null
    this.selectedResourceGroup = null
  }
}

export default new AssessmentStore()
