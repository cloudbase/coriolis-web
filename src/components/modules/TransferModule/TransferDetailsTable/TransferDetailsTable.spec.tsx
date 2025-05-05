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
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";
import { MINION_POOL_MOCK } from "@tests/mocks/MinionPoolMock";
import { NETWORK_MOCK } from "@tests/mocks/NetworksMock";
import { STORAGE_BACKEND_MOCK } from "@tests/mocks/StoragesMock";
import { TRANSFER_MOCK } from "@tests/mocks/TransferMock";
import TestUtils from "@tests/TestUtils";

import TransferDetailsTable from "./";

describe("TransferDetailsTable", () => {
  let defaultProps: TransferDetailsTable["props"];

  beforeEach(() => {
    defaultProps = {
      item: TRANSFER_MOCK,
      instancesDetails: [INSTANCE_MOCK],
      networks: [NETWORK_MOCK],
      minionPools: [MINION_POOL_MOCK],
      storageBackends: [STORAGE_BACKEND_MOCK],
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<TransferDetailsTable {...defaultProps} />);
    expect(getByText("Source")).toBeTruthy();
    expect(getByText("Target")).toBeTruthy();
  });

  it("renders without crashing when no transfer result and no disabled disks", () => {
    const { getByText } = render(
      <TransferDetailsTable
        {...defaultProps}
        item={{
          ...TRANSFER_MOCK,
          transfer_result: null,
        }}
        instancesDetails={[
          {
            ...INSTANCE_MOCK,
            devices: {
              ...INSTANCE_MOCK.devices,
              disks: [
                { ...INSTANCE_MOCK.devices.disks[0], disabled: undefined },
              ],
            },
          },
        ]}
      />
    );
    expect(getByText("Source")).toBeTruthy();
    expect(getByText("Target")).toBeTruthy();
  });

  it("handles row click", async () => {
    render(<TransferDetailsTable {...defaultProps} />);
    const rows = TestUtils.selectAll("TransferDetailsTable__Row-");
    expect(rows[0]).toBeTruthy();
    expect(rows[1]).toBeTruthy();
    const firstArrow = () => TestUtils.select("Arrow__Wrapper-", rows[0])!;
    const secondArrow = () => TestUtils.select("Arrow__Wrapper-", rows[1])!;
    expect(firstArrow()).toBeTruthy();
    expect(secondArrow()).toBeTruthy();

    expect(firstArrow().getAttribute("orientation")).toBe("down");
    act(() => {
      rows[0].click();
    });
    expect(firstArrow().getAttribute("orientation")).toBe("up");

    expect(secondArrow().getAttribute("orientation")).toBe("down");
    act(() => {
      rows[1].click();
    });
    expect(secondArrow().getAttribute("orientation")).toBe("up");
    act(() => {
      rows[1].click();
    });
    expect(secondArrow().getAttribute("orientation")).toBe("down");
  });
});
