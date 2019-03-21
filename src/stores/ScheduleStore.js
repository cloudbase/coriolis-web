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

  @action async scheduleMultiple(replicaId: string, schedules: Schedule[]): Promise<void> {
    this.scheduling = true

    try {
      let scheduledSchedules: Schedule[] = await Source.scheduleMultiple(replicaId, schedules)
      runInAction(() => { this.schedules = scheduledSchedules })
    } finally {
      runInAction(() => { this.scheduling = false })
    }
  }

  @action async getSchedules(replicaId: string): Promise<void> {
    this.loading = true

    try {
      let schedules: Schedule[] = await Source.getSchedules(replicaId)
      runInAction(() => { this.schedules = schedules })
    } finally {
      runInAction(() => { this.loading = false })
    }
  }

  async getSchedulesBulk(replicaIds: string[]): Promise<void> {
    let bulkSchedules: ScheduleBulkItem[] = await Promise.all(replicaIds.map(async replicaId => {
      let schedules: Schedule[] = await Source.getSchedules(replicaId, { skipLog: true })
      return { replicaId, schedules }
    }))
    runInAction(() => { this.bulkSchedules = bulkSchedules })
  }

  @action async addSchedule(replicaId: string, schedule: Schedule): Promise<void> {
    this.adding = true

    try {
      let addedSchedule: Schedule = await Source.addSchedule(replicaId, schedule)
      runInAction(() => { this.schedules = [...this.schedules, addedSchedule] })
    } finally {
      runInAction(() => { this.adding = false })
    }
  }

  @action async removeSchedule(replicaId: string, scheduleId: string): Promise<void> {
    this.schedules = this.schedules.filter(s => s.id !== scheduleId)
    this.unsavedSchedules = this.unsavedSchedules.filter(s => s.id !== scheduleId)

    await Source.removeSchedule(replicaId, scheduleId)
  }

  @action async updateSchedule(
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
      return
    }
    let schedule: Schedule = await Source.updateSchedule(replicaId, scheduleId, data, oldData, unsavedData)
    runInAction(() => {
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
