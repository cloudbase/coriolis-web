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
import DropdownFilter from "@src/components/ui/Dropdowns/DropdownFilter";
import TestUtils from "@tests/TestUtils";
import userEvent from "@testing-library/user-event";

describe("DropdownFilter", () => {
  it("renders ", () => {
    render(<DropdownFilter />);
    expect(TestUtils.select("DropdownFilter__Wrapper")).toBeTruthy();
  });

  it("renders the dropdown", () => {
    render(<DropdownFilter />);
    expect(TestUtils.select("SearchInput__Wrapper")).toBeFalsy();
    act(() => {
      TestUtils.select("DropdownFilter__Button")!.click();
    });
    expect(TestUtils.select("SearchInput__Wrapper")).toBeTruthy();
  });

  it("displays the search input value", () => {
    render(<DropdownFilter searchValue="Search Value" />);
    act(() => {
      TestUtils.select("DropdownFilter__Button")!.click();
    });
    expect(TestUtils.selectInput("TextInput__Input")!.value).toBe(
      "Search Value",
    );
  });

  it("fires change on search input value change", () => {
    const onChange = jest.fn();
    render(<DropdownFilter onSearchChange={onChange} />);
    act(() => {
      TestUtils.select("DropdownFilter__Button")!.click();
    });
    userEvent.type(TestUtils.select("TextInput__Input")!, "Search");
    expect(onChange).toBeCalledTimes(6);
    expect(onChange.mock.calls[0][0]).toBe("S");
    expect(onChange.mock.calls[5][0]).toBe("h");
  });
});
