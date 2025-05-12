/*
Copyright (C) 2023  Cloudbase Solutions SRL
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

import React, { act } from "react";

import Schedule from "@src/components/modules/TransferModule/Schedule";
import ScheduleStore from "@src/stores/ScheduleStore";
import { render } from "@testing-library/react";
import {
  OPENSTACK_ENDPOINT_MOCK,
  VMWARE_ENDPOINT_MOCK,
} from "@tests/mocks/EndpointsMock";
import {
  EXECUTION_MOCK,
  EXECUTION_TASKS_MOCK,
} from "@tests/mocks/ExecutionsMock";
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";
import { MINION_POOL_MOCK } from "@tests/mocks/MinionPoolMock";
import { NETWORK_MOCK } from "@tests/mocks/NetworksMock";
import { STORAGE_BACKEND_MOCK } from "@tests/mocks/StoragesMock";
import { TRANSFER_ITEM_DETAILS_MOCK } from "@tests/mocks/TransferMock";

import ReplicaDetailsContent from ".";

const scheduleStoreMock = jest.createMockFromModule<typeof ScheduleStore>(
  "@src/stores/ScheduleStore",
);

jest.mock("@src/components/modules/EndpointModule/EndpointLogos", () => ({
  __esModule: true,
  default: (props: any) => <div>{props.endpoint}</div>,
}));
jest.mock("react-router", () => ({ Link: "a" }));
jest.mock("@src/utils/Config", () => ({
  config: {
    providerSortPriority: {},
    providerNames: {
      openstack: "OpenStack",
      vmware_vsphere: "VMware vSphere",
    },
    providersDisabledExecuteOptions: ["metal"],
  },
}));
jest.mock("@src/components/modules/TransferModule/Schedule", () => ({
  __esModule: true,
  default: (props: Schedule["props"]) => (
    <div
      data-testid="ScheduleComponent"
      onClick={() => props.onTimezoneChange("utc")}
    >
      Timezone: {props.timezone}
    </div>
  ),
}));

describe("ReplicaDetailsContent", () => {
  let defaultProps: ReplicaDetailsContent["props"];

  beforeEach(() => {
    defaultProps = {
      item: TRANSFER_ITEM_DETAILS_MOCK,
      itemId: TRANSFER_ITEM_DETAILS_MOCK.id,
      endpoints: [OPENSTACK_ENDPOINT_MOCK, VMWARE_ENDPOINT_MOCK],
      sourceSchema: [],
      sourceSchemaLoading: false,
      destinationSchema: [],
      destinationSchemaLoading: false,
      networks: [NETWORK_MOCK],
      instancesDetails: [INSTANCE_MOCK],
      instancesDetailsLoading: false,
      scheduleStore: scheduleStoreMock,
      page: "",
      detailsLoading: false,
      executions: [EXECUTION_MOCK],
      executionsLoading: false,
      executionsTasks: [EXECUTION_TASKS_MOCK],
      executionsTasksLoading: false,
      minionPools: [MINION_POOL_MOCK],
      storageBackends: [STORAGE_BACKEND_MOCK],
      onExecutionChange: jest.fn(),
      onCancelExecutionClick: jest.fn(),
      onDeleteExecutionClick: jest.fn(),
      onExecuteClick: jest.fn(),
      onCreateDeploymentClick: jest.fn(),
      onDeleteTransferClick: jest.fn(),
      onAddScheduleClick: jest.fn(),
      onScheduleChange: jest.fn(),
      onScheduleRemove: jest.fn(),
      onScheduleSave: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<ReplicaDetailsContent {...defaultProps} />);
    expect(getByText(TRANSFER_ITEM_DETAILS_MOCK.id)).toBeTruthy();
  });

  it("renders executions page", () => {
    const { getByText } = render(
      <ReplicaDetailsContent {...defaultProps} page="executions" />,
    );
    expect(getByText(EXECUTION_MOCK.id)).toBeTruthy();
  });

  it("rendes schedules page", () => {
    const { getByTestId } = render(
      <ReplicaDetailsContent {...defaultProps} page="schedule" />,
    );
    expect(getByTestId("ScheduleComponent")).toBeTruthy();
  });

  it("fires timezone change", async () => {
    const { getByTestId, getByText } = render(
      <ReplicaDetailsContent {...defaultProps} page="schedule" />,
    );
    expect(getByText("Timezone: local")).toBeTruthy();
    await act(async () => {
      getByTestId("ScheduleComponent").click();
    });
    expect(getByText("Timezone: utc")).toBeTruthy();
  });
});
