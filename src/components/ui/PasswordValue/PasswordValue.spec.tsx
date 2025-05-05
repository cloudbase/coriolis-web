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
import PasswordValue from "@src/components/ui/PasswordValue";
import TestUtils from "@tests/TestUtils";

describe("PasswordValue", () => {
  it("hides the password", () => {
    render(<PasswordValue value="the_secret" />);
    expect(TestUtils.select("PasswordValue__Value")?.textContent).toBe(
      "•••••••••"
    );
  });
  it("reveals the password on click", () => {
    render(<PasswordValue value="the_secret" />);
    act(() => {
      TestUtils.select("PasswordValue__Value")?.click();
    });
    expect(TestUtils.select("PasswordValue__Value")?.textContent).toBe(
      "the_secret"
    );
  });
});
