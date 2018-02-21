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

import ScheduleSource from '../sources/ScheduleSource'

class ScheduleActions {
  scheduleMultiple(replicaId, schedules) {
    ScheduleSource.scheduleMultiple(replicaId, schedules).then(
      s => { this.scheduleMultipleSuccess(s) },
      response => { this.scheduleMultipleFailed(response) },
    )
    return { replicaId, schedules }
  }

  scheduleMultipleSuccess(schedules) {
    return schedules
  }

  scheduleMultipleFailed(response) {
    return response || true
  }

  getSchedules(replicaId) {
    ScheduleSource.getSchedules(replicaId).then(
      schedules => { this.getSchedulesSuccess(schedules) },
      response => { this.getSchedulesFailed(response) },
    )

    return replicaId
  }

  getSchedulesSuccess(schedules) {
    return schedules
  }

  getSchedulesFailed(response) {
    return response || true
  }

  addSchedule(replicaId, schedule) {
    ScheduleSource.addSchedule(replicaId, schedule).then(
      schedule => { this.addScheduleSuccess(schedule) },
      response => { this.addScheduleFailed(response) },
    )

    return replicaId
  }

  addScheduleSuccess(schedule) {
    return schedule
  }

  addScheduleFailed(response) {
    return response || true
  }

  removeSchedule(replicaId, scheduleId) {
    ScheduleSource.removeSchedule(replicaId, scheduleId).then(
      () => { this.removeScheduleSuccess() },
      response => { this.removeScheduleFailed(response) },
    )

    return { replicaId, scheduleId }
  }

  removeScheduleSuccess() {
    return true
  }

  removeScheduleFailed(response) {
    return response || true
  }

  updateSchedule(replicaId, scheduleId, data, oldData, unsavedData, forceSave) {
    if (forceSave) {
      ScheduleSource.updateSchedule(replicaId, scheduleId, data, oldData, unsavedData).then(
        schedule => { this.updateScheduleSuccess(schedule) },
        response => { this.updateScheduleFailed(response) },
      )
    }

    return { replicaId, scheduleId, data, forceSave }
  }

  updateScheduleSuccess(schedule) {
    return schedule
  }

  updateScheduleFailed(response) {
    return response || null
  }

  saveChanges(replicaId, allSchedules, unsavedSchedules) {
    let schedulesToUpdate = unsavedSchedules.map(s => {
      if (s.schedule) {
        s.schedule = {
          ...allSchedules.find(sc => sc.id === s.id).schedule,
          ...s.schedule,
        }
      }
      return s
    })
    ScheduleSource.updateMultiple(replicaId, schedulesToUpdate).then(
      updatedSchedules => { this.saveChangesSuccess(updatedSchedules) },
      err => { this.saveChangesFailed(err) }
    )

    return {
      replicaId,
      allSchedules,
      unsavedSchedules,
    }
  }

  saveChangesSuccess(updatedSchedules) {
    return updatedSchedules
  }

  saveChangesFailed(err) {
    return err || true
  }

  clearUnsavedSchedules() {
    return true
  }
}

export default alt.createActions(ScheduleActions)
