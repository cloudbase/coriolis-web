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

import { render } from "@testing-library/react";
import {
  OPENSTACK_ENDPOINT_MOCK,
  VMWARE_ENDPOINT_MOCK,
} from "@tests/mocks/EndpointsMock";
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";
import { MINION_POOL_MOCK } from "@tests/mocks/MinionPoolMock";
import { STORAGE_BACKEND_MOCK } from "@tests/mocks/StoragesMock";
import { TRANSFER_MOCK } from "@tests/mocks/TransferMock";
import TestUtils from "@tests/TestUtils";

import MainDetails from "./";

jest.mock("@src/components/modules/EndpointModule/EndpointLogos", () => ({
  __esModule: true,
  default: (props: any) => <div>{props.endpoint}</div>,
}));
jest.mock("react-router", () => ({ Link: "a" }));

describe("MainDetails", () => {
  let defaultProps: MainDetails["props"];

  beforeEach(() => {
    defaultProps = {
      item: TRANSFER_MOCK,
      minionPools: [MINION_POOL_MOCK],
      storageBackends: [STORAGE_BACKEND_MOCK],
      destinationSchema: [],
      destinationSchemaLoading: false,
      sourceSchema: [],
      sourceSchemaLoading: false,
      instancesDetails: [INSTANCE_MOCK],
      instancesDetailsLoading: false,
      endpoints: [OPENSTACK_ENDPOINT_MOCK, VMWARE_ENDPOINT_MOCK],
      bottomControls: <div>Bottom controls</div>,
      loading: false,
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<MainDetails {...defaultProps} />);
    expect(getByText(TRANSFER_MOCK.id)).toBeTruthy();
    expect(getByText("Bottom controls")).toBeTruthy();
  });

  it("renders missing endpoint", () => {
    const { getByText } = render(
      <MainDetails
        {...defaultProps}
        item={{ ...TRANSFER_MOCK, destination_endpoint_id: "missing" }}
      />
    );
    expect(getByText("Endpoint is missing")).toBeTruthy();
  });

  it("renders loading", () => {
    render(<MainDetails {...defaultProps} loading />);
    expect(TestUtils.select("MainDetails__Loading")).toBeTruthy();
  });

  it("renders allocating minions error", () => {
    render(
      <MainDetails
        {...defaultProps}
        item={{
          ...TRANSFER_MOCK,
          last_execution_status: "ERROR_ALLOCATING_MINIONS",
        }}
      />
    );
    expect(
      Array.from(document.querySelectorAll("*")).find(el =>
        el.textContent?.includes("error allocating minion machines")
      )
    ).toBeTruthy();
  });

  it("shows password", async () => {
    const { getByText } = render(<MainDetails {...defaultProps} />);
    const passwordEl = TestUtils.select("PasswordValue__Wrapper")!;
    expect(passwordEl).toBeTruthy();
    expect(passwordEl.textContent).toBe("•••••••••");

    await act(async () => {
      passwordEl.click();
    });
    expect(
      getByText(TRANSFER_MOCK.destination_environment.password)
    ).toBeTruthy();
  });
});
