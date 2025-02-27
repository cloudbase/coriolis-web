import {
  DeploymentItem,
  DeploymentItemDetails,
  TransferItem,
  TransferItemDetails,
} from "@src/@types/MainItem";
import { EXECUTION_MOCK, TASK_MOCK } from "@tests/mocks/ExecutionsMock";
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";

export const TRANSFER_MOCK: TransferItem = {
  id: "transfer-id",
  name: "transfer-name",
  type: "transfer",
  scenario: "replica",
  description: "transfer-description",
  notes: "transfer-notes",
  created_at: "2023-11-26T12:00:00Z",
  updated_at: "2023-11-26T12:00:00Z",
  origin_endpoint_id: "vmware",
  destination_endpoint_id: "openstack",
  origin_minion_pool_id: "origin-minion-pool-id",
  destination_minion_pool_id: "destination-minion-pool-id",
  instances: ["instance-id"],
  info: {},
  destination_environment: {
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
      disk_mappings: {},
    },
    password: "password-value",
  },
  source_environment: {},
  transfer_result: {
    "instance-id": { ...INSTANCE_MOCK },
  },
  last_execution_status: "COMPLETED",
  user_id: "user-id",
  network_map: {
    // @ts-ignore
    "network-name": "network-name",
  },
  storage_mappings: {
    backend_mappings: [
      {
        destination: "destination_value",
        source: "source_value",
      },
    ],
    default: "default_value",
    disk_mappings: [
      {
        destination: "destination_value",
        disk_id: "disk_id_value",
      },
    ],
  },
};

export const TRANSFER_ITEM_DETAILS_MOCK: TransferItemDetails = {
  ...TRANSFER_MOCK,
  executions: [EXECUTION_MOCK],
};

export const DEPLOYMENT_MOCK: DeploymentItem = {
  id: "deployment-id",
  name: "deployment-name",
  type: "deployment",
  transfer_id: "deployment-transfer-id",
  transfer_scenario_type: "replica",
  deployer_id: "deployer-id",
  description: "deployment-description",
  notes: "deployment-notes",
  created_at: "2023-11-26T12:00:00Z",
  updated_at: "2023-11-26T12:00:00Z",
  origin_endpoint_id: "openstack",
  destination_endpoint_id: "vmware",
  origin_minion_pool_id: "origin-minion-pool-id",
  destination_minion_pool_id: "destination-minion-pool-id",
  instances: ["instance-id"],
  info: {},
  destination_environment: {},
  source_environment: {},
  transfer_result: {},
  last_execution_status: "COMPLETED",
  user_id: "user-id",
  instance_osmorphing_minion_pool_mappings: {
    "instance-id": "minion-pool-id",
  },
  user_scripts: {
    global: {
      linux: "linux-script",
      windows: "windows-script",
    },
    instances: {
      "instance-id": "instance-script",
    },
  },
  clone_disks: true,
  skip_os_morphing: false,
};

export const DEPLOYMENT_ITEM_DETAILS_MOCK: DeploymentItemDetails = {
  ...DEPLOYMENT_MOCK,
  tasks: [{ ...TASK_MOCK, task_type: "deployment_task" }],
};
