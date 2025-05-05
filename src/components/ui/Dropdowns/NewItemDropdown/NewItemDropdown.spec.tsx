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
import NewItemDropdown from ".";

jest.mock("react-router", () => ({
  Link: "div",
}));

describe("NewItemDropdown", () => {
  it("renders new button", () => {
    render(<NewItemDropdown onChange={() => {}} />);
    expect(TestUtils.select("DropdownButton__Label")?.textContent).toBe("New");
  });

  it("fires change", () => {
    const onChange = jest.fn();
    render(<NewItemDropdown onChange={onChange} />);
    act(() => {
      TestUtils.select("DropdownButton__Wrapper")!.click();
    });
    act(() => {
      TestUtils.selectAll("NewItemDropdown__ListItem")[2].click();
    });
    expect(onChange).toBeCalledWith(
      expect.objectContaining({ value: "minionPool" }),
    );
  });

  it("has list items with 'to' property", () => {
    render(<NewItemDropdown onChange={() => {}} />);
    act(() => {
      TestUtils.select("DropdownButton__Wrapper")!.click();
    });
    const listItems = TestUtils.selectAll("NewItemDropdown__ListItem");
    expect(listItems[0].getAttribute("to")).toBe("/wizard/migration");
    expect(listItems[1].getAttribute("to")).toBe("#");
  });
});
