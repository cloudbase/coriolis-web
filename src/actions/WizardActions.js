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

import alt from '../alt'

import WizardSource from '../sources/WizardSource'

class WizardActions {
  updateData(data) {
    return data
  }

  toggleInstanceSelection(instance) {
    return instance
  }

  clearData() {
    return true
  }

  setCurrentPage(page) {
    return page
  }

  updateOptions({ field, value }) {
    return { field, value }
  }

  updateNetworks({ sourceNic, targetNetwork }) {
    return { sourceNic, targetNetwork }
  }

  addSchedule(schedule) {
    return schedule || true
  }

  updateSchedule(scheduleId, data) {
    return { scheduleId, data }
  }

  removeSchedule(scheduleId) {
    return scheduleId
  }

  create(type, data) {
    return {
      type,
      data,
      promise: WizardSource.create(type, data).then(
        item => { this.createSuccess(item) },
        response => { this.createFailed(response) }
      ),
    }
  }

  createSuccess(item) {
    return item
  }

  createFailed(reponse) {
    return reponse || true
  }

  createMultiple(type, data) {
    return {
      type,
      data,
      promise: WizardSource.createMultiple(type, data).then(
        items => { this.createMultipleSuccess(items) },
        response => { this.createMultipleFailed(response) }
      ),
    }
  }

  createMultipleSuccess(items) {
    return items
  }

  createMultipleFailed(response) {
    return response || true
  }

  setPermalink(data) {
    WizardSource.setPermalink(data)
    return data || true
  }

  getDataFromPermalink() {
    let data = WizardSource.getDataFromPermalink()
    return data || true
  }
}

export default alt.createActions(WizardActions)
