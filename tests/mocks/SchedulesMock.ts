import { DateTime } from "luxon";

import { Schedule } from "@src/@types/Schedule";

export const SCHEDULE_MOCK: Schedule = {
  id: "schedule-1",
  enabled: true,
  schedule: {
    hour: 1,
    dow: 1,
    dom: 1,
  },
  expiration_date: DateTime.now().plus({ years: 1 }).toJSDate(),
  shutdown_instances: true,
};
