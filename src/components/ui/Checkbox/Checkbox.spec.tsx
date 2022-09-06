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
import Checkbox from "./Checkbox";

describe("Checkbox", () => {
  it("dispatches change on space key", () => {
    const onChange = jest.fn();
    const { rerender } = render(<Checkbox onChange={onChange} />);
    userEvent.type(TestUtils.select("Checkbox__Wrapper")!, " ");
    expect(onChange).toHaveBeenCalledWith(true);
    rerender(<Checkbox onChange={onChange} checked />);
    userEvent.type(TestUtils.select("Checkbox__Wrapper")!, " ");
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("doesn't dispatch change if disabled", () => {
    const onChange = jest.fn();
    render(<Checkbox onChange={onChange} disabled />);
    userEvent.type(TestUtils.select("Checkbox__Wrapper")!, " ");
    expect(onChange).not.toHaveBeenCalled();
  });
});
