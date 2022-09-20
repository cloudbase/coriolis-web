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
import LoadingButton from "@src/components/ui/LoadingButton";
import TestUtils from "@tests/TestUtils";

describe("LoadingButton", () => {
  it("shows the label and rotation animation", () => {
    render(<LoadingButton>Testing ...</LoadingButton>);
    expect(TestUtils.select("Button__StyledButton")!.textContent).toBe(
      "Testing ..."
    );
    const style = window.getComputedStyle(
      TestUtils.select("LoadingButton__Loading")!
    );
    expect(style.animation).toContain("rotate");
  });

  it("doesn't fire click on click", () => {
    const onClick = jest.fn();
    render(<LoadingButton onClick={onClick}>Testing ...</LoadingButton>);
    TestUtils.select("Button__StyledButton")!.click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
