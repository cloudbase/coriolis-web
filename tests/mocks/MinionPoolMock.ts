import {
  MinionMachine,
  MinionPool,
  MinionPoolDetails,
} from "@src/@types/MinionPool";

export const MINION_MACHINE_MOCK: MinionMachine = {
  id: "minion-machine-id",
  created_at: "2023-11-26T12:00:00Z",
  updated_at: "2023-11-26T12:00:00Z",
  allocation_status: "ALLOCATED",
  connection_info: {},
  power_status: "on",
  provider_properties: {},
  last_used_at: "2023-11-26T12:00:00Z",
  allocated_action: "replica-id",
};

export const MINION_POOL_MOCK: MinionPool = {
  id: "minion-pool-id",
  created_at: "2023-11-26T12:00:00Z",
  updated_at: "2023-11-26T12:00:00Z",
  name: "minion-pool-name",
  os_type: "linux",
  status: "ACTIVE",
  minimum_minions: 1,
  maximum_minions: 10,
  environment_options: {
    option_1: "option_1_value",
    object_option: {
      object_option_1: "object_option_1_value",
    },
    array_option: ["array_option_1_value", "array_option_2_value"],
    object_with_mappings: {
      mappings: [
        {
          source: "source_value",
          destination: "destination_value",
        },
      ],
    },
  },
  endpoint_id: "openstack",
  notes: "minion-pool-notes",
  platform: "source",
  minion_machines: [{ ...MINION_MACHINE_MOCK }],
  minion_retention_strategy: "poweroff",
  minion_max_idle_time: 0,
};

export const MINION_POOL_DETAILS_MOCK: MinionPoolDetails = {
  ...MINION_POOL_MOCK,
  events: [
    {
      id: "minion-pool-event-id",
      index: 0,
      level: "INFO",
      message: "minion-pool-event-message",
      created_at: "2023-11-26T12:00:00Z",
    },
    {
      id: "minion-pool-event-id-2",
      index: 1,
      level: "DEBUG",
      message: "minion-pool-event-message-debug",
      created_at: "2023-11-25T12:00:00Z",
    },
  ],
  progress_updates: [
    {
      id: "minion-pool-progress-update-id",
      current_step: 0,
      message: "minion-pool-progress-update-message",
      created_at: "2023-11-26T12:00:00Z",
    },
    {
      id: "minion-pool-progress-update-2",
      current_step: 1,
      message: "minion-pool-progress-update-message-2",
      created_at: "2023-11-25T12:00:00Z",
    },
  ],
};
