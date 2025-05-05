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
import userEvent from "@testing-library/user-event";
import Stepper from ".";

describe("Stepper", () => {
  it("renders input with the default value", () => {
    render(<Stepper />);
    expect(TestUtils.selectInput("Stepper__Input")?.value).toBe("Not Set");
  });

  it("changes input value on step button press", async () => {
    const onChange = jest.fn();
    render(<Stepper value={10} onChange={onChange} />);
    expect(TestUtils.selectInput("Stepper__Input")?.value).toBe("10");

    await act(async () => {
      TestUtils.select("Stepper__StepButtonUp")!.click();
    });
    expect(onChange).toHaveBeenCalledWith(11);

    await act(async () => {
      TestUtils.select("Stepper__StepButtonDown")!.click();
    });
    expect(onChange).toHaveBeenCalledWith(9);
  });

  it("abides by the minimum and maximum", async () => {
    let value: number | null = 13;
    const onChange = (v: number | null) => {
      value = v;
    };
    const { rerender } = render(<Stepper />);
    const rerenderWithValue = () => {
      rerender(
        <Stepper
          value={value === null ? undefined : value}
          onChange={onChange}
          minimum={5}
          maximum={15}
        />
      );
    };

    rerenderWithValue();
    expect(TestUtils.selectInput("Stepper__Input")?.value).toBe("13");
    await act(async () => {
      TestUtils.select("Stepper__StepButtonUp")!.click();
    });
    expect(value).toBe(14);

    rerenderWithValue();
    await act(async () => {
      TestUtils.select("Stepper__StepButtonUp")!.click();
    });
    expect(value).toBe(15);

    rerenderWithValue();
    await act(async () => {
      TestUtils.select("Stepper__StepButtonUp")!.click();
    });
    expect(value).toBe(15);

    rerenderWithValue();
    await act(async () => {
      TestUtils.select("Stepper__StepButtonDown")!.click();
    });
    expect(value).toBe(14);

    value = 7;
    rerenderWithValue();
    await act(async () => {
      TestUtils.select("Stepper__StepButtonDown")!.click();
    });
    expect(value).toBe(6);

    rerenderWithValue();
    await act(async () => {
      TestUtils.select("Stepper__StepButtonDown")!.click();
    });
    expect(value).toBe(5);

    rerenderWithValue();
    await act(async () => {
      TestUtils.select("Stepper__StepButtonDown")!.click();
    });
    expect(value).toBe(5);

    rerenderWithValue();
    await act(async () => {
      TestUtils.select("Stepper__StepButtonUp")!.click();
    });
    expect(value).toBe(6);
  });

  it.each`
    typedValue | dispatchedValue
    ${""}      | ${null}
    ${"10"}    | ${10}
    ${"11"}    | ${10}
    ${"7"}     | ${7}
    ${"3"}     | ${5}
  `(
    "dispatches value $dispatchedValue when typing $typedValue",
    async ({ typedValue, dispatchedValue }) => {
      const inputEl = () => TestUtils.selectInput("Stepper__Input")!;
      const onChange = jest.fn();
      render(
        <Stepper value={10} onChange={onChange} minimum={5} maximum={10} />
      );

      userEvent.clear(inputEl());
      userEvent.paste(inputEl(), typedValue);
      await act(async () => {
        inputEl().blur();
      });
      expect(onChange).toHaveBeenCalledWith(dispatchedValue);
    }
  );

  it("increments and decrements on arrow keys press", async () => {
    const onChange = jest.fn();
    render(<Stepper value={7} onChange={onChange} minimum={5} maximum={10} />);
    const inputEl = () => TestUtils.selectInput("Stepper__Input")!;
    userEvent.type(inputEl(), "{ArrowUp}");
    await act(async () => {
      inputEl().blur();
    });
    expect(onChange).toHaveBeenCalledWith(8);
    userEvent.type(inputEl(), "{ArrowDown}");
    await act(async () => {
      inputEl().blur();
    });
    expect(onChange).toHaveBeenCalledWith(6);
  });
});
