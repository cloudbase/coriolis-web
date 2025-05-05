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

import { act, render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import DashboardContent from "./DashboardContent";

jest.mock("react-router", () => ({ Link: "div" }));

describe("DashboardContent", () => {
  let resizeWindow: (x: number, y: number) => void;
  let defaultProps: DashboardContent["props"];

  beforeAll(() => {
    resizeWindow = (x, y) => {
      window.innerWidth = x;
      window.innerHeight = y;
      window.dispatchEvent(new Event("resize"));
    };
  });

  beforeEach(() => {
    defaultProps = {
      transfers: [],
      deployments: [],
      endpoints: [],
      projects: [],
      transfersLoading: false,
      deploymentsLoading: false,
      endpointsLoading: false,
      usersLoading: false,
      projectsLoading: false,
      licenceLoading: false,
      notificationItemsLoading: false,
      users: [],
      licence: null,
      licenceServerStatus: null,
      licenceError: null,
      notificationItems: [],
      isAdmin: false,
      onNewTransferClick: jest.fn(),
      onNewEndpointClick: jest.fn(),
      onAddLicenceClick: jest.fn(),
    };
  });

  it("renders modules for non-admin users", () => {
    render(<DashboardContent {...defaultProps} />);
    expect(
      TestUtils.selectAll("DashboardInfoCount__CountBlockLabel"),
    ).toHaveLength(3);
    expect(
      TestUtils.selectAll("DashboardInfoCount__CountBlockLabel")[0].textContent,
    ).toBe("Replicas");
    expect(
      TestUtils.selectAll("DashboardInfoCount__CountBlockLabel")[1].textContent,
    ).toBe("Migrations");
    expect(
      TestUtils.selectAll("DashboardInfoCount__CountBlockLabel")[2].textContent,
    ).toBe("Endpoints");
  });

  it("renders additional modules for admin users", () => {
    render(<DashboardContent {...defaultProps} isAdmin />);

    expect(
      TestUtils.selectAll("DashboardInfoCount__CountBlockLabel"),
    ).toHaveLength(5);
    expect(
      TestUtils.selectAll("DashboardInfoCount__CountBlockLabel")[0].textContent,
    ).toBe("Replicas");
    expect(
      TestUtils.selectAll("DashboardInfoCount__CountBlockLabel")[1].textContent,
    ).toBe("Migrations");
    expect(
      TestUtils.selectAll("DashboardInfoCount__CountBlockLabel")[2].textContent,
    ).toBe("Endpoints");
    expect(
      TestUtils.selectAll("DashboardInfoCount__CountBlockLabel")[3].textContent,
    ).toBe("Users");
    expect(
      TestUtils.selectAll("DashboardInfoCount__CountBlockLabel")[4].textContent,
    ).toBe("Projects");
  });

  it("switches to mobile layout when window width is less than 1120", () => {
    resizeWindow(1100, 800);
    render(<DashboardContent {...defaultProps} />);

    expect(
      TestUtils.select("DashboardContent__MiddleMobileLayout"),
    ).toBeTruthy();
  });

  it("handleResize updates state correctly based on window size", async () => {
    resizeWindow(2400, 800);

    let instance: DashboardContent | null = null;

    const setRef = (componentInstance: DashboardContent) => {
      instance = componentInstance;
    };

    render(<DashboardContent ref={setRef} {...defaultProps} />);

    const setStateMock = jest.spyOn(instance!, "setState");

    act(() => {
      resizeWindow(1000, 800);
    });

    expect(setStateMock).toHaveBeenCalledWith({ useMobileLayout: true });

    setStateMock.mockRestore();
    act(() => {
      resizeWindow(2400, 800);
    });
  });
});
