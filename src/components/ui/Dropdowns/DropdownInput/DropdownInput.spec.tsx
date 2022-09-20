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
import userEvent from "@testing-library/user-event";

import TestUtils from "@tests/TestUtils";

import DropdownInput from ".";

const ITEMS = [
  { label: "Item 1", value: "item-1" },
  { label: "Item 2", value: "item-2" },
  { label: "Item 3", value: "item-3" },
];

describe("DropdownInput", () => {
  it("renders with the correct item label", () => {
    render(
      <DropdownInput
        items={ITEMS}
        selectedItem={ITEMS[1].value}
        onInputChange={() => {}}
        onItemChange={() => {}}
        inputValue="test"
      />
    );
    expect(TestUtils.select("DropdownLink__Label")?.textContent).toBe("Item 2");
    expect(TestUtils.selectInput("TextInput__Input")!.value).toBe("test");
  });

  it("fires input change", () => {
    const onInputChange = jest.fn();
    render(
      <DropdownInput
        items={ITEMS}
        selectedItem={ITEMS[1].value}
        onInputChange={onInputChange}
        onItemChange={() => {}}
        inputValue="test"
      />
    );
    userEvent.type(TestUtils.select("TextInput__Input")!, "test2");
    expect(onInputChange).toHaveBeenCalledWith("test2");
  });

  it("fires item change", () => {
    const onItemChange = jest.fn();
    render(
      <DropdownInput
        items={ITEMS}
        selectedItem={ITEMS[1].value}
        onInputChange={() => {}}
        onItemChange={onItemChange}
        inputValue="test"
      />
    );
    userEvent.click(TestUtils.select("DropdownLink__Label")!);
    userEvent.click(TestUtils.selectAll("DropdownLink__ListItem-")[1]);
    expect(onItemChange).toHaveBeenCalledWith(ITEMS[1]);
  });
});
