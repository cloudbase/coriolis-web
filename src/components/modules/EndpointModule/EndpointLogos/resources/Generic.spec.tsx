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

import Generic from "./Generic";

describe("Generic", () => {
  let defaultProps: Generic["props"];

  beforeEach(() => {
    defaultProps = {
      name: "Generic",
      size: { w: 64, h: 64 },
      disabled: false,
      white: false,
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<Generic {...defaultProps} />);
    expect(getByText(defaultProps.name)).toBeTruthy();
  });

  it.each`
    height | expectedFontSize
    ${32}  | ${"14px"}
    ${42}  | ${"18px"}
  `(
    "renders with height $height and font size $expectedFontSize",
    ({ height, expectedFontSize }) => {
      render(<Generic {...defaultProps} size={{ w: height, h: height }} />);
      const wrapper = TestUtils.select("Generic__Wrapper")!;
      const style = window.getComputedStyle(wrapper);
      expect(style.fontSize).toBe(expectedFontSize);
    }
  );

  it.each`
    height | expectedLogoWidth | expectedLogoHeight
    ${64}  | ${"49px"}         | ${"43px"}
    ${128} | ${"80px"}         | ${"70px"}
  `(
    "renders with height $height and logo width $expectedLogoWidth and logo height $expectedLogoHeight",
    ({ height, expectedLogoWidth, expectedLogoHeight }) => {
      render(<Generic {...defaultProps} size={{ w: height, h: height }} />);
      const wrapper = TestUtils.select("Generic__Logo")!;
      const style = window.getComputedStyle(wrapper);
      expect(style.maxWidth).toBe(expectedLogoWidth);
      expect(style.maxHeight).toBe(expectedLogoHeight);
    }
  );

  it("renders 32px with white color", () => {
    render(<Generic {...defaultProps} size={{ w: 32, h: 32 }} white />);
    const wrapper = TestUtils.select("Generic__Wrapper")!;
    const style = window.getComputedStyle(wrapper);
    expect(style.color).toBe("white");
  });

  it("renders 128px with disabled color", () => {
    render(<Generic {...defaultProps} size={{ w: 128, h: 128 }} disabled />);
    const wrapper = TestUtils.select("Generic__Wrapper")!;
    const style = window.getComputedStyle(wrapper);
    expect(TestUtils.rgbToHex(style.color)).toBe(ThemePalette.grayscale[3]);
  });

  it("doesn't render unsupported size", () => {
    const { container } = render(
      <Generic {...defaultProps} size={{ w: 100, h: 100 }} />
    );
    expect(container.firstChild).toBeNull();
  });
});
