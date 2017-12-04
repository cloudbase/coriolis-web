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
import ScheduleActions from '../actions/ScheduleActions'

class ScheduleStore {
  constructor() {
    this.loading = false
    this.schedules = []
    this.scheduling = false
    this.adding = false

    this.bindListeners({
      handleScheduleMultiple: ScheduleActions.SCHEDULE_MULTIPLE,
      handleScheduleMultipleSuccess: ScheduleActions.SCHEDULE_MULTIPLE_SUCCESS,
      handleScheduleMultipleFailed: ScheduleActions.SCHEDULE_MULTIPLE_FAILED,
      handleGetSchedules: ScheduleActions.GET_SCHEDULES,
      handleGetSchedulesSuccess: ScheduleActions.GET_SCHEDULES_SUCCESS,
      handleGetSchedulesFailed: ScheduleActions.GET_SCHEDULES_FAILED,
      handleAddSchedule: ScheduleActions.ADD_SCHEDULE,
      handleAddScheduleSuccess: ScheduleActions.ADD_SCHEDULE_SUCCESS,
      handleAddScheduleFailed: ScheduleActions.ADD_SCHEDULE_FAILED,
      handleRemoveSchedule: ScheduleActions.REMOVE_SCHEDULE,
      handleUpdateSchedule: ScheduleActions.UPDATE_SCHEDULE,
      handleUpdateScheduleSuccess: ScheduleActions.UPDATE_SCHEDULE_SUCCESS,
    })
  }

  handleScheduleMultiple() {
    this.scheduling = true
  }

  handleScheduleMultipleSuccess() {
    this.scheduling = false
  }

  handleScheduleMultipleFailed() {
    this.scheduling = false
  }

  handleGetSchedules() {
    this.loading = true
  }

  handleGetSchedulesSuccess(schedules) {
    this.loading = false
    this.schedules = schedules
  }

  handleGetSchedulesFailed() {
    this.loading = false
  }

  handleAddSchedule() {
    this.adding = true
  }

  handleAddScheduleSuccess(schedule) {
    this.adding = false
    this.schedules = [...this.schedules, schedule]
  }

  handleAddScheduleFailed() {
    this.adding = false
  }

  handleRemoveSchedule({ scheduleId }) {
    this.schedules = this.schedules.filter(s => s.id !== scheduleId)
  }

  handleUpdateSchedule({ scheduleId, data }) {
    this.schedules = this.schedules.map(schedule => {
      if (schedule.id === scheduleId) {
        let newSchedule = { ...schedule }
        if (data.schedule !== null && data.schedule !== undefined && Object.keys(data.schedule).length) {
          newSchedule.schedule = { ...schedule.schedule, ...data.schedule || {} }
        }
        return newSchedule
      }

      return { ...schedule }
    })
  }

  handleUpdateScheduleSuccess(schedule) {
    this.schedules = this.schedules.map(s => {
      if (s.id === schedule.id) {
        return { ...schedule }
      }

      return { ...s }
    })
  }
}

export default alt.createStore(ScheduleStore)
