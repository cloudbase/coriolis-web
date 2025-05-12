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
import TestUtils from "@tests/TestUtils";
import userEvent from "@testing-library/user-event";
import { ThemeProps } from "@src/components/Theme";
import DropdownLink from ".";

const ITEMS = [
  { label: "Item 1", value: "item1" },
  { label: "Item A2", value: "item2" },
  { label: "Item A3", value: "item3" },
];

describe("DropdownLink", () => {
  it("renders select item label", () => {
    render(<DropdownLink selectItemLabel="Select an item" items={ITEMS} />);
    expect(TestUtils.select("DropdownLink__Label")?.textContent).toBe(
      "Select an item",
    );
  });

  it("renders no items label", () => {
    render(<DropdownLink noItemsLabel="No items" items={[]} />);
    expect(TestUtils.select("DropdownLink__Label")?.textContent).toBe(
      "No items",
    );
  });

  it("renders the selected item", () => {
    render(<DropdownLink items={ITEMS} selectedItem={ITEMS[1].value} />);
    expect(TestUtils.select("DropdownLink__Label")?.textContent).toBe(
      ITEMS[1].label,
    );
  });

  it("fires selected item change", async () => {
    const onChange = jest.fn();
    render(<DropdownLink items={ITEMS} onChange={onChange} />);
    await act(async () => {
      TestUtils.select("DropdownLink__LinkButton")?.click();
    });
    await act(async () => {
      TestUtils.selectAll("DropdownLink__ListItem-")[1].click();
    });
    expect(onChange).toBeCalledWith(ITEMS[1]);
  });

  it("can be searchable", async () => {
    render(<DropdownLink items={ITEMS} searchable />);
    await act(async () => {
      TestUtils.select("DropdownLink__LinkButton")?.click();
    });
    const input = TestUtils.selectContains("SearchInput__Input")!;
    userEvent.type(input, "A");
    const listItems = () => TestUtils.selectAll("DropdownLink__ListItem-");
    expect(listItems()).toHaveLength(2);
    expect(listItems()[1].textContent).toBe(ITEMS[2].label);
    userEvent.clear(input);
    userEvent.type(input, "item3");
    expect(listItems()).toHaveLength(1);
    expect(listItems()[0].textContent).toBe(ITEMS[2].label);
    expect(TestUtils.select("DropdownLink__EmptySearch")).toBeFalsy();
    userEvent.clear(input);
    userEvent.type(input, "giberrish");
    expect(listItems()).toHaveLength(0);
    expect(TestUtils.select("DropdownLink__EmptySearch")).toBeTruthy();
  });

  it("highlights the highlighted item", async () => {
    render(<DropdownLink items={ITEMS} highlightedItem={ITEMS[1].value} />);
    await act(async () => {
      TestUtils.select("DropdownLink__LinkButton")?.click();
    });
    const noHighlightStyle = window.getComputedStyle(
      TestUtils.selectAll("DropdownLink__ListItemLabel")[0],
    );
    const highlightStyle = window.getComputedStyle(
      TestUtils.selectAll("DropdownLink__ListItemLabel")[1],
    );
    expect(highlightStyle.fontWeight).not.toBe(noHighlightStyle.fontWeight);
    expect(highlightStyle.fontWeight).toBe(`${ThemeProps.fontWeights.medium}`);
  });
});
