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

import { observable, action, runInAction } from "mobx";

import type { Schedule, ScheduleBulkItem } from "@src/@types/Schedule";
import Source from "@src/sources/ScheduleSource";

const updateSchedule = (schedules: any[], id: any, data: any) =>
  schedules.map(schedule => {
    if (schedule.id === id) {
      const newSchedule = { ...schedule, ...data };
      if (data.schedule != null && Object.keys(data.schedule).length) {
        newSchedule.schedule = {
          ...schedule.schedule,
          ...(data.schedule || {}),
        };
      }
      return newSchedule;
    }

    return { ...schedule };
  });

class ScheduleStore {
  @observable loading = false;

  @observable schedules: Schedule[] = [];

  @observable bulkSchedules: ScheduleBulkItem[] = [];

  @observable unsavedSchedules: Schedule[] = [];

  @observable scheduling = false;

  @observable adding = false;

  @observable savingIds: string[] = [];

  @observable enablingIds: string[] = [];

  @observable deletingIds: string[] = [];

  @action async scheduleMultiple(
    transferId: string,
    schedules: Schedule[]
  ): Promise<void> {
    this.scheduling = true;

    try {
      const scheduledSchedules: Schedule[] = await Source.scheduleMultiple(
        transferId,
        schedules
      );
      runInAction(() => {
        this.schedules = scheduledSchedules;
      });
    } finally {
      runInAction(() => {
        this.scheduling = false;
      });
    }
  }

  @action async getSchedules(transferId: string): Promise<void> {
    this.loading = true;

    try {
      const schedules: Schedule[] = await Source.getSchedules(transferId);
      runInAction(() => {
        this.schedules = schedules;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async getSchedulesBulk(transferIds: string[]): Promise<void> {
    const bulkSchedules: ScheduleBulkItem[] = await Promise.all(
      transferIds.map(async transferId => {
        const schedules: Schedule[] = await Source.getSchedules(transferId, {
          skipLog: true,
        });
        return { transferId: transferId, schedules };
      })
    );
    runInAction(() => {
      this.bulkSchedules = bulkSchedules;
    });
  }

  @action async addSchedule(
    transferId: string,
    schedule: Schedule
  ): Promise<void> {
    this.adding = true;

    try {
      const addedSchedule: Schedule = await Source.addSchedule(
        transferId,
        schedule
      );
      runInAction(() => {
        this.schedules = [...this.schedules, addedSchedule];
      });
    } finally {
      runInAction(() => {
        this.adding = false;
      });
    }
  }

  @action async removeSchedule(
    transferId: string,
    scheduleId: string
  ): Promise<void> {
    this.deletingIds.push(scheduleId);
    try {
      await Source.removeSchedule(transferId, scheduleId);
      runInAction(() => {
        this.schedules = this.schedules.filter(s => s.id !== scheduleId);
        this.unsavedSchedules = this.unsavedSchedules.filter(
          s => s.id !== scheduleId
        );
      });
    } finally {
      runInAction(() => {
        this.deletingIds = this.deletingIds.filter(id => id !== scheduleId);
      });
    }
  }

  @action async updateSchedule(opts: {
    transferId: string;
    scheduleId: string;
    data: Schedule;
    oldData?: Schedule | null;
    unsavedData?: Schedule | null;
    forceSave?: boolean;
  }): Promise<void> {
    const {
      transferId: transferId,
      scheduleId,
      data,
      oldData,
      unsavedData,
      forceSave,
    } = opts;

    if (!forceSave) {
      this.schedules = updateSchedule(this.schedules, scheduleId, data);
      const unsavedSchedule = this.unsavedSchedules.find(
        s => s.id === scheduleId
      );
      if (unsavedSchedule) {
        this.unsavedSchedules = updateSchedule(
          this.unsavedSchedules,
          scheduleId,
          data
        );
      } else {
        this.unsavedSchedules.push({ id: scheduleId, ...data });
      }
      return;
    }
    this.savingIds.push(scheduleId);
    if (data.enabled !== oldData?.enabled) {
      this.enablingIds.push(scheduleId);
    }
    try {
      const schedule: Schedule = await Source.updateSchedule({
        transferId: transferId,
        scheduleId,
        scheduleData: data,
        scheduleOldData: oldData,
        unsavedData,
      });
      runInAction(() => {
        this.schedules = this.schedules.map(s => {
          if (s.id === schedule.id) {
            return { ...schedule };
          }
          return { ...s };
        });
        this.unsavedSchedules = this.unsavedSchedules.filter(
          s => s.id !== schedule.id
        );
      });
    } finally {
      runInAction(() => {
        this.savingIds = this.savingIds.filter(id => id !== scheduleId);
        this.enablingIds = this.enablingIds.filter(id => id !== scheduleId);
      });
    }
  }

  @action clearUnsavedSchedules() {
    this.unsavedSchedules = [];
  }
}

export default new ScheduleStore();
