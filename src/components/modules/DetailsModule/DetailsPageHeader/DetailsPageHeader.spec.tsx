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

import { User } from "@src/@types/User";
import notificationStore from "@src/stores/NotificationStore";
import { render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import DetailsPageHeader from "./DetailsPageHeader";

jest.mock("react-router", () => ({ Link: "a" }));
jest.mock("@src/stores/NotificationStore", () => ({
  notificationItems: [],
  loadData: jest.fn().mockResolvedValue([]),
  saveSeen: jest.fn(),
}));

const user: User = {
  id: "1",
  name: "Test User",
  email: "email",
  project: { id: "1", name: "Test Project" },
};

describe("DetailsPageHeader", () => {
  let defaultProps: DetailsPageHeader["props"];

  beforeEach(() => {
    defaultProps = {
      user,
      onUserItemClick: jest.fn(),
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("renders without crashing", () => {
    render(<DetailsPageHeader {...defaultProps} />);
  });

  it("starts polling on mount", async () => {
    render(<DetailsPageHeader {...defaultProps} />);
    expect(notificationStore.loadData).toHaveBeenCalled();

    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      jest.advanceTimersByTime(15000);
    });
    expect(notificationStore.loadData).toHaveBeenCalledTimes(2);

    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      jest.advanceTimersByTime(15000);
    });
    expect(notificationStore.loadData).toHaveBeenCalledTimes(3);
  });

  it("stops polling on unmount", async () => {
    const { unmount } = render(<DetailsPageHeader {...defaultProps} />);
    unmount();

    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      jest.advanceTimersByTime(15000);
    });
    expect(notificationStore.loadData).toHaveBeenCalledTimes(1);
  });

  it("handles notification close by saving seen notifications", async () => {
    render(<DetailsPageHeader {...defaultProps} />);
    await act(async () => {
      TestUtils.select("NotificationDropdown__Icon")?.click();
    });
    expect(TestUtils.select("NotificationDropdown__List")).toBeTruthy();
    await act(async () => {
      TestUtils.select("NotificationDropdown__Icon")?.click();
    });
    expect(TestUtils.select("NotificationDropdown__List")).toBeFalsy();
    expect(notificationStore.saveSeen).toHaveBeenCalled();
  });

  it("handles user item click for 'about'", async () => {
    render(<DetailsPageHeader {...defaultProps} />);
    await act(async () => {
      TestUtils.select("UserDropdown__Icon")?.click();
    });
    expect(TestUtils.select("UserDropdown__List")).toBeTruthy();
    expect(TestUtils.select("UserDropdown__Username")?.textContent).toBe(
      user.name,
    );
    expect(TestUtils.select("UserDropdown__Email")?.textContent).toBe(
      user.email,
    );
    await act(async () => {
      TestUtils.selectAll("UserDropdown__Label").forEach(item => {
        if (item.textContent === "About Coriolis") {
          item.click();
        }
      });
    });
    expect(defaultProps.onUserItemClick).not.toHaveBeenCalled();
    expect(TestUtils.select("AboutModal__Wrapper")).toBeTruthy();
  });

  it("handles user item click for other values", async () => {
    render(<DetailsPageHeader {...defaultProps} />);
    await act(async () => {
      TestUtils.select("UserDropdown__Icon")?.click();
    });
    expect(TestUtils.select("UserDropdown__List")).toBeTruthy();
    await act(async () => {
      TestUtils.selectAll("UserDropdown__Label").forEach(item => {
        if (item.textContent === "Sign Out") {
          item.click();
        }
      });
    });
    expect(defaultProps.onUserItemClick).toHaveBeenCalledWith({
      label: "Sign Out",
      value: "signout",
    });
  });

  it("closes the about modal", async () => {
    render(<DetailsPageHeader {...defaultProps} />);
    await act(async () => {
      TestUtils.select("UserDropdown__Icon")?.click();
    });
    await act(async () => {
      TestUtils.selectAll("UserDropdown__Label").forEach(item => {
        if (item.textContent === "About Coriolis") {
          item.click();
        }
      });
    });
    expect(TestUtils.select("AboutModal__Wrapper")).toBeTruthy();
    await act(async () => {
      document.querySelectorAll("button").forEach(item => {
        if (item.textContent === "Close") {
          item.click();
        }
      });
    });
    expect(TestUtils.select("AboutModal__Wrapper")).toBeFalsy();
  });
});
