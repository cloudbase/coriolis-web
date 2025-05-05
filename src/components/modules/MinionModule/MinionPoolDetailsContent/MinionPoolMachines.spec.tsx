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
import { MINION_POOL_MOCK } from "@tests/mocks/MinionPoolMock";
import { DEPLOYMENT_MOCK, TRANSFER_MOCK } from "@tests/mocks/TransferMock";
import TestUtils from "@tests/TestUtils";

import MinionPoolMachines from "./MinionPoolMachines";

jest.mock("react-router", () => ({ Link: "a" }));

describe("MinionPoolMachines", () => {
  let defaultProps: MinionPoolMachines["props"];

  beforeEach(() => {
    defaultProps = {
      item: MINION_POOL_MOCK,
      transfers: [TRANSFER_MOCK],
      deployments: [DEPLOYMENT_MOCK],
    };
  });

  const filterBy = async (fromLabel: string, toLabel: string) => {
    let filterDropdown: HTMLElement | null = null;
    TestUtils.selectAll("DropdownLink__Label").forEach(element => {
      if (element.textContent === fromLabel) {
        filterDropdown = element;
      }
    });
    expect(filterDropdown).toBeTruthy();

    await act(async () => {
      filterDropdown!.click();
    });
  
    let filterItem: HTMLElement | null = null;
    TestUtils.selectAll("DropdownLink__ListItem-").forEach(element => {
      if (element.textContent === toLabel) {
        filterItem = element;
      }
    });
    expect(filterItem).toBeTruthy();
    await act(async () => {
      filterItem!.click();
    });
  };

  it("renders without crashing", () => {
    const { getByText } = render(<MinionPoolMachines {...defaultProps} />);
    expect(
      TestUtils.select("MinionPoolMachines__HeaderText")?.textContent
    ).toBe("1 minion machine, 1 allocated");
    expect(
      getByText(`ID: ${MINION_POOL_MOCK.minion_machines[0].id}`)
    ).toBeTruthy();
  });

  it("filters correctly", async () => {
    render(<MinionPoolMachines {...defaultProps} />);
    await filterBy("All", "Allocated");
    expect(
      TestUtils.selectAll("MinionPoolMachines__MachineWrapper").length
    ).toBe(1);
  
    await filterBy("Allocated", "Not Allocated");
    expect(
      TestUtils.selectAll("MinionPoolMachines__MachineWrapper").length
    ).toBe(0);
  });

  it("renders no machines", () => {
    render(
      <MinionPoolMachines
        {...defaultProps}
        item={{ ...MINION_POOL_MOCK, minion_machines: [] }}
      />
    );
    expect(TestUtils.select("MinionPoolMachines__NoMachines")).toBeTruthy();
  });

  it("handles row click", async () => {
    render(<MinionPoolMachines {...defaultProps} />);
    const arrow = TestUtils.select(
      "Arrow__Wrapper",
      TestUtils.select("MinionPoolMachines__Row-")!
    );
    expect(arrow).toBeTruthy();
    expect(arrow!.attributes.getNamedItem("orientation")!.value).toBe("down");

    await act(async () => {
      TestUtils.select("MinionPoolMachines__Row-")!.click();
    });
    expect(arrow!.attributes.getNamedItem("orientation")!.value).toBe("up");

    await act(async () => {
      TestUtils.select("MinionPoolMachines__Row-")!.click();
    });
    expect(arrow!.attributes.getNamedItem("orientation")!.value).toBe("down");
  });
});
