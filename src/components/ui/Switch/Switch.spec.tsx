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
import userEvent from "@testing-library/user-event";
import Switch from ".";

describe("Switch", () => {
  it("renders checked and unchecked labels", () => {
    const { rerender } = render(<Switch onChange={() => {}} checked />);
    expect(TestUtils.select("Switch__Label")?.textContent).toBe("Yes");

    rerender(<Switch onChange={() => {}} checked checkedLabel="On" />);
    expect(TestUtils.select("Switch__Label")?.textContent).toBe("On");

    rerender(
      <Switch onChange={() => {}} checked={false} uncheckedLabel="Off" />
    );
    expect(TestUtils.select("Switch__Label")?.textContent).toBe("Off");
  });

  it("dispatches change event", () => {
    const onChange = jest.fn();
    const { rerender } = render(<Switch onChange={onChange} checked />);

    TestUtils.select("Switch__InputWrapper")!.click();
    expect(onChange).toHaveBeenCalledWith(false);

    rerender(<Switch onChange={onChange} checked={false} />);
    TestUtils.select("Switch__InputWrapper")!.click();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("doesn't dispatch change on random key press", () => {
    const onChange = jest.fn();
    render(<Switch onChange={onChange} checked />);
    TestUtils.select("Switch__InputWrapper")!.focus();
    userEvent.keyboard("s");
    expect(onChange).not.toBeCalled();
  });

  it("dispatches change on space key press", () => {
    const onChange = jest.fn();
    render(<Switch onChange={onChange} checked />);
    TestUtils.select("Switch__InputWrapper")!.focus();
    userEvent.keyboard(" ");
    expect(onChange).toBeCalledWith(false);
  });

  it("dispatches null when in tristate mode", () => {
    let value: boolean | null = true;
    const onChange = (newValue: boolean | null) => {
      value = newValue;
    };
    const { rerender } = render(
      <Switch onChange={onChange} checked triState />
    );
    const rerenderWithValue = () => {
      rerender(<Switch onChange={onChange} checked={value} triState />);
    };

    TestUtils.select("Switch__InputWrapper")!.click();
    expect(value).toBe(null);

    rerenderWithValue();
    TestUtils.select("Switch__InputWrapper")!.click();
    expect(value).toBe(false);

    rerenderWithValue();
    TestUtils.select("Switch__InputWrapper")!.click();
    expect(value).toBe(null);

    rerenderWithValue();
    TestUtils.select("Switch__InputWrapper")!.click();
    expect(value).toBe(true);
  });

  it("renders with different background if big", () => {
    const { rerender } = render(<Switch onChange={() => {}} checked />);
    const getBackground = () =>
      TestUtils.rgbToHex(
        window.getComputedStyle(TestUtils.select("Switch__InputBackground")!)
          .background
      );
    expect(getBackground()).toBe(ThemePalette.primary);

    rerender(
      <Switch onChange={() => {}} checked={false} uncheckedColor="yellow" />
    );
    expect(getBackground()).toBe("yellow");

    rerender(<Switch onChange={() => {}} checked big />);
    expect(getBackground()).toBe(ThemePalette.alert);

    rerender(<Switch onChange={() => {}} checked={false} big />);
    expect(getBackground()).toBe(ThemePalette.primary);
  });
});
