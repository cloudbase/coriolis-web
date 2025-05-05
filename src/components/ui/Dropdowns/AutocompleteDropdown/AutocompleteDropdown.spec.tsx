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
import userEvent from "@testing-library/user-event";
import TestUtils from "@tests/TestUtils";
import AutocompleteDropdown from "./AutocompleteDropdown";

const ITEMS = [
  { label: "Label A 1", value: "item 1" },
  { label: "Label A 2", value: "item 2" },
  { label: "Label B 3", value: "item 3" },
  { label: "Label B 4", value: "item 4" },
  { label: "Label B 5", value: "item 5" },
];

describe("AutocompleteDropdown", () => {
  it("renders", () => {
    render(<AutocompleteDropdown />);
    expect(TestUtils.select("AutocompleteDropdown__Wrapper")).toBeTruthy();
  });

  it("autocompletes a search value", () => {
    render(<AutocompleteDropdown items={ITEMS} />);
    userEvent.type(document.querySelector("input")!, "Label B");

    expect(TestUtils.selectAll("AutocompleteDropdown__ListItem-").length).toBe(
      3,
    );
    TestUtils.selectAll("AutocompleteDropdown__ListItem-").forEach(item => {
      expect(item.textContent).toContain("Label B");
    });
  });

  it("fires change on autocomplete item click", async () => {
    const onChange = jest.fn();
    render(<AutocompleteDropdown items={ITEMS} onChange={onChange} />);
    userEvent.type(document.querySelector("input")!, "Label B");

    await act(async () => {
      TestUtils.selectAll("AutocompleteDropdown__ListItem-")[1].click();
    });

    expect(onChange).toHaveBeenCalledWith(ITEMS[3]);
  });

  it("display message if no items were found", () => {
    render(
      <AutocompleteDropdown items={ITEMS} noItemsMessage="No results found!" />,
    );
    userEvent.type(document.querySelector("input")!, "Label Z");
    expect(
      TestUtils.select("AutocompleteDropdown__SearchNotFound")?.textContent,
    ).toBe("No results found!");
  });

  it("shows selected item", () => {
    render(<AutocompleteDropdown items={ITEMS} selectedItem={ITEMS[1]} />);
    expect(document.querySelector("input")?.value).toBe(ITEMS[1].label);
  });
});
