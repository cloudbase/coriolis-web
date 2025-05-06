/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import NotificationDropdown from "@src/components/ui/Dropdowns/NotificationDropdown";

import type { NotificationItemData } from "@src/@types/NotificationItem";
import TestUtils from "@tests/TestUtils";

jest.mock("react-router", () => ({ Link: "div" }));

const ITEMS: NotificationItemData[] = [
  {
    id: "1",
    type: "transfer",
    name: "Notification 1",
    description: "Description 1",
    status: "COMPLETED",
  },
  {
    id: "2",
    type: "transfer",
    name: "Notification 2",
    description: "Description 2",
    status: "ERROR",
    unseen: true,
  },
  {
    id: "3",
    type: "transfer",
    name: "Notification 3",
    description: "Description 3",
    status: "RUNNING",
  },
];

describe("NotificationDropdown", () => {
  it("renders the bell icon", () => {
    render(<NotificationDropdown items={[]} onClose={() => {}} />);
    expect(TestUtils.select("NotificationDropdown__BellIcon")).toBeTruthy();
  });

  it("shows items on click", async () => {
    render(<NotificationDropdown items={ITEMS} onClose={() => {}} />);
    await act(async () => {
      TestUtils.select("NotificationDropdown__Icon")!.click();
    });
    const listItems = TestUtils.selectAll("NotificationDropdown__ListItem");
    expect(listItems[0].getAttribute("to")).toBe(
      `/${ITEMS[0].type}s/${ITEMS[0].id}`,
    );
    expect(listItems[1].getAttribute("to")).toBe(
      `/${ITEMS[1].type}s/${ITEMS[1].id}`,
    );
    expect(listItems[2].getAttribute("to")).toBe(
      `/${ITEMS[2].type}s/${ITEMS[2].id}/executions`,
    );
    expect(
      TestUtils.select("NotificationDropdown__ItemTransferBadge", listItems[2])!
        .textContent,
    ).toBe("TR");
    expect(
      TestUtils.select("NotificationDropdown__ItemTitle", listItems[2])!
        .textContent,
    ).toBe(ITEMS[2].name);
    expect(
      TestUtils.select("NotificationDropdown__ItemDescription", listItems[2])!
        .textContent,
    ).toBe(ITEMS[2].description);
  });

  it("fires onClose on item click", async () => {
    const onClose = jest.fn();
    render(<NotificationDropdown items={ITEMS} onClose={onClose} />);
    await act(async () => {
      TestUtils.select("NotificationDropdown__Icon")!.click();
    });
    await act(async () => {
      TestUtils.selectAll("NotificationDropdown__ListItem")[1].click();
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("renders unseed badge", async () => {
    render(<NotificationDropdown items={ITEMS} onClose={() => {}} />);
    await act(async () => {
      TestUtils.select("NotificationDropdown__Icon")!.click();
    });
    const listItems = TestUtils.selectAll("NotificationDropdown__ListItem");
    expect(
      TestUtils.select("NotificationDropdown__Badge", listItems[0]),
    ).toBeFalsy();
    expect(
      TestUtils.select("NotificationDropdown__Badge", listItems[1]),
    ).toBeTruthy();
  });

  it("renders loading when item is RUNNING", () => {
    const { rerender } = render(
      <NotificationDropdown items={ITEMS} onClose={() => {}} />,
    );
    expect(TestUtils.select("NotificationDropdown__Loading")).toBeTruthy();
    rerender(
      <NotificationDropdown
        items={ITEMS.map(item => ({ ...item, status: "COMPLETED" }))}
        onClose={() => {}}
      />,
    );
    expect(TestUtils.select("NotificationDropdown__Loading")).toBeFalsy();
  });
});
