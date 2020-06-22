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

import moment from 'moment'

import Api from '../utils/ApiCaller'
import configLoader from '../utils/Config'
import DateUtils from '../utils/DateUtils'
import type { Schedule } from '../@types/Schedule'

class ScheduleSource {
  async scheduleSinge(replicaId: string, scheduleData: Schedule): Promise<Schedule> {
    const payload: any = {
      schedule: {},
      expiration_date: null,
      enabled: scheduleData.enabled == null ? false : scheduleData.enabled,
      shutdown_instance: scheduleData.shutdown_instances == null
        ? false : scheduleData.shutdown_instances,
    }

    if (scheduleData.expiration_date) {
      payload.expiration_date = moment(scheduleData.expiration_date).toISOString()
    }

    if (scheduleData.schedule != null) {
      Object.keys(scheduleData.schedule).forEach(prop => {
        const scheduleDataAny: any = scheduleData
        if (scheduleDataAny.schedule && scheduleDataAny.schedule[prop] != null) {
          payload.schedule[prop] = scheduleDataAny.schedule[prop]
        }
      })
    }

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${replicaId}/schedules`,
      method: 'POST',
      data: payload,
    })
    return response.data.schedule
  }

  async scheduleMultiple(replicaId: string, schedules: Schedule[]): Promise<Schedule[]> {
    const scheduledSchedules: Schedule[] = await Promise.all(schedules.map(async schedule => {
      const scheduledSchedule: Schedule = await this.scheduleSinge(replicaId, schedule)
      return scheduledSchedule
    }))
    return scheduledSchedules
  }

  async getSchedules(replicaId: string, opts?: { skipLog?: boolean }): Promise<Schedule[]> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${replicaId}/schedules`,
      skipLog: opts && opts.skipLog,
    })
    const schedules = [...response.data.schedules]
    schedules.forEach(s => {
      if (s.expiration_date) {
        // eslint-disable-next-line no-param-reassign
        s.expiration_date = DateUtils.getLocalTime(s.expiration_date)
      }
      if (s.shutdown_instance) {
        // eslint-disable-next-line no-param-reassign
        s.shutdown_instances = s.shutdown_instance
      }
    })
    schedules.sort((a, b) => moment(a.created_at).diff(b.created_at))
    return schedules
  }

  async addSchedule(replicaId: string, schedule: Schedule): Promise<Schedule> {
    const payload: any = {
      schedule: { hour: 0, minute: 0 },
      enabled: false,
    }
    if (schedule && schedule.schedule) {
      payload.schedule = { ...schedule.schedule }
    }

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${replicaId}/schedules`,
      method: 'POST',
      data: payload,
    })
    return response.data.schedule
  }

  async removeSchedule(replicaId: string, scheduleId: string): Promise<void> {
    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${replicaId}/schedules/${scheduleId}`,
      method: 'DELETE',
    })
  }

  async updateSchedule(
    replicaId: string,
    scheduleId: string,
    scheduleData: Schedule,
    scheduleOldData: Schedule | null | undefined,
    unsavedData: Schedule | null | undefined,
  ): Promise<Schedule> {
    const payload: any = {}
    if (scheduleData.enabled != null) {
      payload.enabled = scheduleData.enabled
    }
    if (scheduleData.shutdown_instances != null) {
      payload.shutdown_instance = scheduleData.shutdown_instances
    }
    if (unsavedData && unsavedData.expiration_date) {
      payload.expiration_date = moment(unsavedData.expiration_date).toISOString()
    }
    if (unsavedData && unsavedData.schedule != null && Object.keys(unsavedData.schedule).length) {
      if (scheduleOldData) {
        payload.schedule = { ...scheduleOldData.schedule }
      }
      Object.keys(unsavedData.schedule).forEach(prop => {
        const unsavedDataAny: any = unsavedData
        if (unsavedDataAny?.schedule && unsavedDataAny.schedule[prop] != null) {
          payload.schedule[prop] = unsavedDataAny.schedule[prop]
        } else {
          delete payload.schedule[prop]
        }
      })
    }

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/replicas/${replicaId}/schedules/${scheduleId}`,
      method: 'PUT',
      data: payload,
    })
    const s = { ...response.data.schedule }
    if (s.expiration_date) {
      s.expiration_date = DateUtils.getLocalTime(s.expiration_date)
    }
    if (s.shutdown_instance) {
      s.shutdown_instances = s.shutdown_instance
    }
    return s
  }
}

export default new ScheduleSource()
