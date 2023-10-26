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

import { ThemePalette } from "@src/components/Theme";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TestUtils from "@tests/TestUtils";

import DashboardBarChart from "./";

const DATA: DashboardBarChart["props"]["data"] = [
  {
    label: "label 1",
    values: [10, 15],
    data: "data 1",
  },
  {
    label: "label 2",
    values: [20, 25],
    data: "data 2",
  },
];

describe("DashboardBarChart", () => {
  it("renders all data correctly", () => {
    render(<DashboardBarChart data={DATA} yNumTicks={3} />);

    // Y ticks

    const yTickEl = TestUtils.selectAll("DashboardBarChart__YTick");
    expect(yTickEl.length).toBe(3);
    expect(yTickEl[0].textContent).toBe("0");
    expect(yTickEl[1].textContent).toBe("20");
    expect(yTickEl[2].textContent).toBe("40");

    // Bars

    const barsEl = TestUtils.selectAll("DashboardBarChart__Bar-");
    expect(barsEl.length).toBe(DATA.length);
    expect(barsEl[0].textContent).toBe("label 1");
    expect(barsEl[1].textContent).toBe("label 2");
  });

  it.each`
    barIndex | stackedBarIndex | expectedHeight                    | expectedColor
    ${0}     | ${0}            | ${(DATA[0].values[1] / 45) * 100} | ${ThemePalette.alert}
    ${0}     | ${1}            | ${(DATA[0].values[0] / 45) * 100} | ${ThemePalette.primary}
    ${1}     | ${0}            | ${(DATA[1].values[1] / 45) * 100} | ${ThemePalette.alert}
    ${1}     | ${1}            | ${(DATA[1].values[0] / 45) * 100} | ${ThemePalette.primary}
  `(
    "renders bar index $barIndex, stacked bar index $stackedBarIndex with height $expectedHeight and color $expectedColor",
    ({ barIndex, stackedBarIndex, expectedHeight, expectedColor }) => {
      render(
        <DashboardBarChart
          data={DATA}
          yNumTicks={3}
          colors={[ThemePalette.alert, ThemePalette.primary]}
        />
      );

      const stackedBarEl = TestUtils.selectAll(
        "DashboardBarChart__StackedBar-",
        TestUtils.selectAll("DashboardBarChart__Bar-")[barIndex]
      )[stackedBarIndex];
      const style = window.getComputedStyle(stackedBarEl);

      expect(parseFloat(style.height)).toBeCloseTo(expectedHeight);
      expect(TestUtils.rgbToHex(style.background)).toBe(expectedColor);
    }
  );

  it.each`
    barIndex | stackedBarIndex | expectedData
    ${0}     | ${0}            | ${DATA[0]}
    ${0}     | ${1}            | ${DATA[0]}
    ${1}     | ${0}            | ${DATA[1]}
    ${1}     | ${1}            | ${DATA[1]}
  `(
    "fires mouse position with correct data on bar mouse enter, bar index $barIndex, stacked bar index $stackedBarIndex",
    ({ barIndex, stackedBarIndex, expectedData }) => {
      const onBarMouseEnter = jest.fn();
      render(
        <DashboardBarChart
          data={DATA}
          yNumTicks={3}
          onBarMouseEnter={onBarMouseEnter}
        />
      );
      userEvent.hover(
        TestUtils.selectAll(
          "DashboardBarChart__StackedBar-",
          TestUtils.selectAll("DashboardBarChart__Bar-")[barIndex]
        )[stackedBarIndex]
      );
      expect(onBarMouseEnter).toHaveBeenCalledWith(
        { x: 48, y: 65 },
        expectedData
      );
    }
  );

  it("does not render bars with height of 0%", () => {
    const ZERO_DATA = [
      {
        label: "label 1",
        values: [0, 0],
      },
      {
        label: "label 2",
        values: [20, 25],
      },
    ];

    render(<DashboardBarChart data={ZERO_DATA} yNumTicks={3} />);

    const firstStackedBars = TestUtils.selectAll(
      "DashboardBarChart__StackedBar-",
      TestUtils.selectAll("DashboardBarChart__Bar-")[0]
    );
    const secondStackedBars = TestUtils.selectAll(
      "DashboardBarChart__StackedBar-",
      TestUtils.selectAll("DashboardBarChart__Bar-")[1]
    );

    expect(firstStackedBars.length).toBe(0);
    expect(secondStackedBars.length).toBe(ZERO_DATA[1].values.length);
  });

  it("renders half the bars if available width is less than 30 times the number of items", () => {
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 29 * DATA.length,
    });

    render(<DashboardBarChart data={DATA} yNumTicks={3} />);

    const bars = TestUtils.selectAll("DashboardBarChart__Bar-");

    expect(bars.length).toBe(DATA.length / 2);

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it("fires the onBarMouseLeave callback on bar mouse leave", () => {
    const onBarMouseLeave = jest.fn();

    render(
      <DashboardBarChart
        data={DATA}
        yNumTicks={3}
        onBarMouseLeave={onBarMouseLeave}
      />
    );

    const bar = TestUtils.selectAll("DashboardBarChart__StackedBar-")[0];
    userEvent.unhover(bar);

    expect(onBarMouseLeave).toHaveBeenCalled();
  });

  it("calculates the correct position for bars", () => {
    const onBarMouseEnter = jest.fn();
    render(
      <DashboardBarChart
        data={DATA}
        yNumTicks={3}
        onBarMouseEnter={onBarMouseEnter}
      />
    );

    const firstBar = TestUtils.selectAll("DashboardBarChart__StackedBar-")[0];
    userEvent.hover(firstBar);

    expect(onBarMouseEnter).toHaveBeenCalledWith({ x: 48, y: 65 }, DATA[0]);
  });

  it("recalculates ticks when new data is received", () => {
    const { rerender } = render(
      <DashboardBarChart data={DATA} yNumTicks={3} />
    );

    const bars = TestUtils.selectAll("DashboardBarChart__Bar-");
    expect(bars.length).toBe(DATA.length);
    expect(bars[0].textContent).toBe("label 1");
    expect(bars[1].textContent).toBe("label 2");

    const NEW_DATA = [
      {
        label: "label 3",
        values: [10, 30],
        data: "data 3",
      },
      {
        label: "label 4",
        values: [5, 20],
        data: "data 4",
      },
    ];

    // Mocking the offset width is necessary due to how the rendered
    // output behaves within the @testing-library/react environment
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 500,
    });
    rerender(<DashboardBarChart data={NEW_DATA} yNumTicks={3} />);

    const newBars = TestUtils.selectAll("DashboardBarChart__Bar-");
    expect(newBars.length).toBe(NEW_DATA.length);
    expect(newBars[0].textContent).toBe("label 3");
    expect(newBars[1].textContent).toBe("label 4");
  });

  it("does not fire any function when onBarMouseEnter is not provided", () => {
    render(<DashboardBarChart data={DATA} yNumTicks={3} />);

    const firstStackedBar = TestUtils.selectAll(
      "DashboardBarChart__StackedBar-"
    )[0];
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Hover over the stacked bar
    userEvent.hover(firstStackedBar);

    // Assert that there were no console errors
    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
