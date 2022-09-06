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
import DropdownButton from "@src/components/ui/Dropdowns/DropdownButton";
import TestUtils from "@tests/TestUtils";

describe("DropdownButton", () => {
  it("renders the value", () => {
    render(<DropdownButton value="The Value" />);
    expect(TestUtils.select("DropdownButton__Label")?.textContent).toBe(
      "The Value"
    );
  });

  it("fires click on click", () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <DropdownButton value="The Value" onClick={onClick} />
    );
    getByText("The Value").click();
    expect(onClick).toHaveBeenCalled();
  });

  it("doesn't fire click if disabled or disabledLoading", () => {
    const onClick = jest.fn();
    const { getByText, rerender } = render(
      <DropdownButton value="The Value" onClick={onClick} disabled />
    );
    getByText("The Value").click();
    expect(onClick).not.toHaveBeenCalled();
    rerender(
      <DropdownButton value="The Value" onClick={onClick} disabledLoading />
    );
    getByText("The Value").click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
