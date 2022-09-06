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
import { ThemeProps } from "@src/components/Theme";
import TextArea from ".";

describe("TextArea", () => {
  it("renders required", () => {
    const { rerender } = render(<TextArea required />);
    expect(TestUtils.select("TextArea__Required")).toBeTruthy();
    rerender(<TextArea />);
    expect(TestUtils.select("TextArea__Required")).toBeFalsy();
  });

  it("renders with different widths", () => {
    const { rerender } = render(<TextArea />);
    const getWidth = () =>
      window.getComputedStyle(TestUtils.select("TextArea__Input")!).width;
    expect(getWidth()).toBe(`${ThemeProps.inputSizes.regular.width}px`);

    rerender(<TextArea large />);
    expect(getWidth()).toBe(`${ThemeProps.inputSizes.large.width}px`);

    rerender(<TextArea width="123px" />);
    expect(getWidth()).toBe("123px");
  });
});
