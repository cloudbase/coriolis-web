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
import WizardActions from '../actions/WizardActions'

import { wizardConfig } from '../config'

class WizardStore {
  constructor() {
    this.data = {}
    this.currentPage = wizardConfig.pages[0]
    this.createdItem = null
    this.creatingItem = false
    this.createdItems = null
    this.creatingItems = false

    this.bindListeners({
      handleUpdateData: WizardActions.UPDATE_DATA,
      handleClearData: WizardActions.CLEAR_DATA,
      handleSetCurrentPage: WizardActions.SET_CURRENT_PAGE,
      handleToggleInstanceSelection: WizardActions.TOGGLE_INSTANCE_SELECTION,
      handleUpdateOptions: WizardActions.UPDATE_OPTIONS,
      handleUpdateNetworks: WizardActions.UPDATE_NETWORKS,
      handleAddSchedule: WizardActions.ADD_SCHEDULE,
      handleUpdateSchedule: WizardActions.UPDATE_SCHEDULE,
      handleRemoveSchedule: WizardActions.REMOVE_SCHEDULE,
      handleCreate: WizardActions.CREATE,
      handleCreateSuccess: WizardActions.CREATE_SUCCESS,
      handleCreateFailed: WizardActions.CREATE_FAILED,
      handleCreateMultiple: WizardActions.CREATE_MULTIPLE,
      handleCreateMultipleSuccess: WizardActions.CREATE_MULTIPLE_SUCCESS,
      handleCreateMultipleFailed: WizardActions.CREATE_MULTIPLE_FAILED,
      handleGetDataFromPermalink: WizardActions.GET_DATA_FROM_PERMALINK,
    })
  }

  handleUpdateData(data) {
    this.data = {
      ...this.data,
      ...data,
    }
  }

  handleClearData() {
    this.data = {}
    this.currentPage = wizardConfig.pages[0]
  }

  handleSetCurrentPage(page) {
    this.currentPage = page
  }

  handleToggleInstanceSelection(instance) {
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

  handleUpdateOptions({ field, value }) {
    this.data.options = {
      ...this.data.options,
    }
    this.data.options[field.name] = value
  }

  handleUpdateNetworks({ sourceNic, targetNetwork }) {
    if (!this.data.networks) {
      this.data.networks = []
    }

    this.data.networks = this.data.networks.filter(n => n.sourceNic.network_name !== sourceNic.network_name)
    this.data.networks.push({ sourceNic, targetNetwork })
  }

  handleAddSchedule(schedule) {
    if (!this.data.schedules) {
      this.data.schedules = []
    }
    this.data.schedules.push({ id: new Date().getTime(), schedule: schedule.schedule })
  }

  handleUpdateSchedule({ scheduleId, data }) {
    let schedule = this.data.schedules.find(s => s.id === scheduleId)
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

    this.data.schedules = this.data.schedules.filter(s => s.id !== scheduleId)
    this.data.schedules.push(schedule)
    this.data.schedules.sort((a, b) => a.id > b.id)
  }

  handleRemoveSchedule(scheduleId) {
    this.data.schedules = this.data.schedules.filter(s => s.id !== scheduleId)
  }

  handleCreate() {
    this.creatingItem = true
  }

  handleCreateSuccess(item) {
    this.createdItem = item
    this.creatingItem = false
  }

  handleCreateFailed() {
    this.creatingItem = false
  }

  handleCreateMultiple() {
    this.creatingItems = true
  }

  handleCreateMultipleSuccess(items) {
    this.createdItems = items
    this.creatingItems = false
  }

  handleCreateMultipleFailed() {
    this.creatingItems = false
  }

  handleGetDataFromPermalink(data) {
    if (data === true) {
      return
    }

    this.data = {
      ...this.data,
      ...data,
    }
  }
}

export default alt.createStore(WizardStore)
