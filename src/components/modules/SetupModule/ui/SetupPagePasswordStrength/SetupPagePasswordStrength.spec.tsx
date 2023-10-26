/*
Copyright (C) 2023  Cloudbase Solutions SRL
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

import { ThemePalette } from "@src/components/Theme";
import { render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import SetupPagePasswordStrength from "./";

describe("SetupPagePasswordStrength", () => {
  let defaultProps: SetupPagePasswordStrength["props"];

  beforeEach(() => {
    defaultProps = {
      value: "password",
    };
  });

  it("renders without crashing", () => {
    render(<SetupPagePasswordStrength {...defaultProps} />);
    expect(TestUtils.select("SetupPagePasswordStrength__Wrapper")).toBeTruthy();
  });

  it.each`
    password            | status           | color
    ${"a"}              | ${"VERY_WEAK"}   | ${ThemePalette.alert}
    ${"A###d1!"}        | ${"WEAK"}        | ${ThemePalette.alert}
    ${"A###$d123!"}     | ${"REASONABLE"}  | ${ThemePalette.warning}
    ${"AmweyQe$d123!"}  | ${"STRONG"}      | ${"#758400"}
    ${"AmwueyQe$d123!"} | ${"VERY_STRONG"} | ${"green"}
  `("renders $color for $status password: $password", ({ password, color }) => {
    render(<SetupPagePasswordStrength value={password} />);
    const bar = TestUtils.select("SetupPagePasswordStrength__Bar")!;
    const background = window.getComputedStyle(bar).background;
    expect(TestUtils.rgbToHex(background)).toBe(color);
  });
});
