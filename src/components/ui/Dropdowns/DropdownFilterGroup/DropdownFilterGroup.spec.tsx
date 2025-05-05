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
import DropdownFilterGroup from "@src/components/ui/Dropdowns/DropdownFilterGroup";
import TestUtils from "@tests/TestUtils";

const ITEMS = [
  {
    items: [{ label: "Item B 2", value: "itemb2" }],
    key: "group1",
  },
  {
    items: [
      { label: "Item 1", value: "item1" },
      { label: "Item 2", value: "item2" },
    ],
    key: "group2",
  },
];

describe("DropdownFilterGroup", () => {
  it("renders the correct number of DropdownLink components", () => {
    render(<DropdownFilterGroup items={ITEMS} />);
    expect(TestUtils.selectAll("DropdownLink__Wrapper")).toHaveLength(
      ITEMS.length,
    );
  });

  it("opens the DropdownLink component with the correct items", () => {
    render(<DropdownFilterGroup items={ITEMS} />);
    const dropdownLinks = TestUtils.selectAll("DropdownLink__LinkButton");
    act(() => {
      dropdownLinks[1].click();
    });
    expect(TestUtils.selectAll("DropdownLink__ListItem-")).toHaveLength(
      ITEMS[1].items.length,
    );
    expect(
      TestUtils.selectAll("DropdownLink__ListItemLabel")[1].textContent,
    ).toBe(ITEMS[1].items[1].label);
  });
});
