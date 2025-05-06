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
import Dropdown from "@src/components/ui/Dropdowns/Dropdown";
import TestUtils from "@tests/TestUtils";

const ITEMS = [
  { label: "Label A 1", value: "item 1" },
  { label: "Label A 2", value: "item 2" },
  { label: "Label A 2", value: "item 3" },
];

describe("Dropdown", () => {
  it("renders", () => {
    render(<Dropdown items={ITEMS} />);
    expect(TestUtils.select("Dropdown__Wrapper")).toBeTruthy();
  });

  it("opens the dropdown list with the correct number of items", () => {
    render(<Dropdown items={ITEMS} />);
    expect(TestUtils.select("DropdownButton__Label")?.textContent).toBe(
      "Select an item",
    );
    const button = TestUtils.select("DropdownButton__Wrapper");
    expect(button).toBeTruthy();
    act(() => {
      button?.click();
    });
    expect(TestUtils.selectAll("Dropdown__ListItem-").length).toBe(3);
  });

  it("displays duplicated label", () => {
    render(<Dropdown items={ITEMS} />);
    act(() => {
      TestUtils.select("DropdownButton__Wrapper")?.click();
    });
    expect(TestUtils.selectAll("Dropdown__DuplicatedLabel").length).toBe(2);
    const duplicatedItems = [ITEMS[1], ITEMS[2]];
    TestUtils.selectAll("Dropdown__DuplicatedLabel").forEach((item, index) => {
      expect(item.textContent).toBe(`(${duplicatedItems[index].value})`);
    });
  });

  it("renders selected item", () => {
    render(<Dropdown items={ITEMS} selectedItem={ITEMS[0]} />);
    expect(TestUtils.select("DropdownButton__Label")?.textContent).toBe(
      "Label A 1",
    );
  });

  it("fires change on item click", () => {
    const onChange = jest.fn();
    render(<Dropdown items={ITEMS} onChange={onChange} />);
    const button = TestUtils.select("DropdownButton__Wrapper");
    act(() => {
      button!.click();
    });
    const items = TestUtils.selectAll("Dropdown__ListItem-");
    act(() => {
      items[1]!.click();
    });
    expect(onChange).toHaveBeenCalledWith(ITEMS[1]);
  });
});
