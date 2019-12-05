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

import { observable, action, runInAction } from 'mobx'

import type { WizardData, WizardPage } from '../types/WizardData'
import type { MainItem } from '../types/MainItem'
import type { Instance } from '../types/Instance'
import type { Field } from '../types/Field'
import type { NetworkMap } from '../types/Network'
import type { StorageMap } from '../types/Endpoint'
import type { Schedule } from '../types/Schedule'
import { wizardPages } from '../constants'
import source from '../sources/WizardSource'

const updateOptions = (oldOptions: ?{ [string]: mixed }, data: { field: Field, value: any }) => {
  let options = { ...oldOptions }
  if (data.field.type === 'array') {
    let oldValues: string[] = options[data.field.name] || []
    if (oldValues.find(v => v === data.value)) {
      options[data.field.name] = oldValues.filter(v => v !== data.value)
    } else {
      options[data.field.name] = [...oldValues, data.value]
    }
  } else {
    options[data.field.name] = data.value
  }

  if (data.field.enum && data.field.subFields) {
    data.field.subFields.forEach(subField => {
      let subFieldKeys = Object.keys(options).filter(k => k.indexOf(`${subField.name}/`) > -1)
      subFieldKeys.forEach(k => {
        delete options[k]
      })
    })
  }

  return options
}

class WizardStore {
  @observable data: WizardData = {}
  @observable schedules: Schedule[] = []
  @observable storageMap: StorageMap[] = []
  @observable currentPage: WizardPage = wizardPages[0]
  @observable createdItem: ?MainItem = null
  @observable creatingItem: boolean = false
  @observable createdItems: ?MainItem[] = null
  @observable creatingItems: boolean = false

  @action updateData(data: WizardData) {
    this.data = { ...this.data, ...data }
  }

  @action toggleInstanceSelection(instance: Instance) {
    if (!this.data.selectedInstances) {
      this.data.selectedInstances = [instance]
      return
    }

    if (this.data.selectedInstances.find(i => i.id === instance.id)) {
      // $FlowIssue
      this.data.selectedInstances = this.data.selectedInstances.filter(i => i.id !== instance.id)
    } else {
      // $FlowIssue
      this.data.selectedInstances = [...this.data.selectedInstances, instance]
    }
  }

  @action clearData() {
    this.data = {}
    this.currentPage = wizardPages[0]
  }

  @action setCurrentPage(page: WizardPage) {
    this.currentPage = page
  }

  @action updateSourceOptions(data: { field: Field, value: any }) {
    this.data = { ...this.data }
    this.data.sourceOptions = updateOptions(this.data.sourceOptions, data)
  }

  @action updateDestOptions(data: { field: Field, value: any }) {
    this.data = { ...this.data }
    this.data.destOptions = updateOptions(this.data.destOptions, data)
  }

  @action updateNetworks(network: NetworkMap) {
    if (!this.data.networks) {
      this.data.networks = []
    }

    this.data.networks = this.data.networks.filter(n => n.sourceNic.network_name !== network.sourceNic.network_name)
    this.data.networks.push(network)
  }

  @action updateStorage(storage: StorageMap) {
    let diskFieldName = storage.type === 'backend' ? 'storage_backend_identifier' : 'id'
    this.storageMap = this.storageMap
      .filter(n => n.type !== storage.type || String(n.source[diskFieldName]) !== String(storage.source[diskFieldName]))
    this.storageMap.push(storage)
  }

  @action clearStorageMap() {
    this.storageMap = []
  }

  @action addSchedule(schedule: Schedule) {
    this.schedules.push({ id: new Date().getTime().toString(), schedule: schedule.schedule })
  }

  @action updateSchedule(scheduleId: string, data: Schedule) {
    this.schedules = this.schedules.map(schedule => {
      if (schedule.id !== scheduleId) {
        return schedule
      }
      if (data.schedule) {
        schedule.schedule = {
          ...schedule.schedule,
          ...data.schedule,
        }
      } else {
        schedule = {
          ...schedule,
          ...data,
        }
      }
      return schedule
    })
  }

  @action removeSchedule(scheduleId: string) {
    this.schedules = this.schedules.filter(s => s.id !== scheduleId)
  }

  @action async create(type: string, data: WizardData, storageMap: StorageMap[]): Promise<void> {
    this.creatingItem = true

    try {
      let item: MainItem = await source.create(type, data, storageMap)
      runInAction(() => { this.createdItem = item })
    } catch (err) {
      throw err
    } finally {
      runInAction(() => { this.creatingItem = false })
    }
  }

  @action async createMultiple(type: string, data: WizardData, storageMap: StorageMap[]): Promise<void> {
    this.creatingItems = true

    try {
      let items: MainItem[] = await source.createMultiple(type, data, storageMap)
      runInAction(() => { this.createdItems = items })
    } finally {
      runInAction(() => { this.creatingItems = false })
    }
  }

  updateUrlState() {
    source.setUrlState({ data: this.data, schedules: this.schedules, storageMap: this.storageMap })
  }

  @action getUrlState() {
    let state = source.getUrlState()
    if (!state) {
      return
    }
    this.data = state.data
    this.schedules = state.schedules
    this.storageMap = state.storageMap
  }
}

export default new WizardStore()
