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
import { ThemePalette } from "@src/components/Theme";
import TabNavigation from ".";

const TAB_ITEMS = [
  { label: "Tab 1", value: "tab-1" },
  { label: "Tab 2", value: "tab-2" },
  { label: "Tab 3", value: "tab-3" },
];

describe("TabNavigation", () => {
  it("renders tab items and styles the selected item", () => {
    render(
      <TabNavigation
        tabItems={TAB_ITEMS}
        selectedTabValue="tab-2"
        onChange={() => {}}
      >
        <div>Tab 2 content</div>
      </TabNavigation>
    );
    expect(TestUtils.selectAll("TabNavigation__HeaderItem")).toHaveLength(
      TAB_ITEMS.length
    );
    const color = (index: number) =>
      TestUtils.rgbToHex(
        window.getComputedStyle(
          TestUtils.selectAll("TabNavigation__HeaderItem")[index]
        ).color
      );
    expect(color(0)).toBe("");
    expect(color(1)).toBe(ThemePalette.primary);
  });

  it("dispatches change", () => {
    const onChange = jest.fn();
    render(
      <TabNavigation
        tabItems={TAB_ITEMS}
        selectedTabValue="tab-2"
        onChange={onChange}
      >
        <div>Tab 2 content</div>
      </TabNavigation>
    );
    TestUtils.selectAll("TabNavigation__HeaderItem")[2].click();
    expect(onChange).toHaveBeenCalledWith("tab-3");
  });
});
