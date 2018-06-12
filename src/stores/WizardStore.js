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

import type { WizardData, WizardPage } from '../types/WizardData'
import type { MainItem } from '../types/MainItem'
import type { Instance } from '../types/Instance'
import type { Field } from '../types/Field'
import type { NetworkMap } from '../types/Network'
import type { Schedule } from '../types/Schedule'
import { wizardConfig } from '../config'
import Source from '../sources/WizardSource'

class WizardStore {
  @observable data: WizardData = { schedules: [] }
  @observable currentPage: WizardPage = wizardConfig.pages[0]
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
    this.currentPage = wizardConfig.pages[0]
  }

  @action setCurrentPage(page: WizardPage) {
    this.currentPage = page
  }

  @action updateOptions(data: { field: Field, value: any }) {
    this.data.options = {
      ...this.data.options,
    }
    if (data.field.type === 'array') {
      let oldValues: string[] = this.data.options[data.field.name] || []
      if (oldValues.find(v => v === data.value)) {
        // $FlowIssue
        this.data.options[data.field.name] = oldValues.filter(v => v !== data.value)
      } else {
        // $FlowIssue
        this.data.options[data.field.name] = [...oldValues, data.value]
      }
    } else {
      this.data.options[data.field.name] = data.value
    }
  }

  @action updateNetworks(network: NetworkMap) {
    if (!this.data.networks) {
      this.data.networks = []
    }

    this.data.networks = this.data.networks.filter(n => n.sourceNic.network_name !== network.sourceNic.network_name)
    this.data.networks.push(network)
  }

  @action addSchedule(schedule: Schedule) {
    if (!this.data.schedules) {
      this.data.schedules = []
    }
    this.data.schedules.push({ id: new Date().getTime().toString(), schedule: schedule.schedule })
  }

  @action updateSchedule(scheduleId: string, data: Schedule) {
    if (!this.data.schedules) {
      return
    }
    this.data.schedules = this.data.schedules.map(schedule => {
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
    if (!this.data.schedules) {
      return
    }
    this.data.schedules = this.data.schedules.filter(s => s.id !== scheduleId)
  }

  @action create(type: string, data: WizardData): Promise<void> {
    this.creatingItem = true

    return Source.create(type, data).then((item: MainItem) => {
      this.createdItem = item
      this.creatingItem = false
    }).catch(() => {
      this.creatingItem = false
    })
  }

  @action createMultiple(type: string, data: WizardData): Promise<void> {
    this.creatingItems = true

    return Source.createMultiple(type, data).then((items: MainItem[]) => {
      this.createdItems = items
      this.creatingItems = false
    }).catch(() => {
      this.creatingItems = false
    })
  }

  @action setPermalink(data: WizardData) {
    Source.setPermalink(data)
  }

  @action getDataFromPermalink() {
    let data = Source.getDataFromPermalink()
    if (!data) {
      return
    }

    this.data = {
      ...this.data,
      ...data,
    }
  }
}

export default new WizardStore()
