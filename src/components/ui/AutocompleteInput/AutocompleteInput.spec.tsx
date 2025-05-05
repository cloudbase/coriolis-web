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
import AutocompleteInput from "./AutocompleteInput";

describe("AutocompleteInput", () => {
  it("renders correct data", () => {
    render(<AutocompleteInput value="searching" onChange={() => {}} />);
    expect(TestUtils.selectInput("TextInput__Input")!.value).toBe("searching");
  });

  it("calls focus and blur", () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(
      <AutocompleteInput
        value=""
        onChange={() => {}}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );
    const inputElement = TestUtils.select("TextInput__Input");
    act(() => {
      inputElement?.focus();
    });
    expect(onFocus).toHaveBeenCalled();
    act(() => {
      inputElement?.blur();
    });
    expect(onBlur).toHaveBeenCalled();
  });
});
