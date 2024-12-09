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

import React from "react";
import { render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";
import { NotificationItemData } from "@src/@types/NotificationItem";
import progressImage from "@src/components/ui/StatusComponents/StatusIcon/images/progress";
import { ThemePalette } from "@src/components/Theme";
import DashboardActivity from ".";

const encodedProgressImage = encodeURIComponent(
  progressImage(ThemePalette.grayscale[3], ThemePalette.primary)
);

jest.mock("react-router-dom", () => ({ Link: "a" }));

const ITEMS: NotificationItemData[] = [
  {
    id: "1",
    type: "replica",
    status: "ERROR",
    name: "Replica 1",
    description: "Replica 1 description",
  },
  {
    id: "2",
    type: "migration",
    status: "RUNNING",
    name: "Migration 1",
    description: "Migration 1 description",
  },
  {
    id: "3",
    type: "migration",
    status: "COMPLETED",
    name: "Migration 2",
    description: "Migration 2 description",
  },
];

describe("DashboardActivity", () => {
  it("renders no recent activity", () => {
    render(<DashboardActivity notificationItems={[]} />);
    expect(
      TestUtils.select("DashboardActivity__Message")!.textContent
    ).toContain("There is no recent activity");
  });

  it("fires new click", () => {
    const onNewClick = jest.fn();
    render(
      <DashboardActivity notificationItems={[]} onNewClick={onNewClick} />
    );
    TestUtils.select("Button__StyledButton")!.click();
    expect(onNewClick).toHaveBeenCalled();
  });

  it("renders loading", () => {
    const { rerender } = render(
      <DashboardActivity notificationItems={[]} loading />
    );
    expect(TestUtils.select("DashboardActivity__LoadingWrapper")).toBeTruthy();

    rerender(<DashboardActivity notificationItems={[]} />);
    expect(TestUtils.select("DashboardActivity__LoadingWrapper")).toBeFalsy();
  });

  it("renders all items", () => {
    render(<DashboardActivity notificationItems={ITEMS} />);

    const listItemsEl = TestUtils.selectAll("DashboardActivity__ListItem");
    expect(listItemsEl.length).toBe(ITEMS.length);
  });

  it.each`
    idx  | href                | expectedStatusIcon
    ${0} | ${"/deployments/1"} | ${"error-hollow.svg"}
    ${1} | ${"/deployments/2"} | ${encodedProgressImage}
    ${2} | ${"/deployments/3"} | ${"success-hollow.svg"}
  `("renders item with href $href", ({ idx, href, expectedStatusIcon }) => {
    render(<DashboardActivity notificationItems={ITEMS} />);

    const itemElement = TestUtils.selectAll("DashboardActivity__ListItem")[idx];
    expect(itemElement.getAttribute("to")).toBe(href);

    const background = window.getComputedStyle(
      TestUtils.select("StatusIcon__Wrapper", itemElement)!
    ).background;
    expect(background).toContain(expectedStatusIcon);

    expect(
      TestUtils.select("NotificationDropdown__ItemTransferBadge", itemElement)!
        .textContent
    ).toContain(ITEMS[idx].type === "transfer" ? "TR" : "DE");
    expect(
      TestUtils.select("NotificationDropdown__ItemTitle", itemElement)!
        .textContent
    ).toContain(ITEMS[idx].name);
    expect(
      TestUtils.select("NotificationDropdown__ItemDescription", itemElement)!
        .textContent
    ).toContain(ITEMS[idx].description);
  });
});
