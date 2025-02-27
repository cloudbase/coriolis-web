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

import React from "react";

import { render } from "@testing-library/react";
import {
  OPENSTACK_ENDPOINT_MOCK,
  VMWARE_ENDPOINT_MOCK,
} from "@tests/mocks/EndpointsMock";
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";
import { MINION_POOL_MOCK } from "@tests/mocks/MinionPoolMock";
import { SCHEDULE_MOCK } from "@tests/mocks/SchedulesMock";

import WizardSummary from "./";

jest.mock("@src/utils/Config", () => ({
  config: {
    providerSortPriority: {},
    providerNames: {
      openstack: "OpenStack",
      vmware_vsphere: "VMware vSphere",
    },
  },
}));

describe("WizardSummary", () => {
  let defaultProps: WizardSummary["props"];

  beforeEach(() => {
    defaultProps = {
      data: {
        destOptions: { option_1: "option_1" },
        sourceOptions: { option_2: "option_2" },
        selectedInstances: [INSTANCE_MOCK],
        source: VMWARE_ENDPOINT_MOCK,
        target: OPENSTACK_ENDPOINT_MOCK,
      },
      wizardType: "replica",
      schedules: [SCHEDULE_MOCK],
      minionPools: [MINION_POOL_MOCK],
      defaultStorage: { value: "defaultStorage" },
      instancesDetails: [INSTANCE_MOCK],
      storageMap: [],
      sourceSchema: [{ name: "option_1", label: "Option 1", type: "string" }],
      destinationSchema: [
        { name: "option_2", label: "Option 2", type: "string" },
      ],
      uploadedUserScripts: [],
      executionOptions: [],
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<WizardSummary {...defaultProps} />);
    expect(getByText("Overview")).toBeTruthy();
    expect(getByText("REPLICA")).toBeTruthy();
    expect(getByText(VMWARE_ENDPOINT_MOCK.name)).toBeTruthy();
    expect(getByText(INSTANCE_MOCK.name)).toBeTruthy();
  });
});
