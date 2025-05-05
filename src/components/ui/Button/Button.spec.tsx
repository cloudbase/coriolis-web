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
import TestUtils from "@tests/TestUtils";
import { ThemePalette } from "@src/components/Theme";
import Button from "./Button";

describe("Button", () => {
  it("should render with different style props", () => {
    const { rerender } = render(<Button disabled />);
    expect(
      document.querySelector("button")?.hasAttribute("disabled"),
    ).toBeTruthy();
    expect(
      TestUtils.rgbToHex(
        window.getComputedStyle(document.querySelector("button")!)
          .backgroundColor,
      ),
    ).toBe(ThemePalette.primary);

    rerender(<Button secondary />);
    expect(
      TestUtils.rgbToHex(
        window.getComputedStyle(document.querySelector("button")!)
          .backgroundColor,
      ),
    ).toBe(ThemePalette.secondaryLight);
  });

  it("fires click", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick} />);
    document.querySelector("button")?.click();
    expect(onClick).toHaveBeenCalled();
  });
});
