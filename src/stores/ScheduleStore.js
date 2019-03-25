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

import type { Schedule, ScheduleBulkItem } from '../types/Schedule'
import Source from '../sources/ScheduleSource'

const updateSchedule = (schedules, id, data) => {
  return schedules.map(schedule => {
    if (schedule.id === id) {
      let newSchedule = { ...schedule, ...data }
      if (data.schedule != null && Object.keys(data.schedule).length) {
        newSchedule.schedule = { ...schedule.schedule, ...data.schedule || {} }
      }
      return newSchedule
    }

    return { ...schedule }
  })
}

class ScheduleStore {
  @observable loading: boolean = false
  @observable schedules: Schedule[] = []
  @observable bulkSchedules: ScheduleBulkItem[] = []
  @observable unsavedSchedules: Schedule[] = []
  @observable scheduling: boolean = false
  @observable adding: boolean = false

  @action scheduleMultiple(replicaId: string, schedules: Schedule[]): Promise<void> {
    this.scheduling = true

    return Source.scheduleMultiple(replicaId, schedules).then((schedules: Schedule[]) => {
      this.scheduling = false
      this.schedules = schedules
    }).catch(() => {
      this.scheduling = false
    })
  }

  @action getSchedules(replicaId: string): Promise<void> {
    this.loading = true

    return Source.getSchedules(replicaId).then((schedules: Schedule[]) => {
      this.loading = false
      this.schedules = schedules
    }).catch(() => {
      this.loading = false
    })
  }

  getSchedulesBulk(replicaIds: string[]): Promise<void> {
    return Promise.all(replicaIds.map(replicaId => {
      return Source.getSchedules(replicaId, { skipLog: true }).then(schedules => {
        return { replicaId, schedules }
      })
    })).then(bulkSchedules => {
      runInAction(() => { this.bulkSchedules = bulkSchedules })
    })
  }

  @action addSchedule(replicaId: string, schedule: Schedule): Promise<void> {
    this.adding = true

    return Source.addSchedule(replicaId, schedule).then((schedule: Schedule) => {
      this.adding = false
      this.schedules = [...this.schedules, schedule]
    }).catch(() => {
      this.adding = false
    })
  }

  @action removeSchedule(replicaId: string, scheduleId: string): Promise<void> {
    this.schedules = this.schedules.filter(s => s.id !== scheduleId)
    this.unsavedSchedules = this.unsavedSchedules.filter(s => s.id !== scheduleId)

    return Source.removeSchedule(replicaId, scheduleId)
  }

  @action updateSchedule(
    replicaId: string,
    scheduleId: string,
    data: Schedule,
    oldData: ?Schedule,
    unsavedData: ?Schedule,
    forceSave?: boolean
  ): Promise<void> {
    this.schedules = updateSchedule(this.schedules, scheduleId, data)

    if (!forceSave) {
      const unsavedSchedule = this.unsavedSchedules.find(s => s.id === scheduleId)
      if (unsavedSchedule) {
        this.unsavedSchedules = updateSchedule(this.unsavedSchedules, scheduleId, data)
      } else {
        this.unsavedSchedules.push({ id: scheduleId, ...data })
      }
      return Promise.resolve()
    }

    return Source.updateSchedule(replicaId, scheduleId, data, oldData, unsavedData).then((schedule: Schedule) => {
      this.schedules = this.schedules.map(s => {
        if (s.id === schedule.id) {
          return { ...schedule }
        }
        return { ...s }
      })
      this.unsavedSchedules = this.unsavedSchedules.filter(s => s.id !== schedule.id)
    })
  }

  @action clearUnsavedSchedules() {
    this.unsavedSchedules = []
  }
}

export default new ScheduleStore()
