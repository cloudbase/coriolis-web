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

import type { WizardData, WizardPage } from '../@types/WizardData'
import type { Instance, InstanceScript } from '../@types/Instance'
import type { Field } from '../@types/Field'
import type { NetworkMap } from '../@types/Network'
import type { StorageMap } from '../@types/Endpoint'
import type { Schedule } from '../@types/Schedule'
import { wizardPages } from '../constants'
import source from '../sources/WizardSource'
import notificationStore from './NotificationStore'
import { TransferItem } from '../@types/MainItem'

const updateOptions = (
  oldOptions: { [prop: string]: any } | null | undefined,
  data: { field: Field, value: any, parentFieldName: string | undefined },
) => {
  const options: any = oldOptions ? { ...oldOptions } : {}
  if (data.field.type === 'array') {
    const oldValues: string[] = options[data.field.name] || []
    if (oldValues.find(v => v === data.value)) {
      options[data.field.name] = oldValues.filter(v => v !== data.value)
    } else {
      options[data.field.name] = [...oldValues, data.value]
    }
  } else if (data.field.groupName) {
    if (!options[data.field.groupName]) {
      options[data.field.groupName] = {}
    }
    options[data.field.groupName][data.field.name] = data.value
  } else if (data.parentFieldName) {
    if (!options[data.parentFieldName]) {
      options[data.parentFieldName] = {}
    }
    options[data.parentFieldName][data.field.name] = data.value
  } else {
    options[data.field.name] = data.value
  }

  if (data.field.subFields) {
    data.field.subFields.forEach(subField => {
      const subFieldKeys = Object.keys(options).filter(k => k.indexOf(subField.name) > -1)
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

  @observable defaultStorage: string | null = null

  @observable storageMap: StorageMap[] = []

  @observable currentPage: WizardPage = wizardPages[0]

  @observable createdItem: TransferItem | null = null

  @observable creatingItem: boolean = false

  @observable createdItems: Array<TransferItem | null> | null = null

  @observable creatingItems: boolean = false

  @observable uploadedUserScripts: InstanceScript[] = []

  @action updateData(data: WizardData) {
    this.data = { ...this.data, ...data }
  }

  @action fillWithDefaultValues(direction: 'source' | 'destination', schema: Field[]) {
    const data: { [prop: string]: any } = (direction === 'source' ? this.data.sourceOptions : this.data.destOptions) || {}

    schema.forEach(field => {
      if (data[field.name] !== undefined) {
        return
      }
      const fieldDefault = field.default
      if (fieldDefault == null) {
        return
      }
      if (field.enum) {
        const isDefaultInEnum = field.enum.find(item => {
          const enumItem: any = item
          if (fieldDefault.id != null) {
            return enumItem.id != null
              ? enumItem.id === fieldDefault.id : enumItem === fieldDefault.id
          }
          return enumItem.id != null
            ? (enumItem.id === fieldDefault || enumItem.name === fieldDefault)
            : enumItem === fieldDefault
        })

        // Don't use the default if it can't be found in the enum list.
        if (isDefaultInEnum) {
          data[field.name] = field.default
        }
      } else {
        data[field.name] = field.default
      }
    })

    if (direction === 'source') {
      this.data.sourceOptions = data
    } else {
      this.data.destOptions = data
    }
  }

  @action toggleInstanceSelection(instance: Instance) {
    if (!this.data.selectedInstances) {
      this.data.selectedInstances = [instance]
      return
    }

    if (this.data.selectedInstances.find(i => i.id === instance.id)) {
      this.data.selectedInstances = this.data.selectedInstances.filter(i => i.id !== instance.id)
    } else {
      this.data.selectedInstances = [...this.data.selectedInstances, instance]
    }
  }

  @action clearData() {
    this.data = {}
    this.currentPage = wizardPages[0]
    this.clearStorageMap()
  }

  @action setCurrentPage(page: WizardPage) {
    this.currentPage = page
  }

  @action updateSourceOptions(data: {
    field: Field,
    value: any
    parentFieldName: string | undefined
  }) {
    this.data = { ...this.data }
    this.data.sourceOptions = updateOptions(this.data.sourceOptions, data)
  }

  @action updateDestOptionsRaw(fieldName: string, fieldValue: any) {
    const currentData = { ...this.data }
    const currentDestOptions: any = { ...currentData.destOptions }
    currentDestOptions[fieldName] = fieldValue
    currentData.destOptions = currentDestOptions
    this.data = currentData
  }

  @action updateDestOptions(data: {
    field: Field,
    value: any,
    parentFieldName: string | undefined
  }) {
    this.data = { ...this.data }
    this.data.destOptions = updateOptions(this.data.destOptions, data)
  }

  @action updateNetworks(network: NetworkMap) {
    if (!this.data.networks) {
      this.data.networks = []
    }

    this.data.networks = this.data.networks
      .filter(n => n.sourceNic.network_name !== network.sourceNic.network_name)
    this.data.networks.push(network)
  }

  @action updateDefaultStorage(value: string | null) {
    this.defaultStorage = value
  }

  @action updateStorage(storage: StorageMap) {
    const diskFieldName = storage.type === 'backend' ? 'storage_backend_identifier' : 'id'
    this.storageMap = this.storageMap
      .filter(n => n.type !== storage.type
        || String(n.source[diskFieldName]) !== String(storage.source[diskFieldName]))
    this.storageMap.push(storage)
  }

  @action clearStorageMap() {
    this.storageMap = []
    this.defaultStorage = null
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
        // eslint-disable-next-line no-param-reassign
        schedule.schedule = {
          ...schedule.schedule,
          ...data.schedule,
        }
      } else {
        // eslint-disable-next-line no-param-reassign
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

  @action async create(
    type: string,
    data: WizardData,
    defaultStorage: string | null,
    storageMap: StorageMap[],
    uploadedUserScripts: InstanceScript[],
  ): Promise<void> {
    this.creatingItem = true

    try {
      const item: TransferItem = await source.create(
        type, data, defaultStorage, storageMap, uploadedUserScripts,
      )
      runInAction(() => { this.createdItem = item })
    } finally {
      runInAction(() => { this.creatingItem = false })
    }
  }

  @action async createMultiple(
    type: string,
    data: WizardData,
    defaultStorage: string | null,
    storageMap: StorageMap[],
    uploadedUserScripts: InstanceScript[],
  ): Promise<boolean> {
    this.creatingItems = true

    try {
      const items = await source.createMultiple(
        type, data, defaultStorage, storageMap, uploadedUserScripts,
      )
      const nullItemsCount = items.filter(i => i === null).length
      if (items && nullItemsCount === 0) {
        runInAction(() => { this.createdItems = items })
        return true
      }
      let errorMessage: any = null
      let alertOptions = null
      if (!items || nullItemsCount === items.length) {
        errorMessage = `No ${type}s could be created`
      } else {
        errorMessage = `Some ${type}s couldn't be created.`
        alertOptions = {
          action: {
            label: 'View details',
            callback: () => ({
              request: {
                url: '[MULTIPLE]',
                method: 'POST',
                message: `Error creating some ${type}s`,
                data: {
                  created: items.filter(Boolean).length,
                  failed: nullItemsCount,
                },
              },
              error: { message: errorMessage },
            }),
          },
        }
      }
      notificationStore.alert(errorMessage, 'error', alertOptions)
      return false
    } finally {
      runInAction(() => { this.creatingItems = false })
    }
  }

  updateUrlState() {
    source.setUrlState({
      data: this.data,
      schedules: this.schedules,
      storageMap: this.storageMap,
      defaultStorage: this.defaultStorage,
    })
  }

  @action getUrlState() {
    const state = source.getUrlState()
    if (!state) {
      return
    }
    this.data = state.data
    this.schedules = state.schedules
    this.storageMap = state.storageMap
    this.defaultStorage = state.defaultStorage
  }

  @action cancelUploadedScript(global: string | null, instanceName: string | null) {
    this.uploadedUserScripts = this.uploadedUserScripts
      .filter(s => (global ? s.global !== global : s.instanceId !== instanceName))
  }

  @action uploadUserScript(instanceScript: InstanceScript) {
    this.uploadedUserScripts = [
      ...this.uploadedUserScripts,
      instanceScript,
    ]
  }

  @action clearUploadedUserScripts() {
    this.uploadedUserScripts = []
  }
}

export default new WizardStore()
