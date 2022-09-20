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
import TextInput from ".";

describe("TextInput", () => {
  it("renders required", () => {
    const { rerender } = render(<TextInput />);
    expect(TestUtils.select("TextInput__Required")).toBeFalsy();
    rerender(<TextInput required />);
    expect(TestUtils.select("TextInput__Required")).toBeTruthy();
  });

  it("renders highlight", () => {
    const { rerender } = render(<TextInput />);
    const getBorderColor = () =>
      window
        .getComputedStyle(TestUtils.select("TextInput__Input")!)
        .borderColor.toUpperCase();
    expect(getBorderColor()).toBe(ThemePalette.grayscale[3]);

    rerender(<TextInput highlight />);
    expect(getBorderColor()).toBe(ThemePalette.alert);
  });

  it("shows close", () => {
    const { rerender } = render(<TextInput value="" onChange={() => {}} />);
    const getCloseEl = () => TestUtils.select("TextInput__Close")!;
    const getDisplay = () => window.getComputedStyle(getCloseEl()).display;
    expect(getDisplay()).toBe("none");

    rerender(<TextInput showClose value="" onChange={() => {}} />);
    expect(getDisplay()).toBe("none");

    const onCloseClick = jest.fn();
    rerender(
      <TextInput
        showClose
        onCloseClick={onCloseClick}
        value="sample"
        onChange={() => {}}
      />
    );
    expect(getDisplay()).toBe("block");
    getCloseEl().click();
    expect(onCloseClick).toHaveBeenCalled();
  });

  it("renders password", () => {
    const { rerender } = render(<TextInput />);
    expect(TestUtils.selectInput("TextInput__Input")!.type).toBe("text");

    rerender(<TextInput type="password" />);
    expect(TestUtils.selectInput("TextInput__Input")!.type).toBe("password");
  });
});
