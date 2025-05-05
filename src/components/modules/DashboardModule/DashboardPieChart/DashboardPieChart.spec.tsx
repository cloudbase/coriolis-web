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

import { fireEvent, render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import DashboardPieChart from "./DashboardPieChart";

describe("DashboardPieChart", () => {
  const fireMouseMove = (
    element: HTMLElement,
    options: MouseEventInit & {
      offsetX?: number;
      offsetY?: number;
    } = {},
  ) => {
    const mouseMoveEvent = new MouseEvent("mousemove", {
      bubbles: true,
      cancelable: true,
      ...options,
    });
    Object.assign(mouseMoveEvent, {
      offsetX: options.offsetX,
      offsetY: options.offsetY,
    });
    element.dispatchEvent(mouseMoveEvent);
  };

  it("calls drawChart on mount", () => {
    const spy = jest.spyOn(DashboardPieChart.prototype, "drawChart");
    render(<DashboardPieChart size={100} data={[]} colors={[]} />);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("adds and removes event listeners on mount/unmount", () => {
    const spyAdd = jest.spyOn(HTMLCanvasElement.prototype, "addEventListener");
    const spyRemove = jest.spyOn(
      HTMLCanvasElement.prototype,
      "removeEventListener",
    );
    const { unmount } = render(
      <DashboardPieChart size={100} data={[]} colors={[]} />,
    );
    expect(spyAdd).toHaveBeenCalledWith("mousemove", expect.any(Function));
    expect(spyAdd).toHaveBeenCalledWith("mouseleave", expect.any(Function));
    unmount();
    expect(spyRemove).toHaveBeenCalledWith("mousemove", expect.any(Function));
    expect(spyRemove).toHaveBeenCalledWith("mouseleave", expect.any(Function));
  });

  it("handleMouseMove triggers onMouseOver if item is detected", () => {
    const onMouseOverMock = jest.fn();
    jest
      .spyOn(CanvasRenderingContext2D.prototype, "isPointInPath")
      .mockReturnValue(true);

    render(
      <DashboardPieChart
        size={100}
        data={[{ value: 50 }]}
        colors={["#FFF"]}
        onMouseOver={onMouseOverMock}
      />,
    );
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    fireMouseMove(canvas, { offsetX: 50, offsetY: 50 });
    expect(onMouseOverMock).toHaveBeenCalled();
  });

  it("handleMouseMove triggers onMouseLeave if no item is detected and has mouseOver", () => {
    const onMouseLeaveMock = jest.fn();
    jest
      .spyOn(CanvasRenderingContext2D.prototype, "isPointInPath")
      .mockReturnValue(false);

    render(
      <DashboardPieChart
        size={100}
        data={[{ value: 50 }]}
        colors={["#FFF"]}
        onMouseLeave={onMouseLeaveMock}
        onMouseOver={() => {}}
      />,
    );
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    fireMouseMove(canvas, { offsetX: 50, offsetY: 50 });
    expect(onMouseLeaveMock).toHaveBeenCalled();
  });

  it("doesn't throw if onMouseLeave is not provided", () => {
    jest
      .spyOn(CanvasRenderingContext2D.prototype, "isPointInPath")
      .mockReturnValue(false);

    render(
      <DashboardPieChart
        size={100}
        data={[{ value: 50 }]}
        colors={["#FFF"]}
        onMouseOver={() => {}}
      />,
    );
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    fireEvent.mouseLeave(canvas);
  });

  it("handleMouseLeave triggers onMouseLeave", () => {
    const onMouseLeaveMock = jest.fn();
    render(
      <DashboardPieChart
        size={100}
        data={[]}
        colors={[]}
        onMouseLeave={onMouseLeaveMock}
      />,
    );
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    fireEvent.mouseLeave(canvas);
    expect(onMouseLeaveMock).toHaveBeenCalled();
  });

  it("drawChart is called when props are updated", () => {
    const { rerender } = render(
      <DashboardPieChart size={100} data={[]} colors={["#FFF"]} />,
    );
    const spy = jest.spyOn(DashboardPieChart.prototype, "drawChart");
    rerender(
      <DashboardPieChart
        size={200}
        data={[{ value: 50 }, { value: 100 }]}
        colors={["#FFF", "#000"]}
      />,
    );
    expect(spy).toHaveBeenCalled();
  });

  it("renders Canvas, OuterShadow, and InnerShadow if holeStyle is provided", () => {
    render(
      <DashboardPieChart
        size={100}
        data={[]}
        colors={[]}
        holeStyle={{ radius: 10, color: "#fff" }}
      />,
    );
    expect(document.querySelector("canvas")).toBeTruthy();
    expect(TestUtils.select("DashboardPieChart__OuterShadow")).toBeTruthy();
    expect(TestUtils.select("DashboardPieChart__InnerShadow")).toBeTruthy();
  });

  it("renders Canvas and OuterShadow without InnerShadow if holeStyle is not provided", () => {
    render(<DashboardPieChart size={100} data={[]} colors={[]} />);

    expect(document.querySelector("canvas")).toBeTruthy();
    expect(TestUtils.select("DashboardPieChart__OuterShadow")).toBeTruthy();
    expect(TestUtils.select("DashboardPieChart__InnerShadow")).toBeFalsy();
  });

  it("does not add event listeners when canvas is null", () => {
    const spyAdd = jest.spyOn(HTMLCanvasElement.prototype, "addEventListener");

    const instance = new DashboardPieChart({ size: 100, data: [], colors: [] });
    instance.canvas = null;
    instance.componentDidMount();

    expect(spyAdd).not.toHaveBeenCalled();
  });

  it("does not remove event listeners when canvas is null", () => {
    const spyRemove = jest.spyOn(
      HTMLCanvasElement.prototype,
      "removeEventListener",
    );

    const instance = new DashboardPieChart({ size: 100, data: [], colors: [] });
    instance.canvas = null;
    instance.componentWillUnmount();

    expect(spyRemove).not.toHaveBeenCalled();
  });

  it("does not attempt to draw on the canvas when canvas is null", () => {
    const instance = new DashboardPieChart({ size: 100, data: [], colors: [] });
    instance.canvas = null;
    const ctxSpy = jest.spyOn(HTMLCanvasElement.prototype, "getContext");

    instance.drawChart();

    expect(ctxSpy).not.toHaveBeenCalled();
  });

  it("does not detect hits when canvas is null", () => {
    const instance = new DashboardPieChart({ size: 100, data: [], colors: [] });
    instance.canvas = null;
    const result = instance.detectHit(50, 50);
    expect(result).toBeNull();
  });

  it("does not handle mouse move if there's no mouse over", () => {
    const detectHit = jest.spyOn(DashboardPieChart.prototype, "detectHit");

    render(<DashboardPieChart size={100} data={[]} colors={[]} />);
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    fireMouseMove(canvas, { offsetX: 50, offsetY: 50 });
    expect(detectHit).not.toHaveBeenCalled();
  });

  it("does not evenly divide angles when sum is not 0", () => {
    const data = [{ value: 50 }, { value: 30 }, { value: 20 }];
    const component = new DashboardPieChart({
      size: 100,
      data,
      colors: ["#FFF", "#000", "#AAA"],
    });
    component.canvas = document.createElement("canvas");
    component.drawChart();
    const expectedAngles = [Math.PI, Math.PI * 0.6, Math.PI * 0.4];
    expect(component.angles).toEqual(expectedAngles);
  });

  it("evenly divides angles when sum is 0", () => {
    const data = [{ value: 0 }, { value: 0 }, { value: 0 }];
    const component = new DashboardPieChart({
      size: 100,
      data,
      colors: ["#FFF", "#000", "#AAA"],
    });
    component.canvas = document.createElement("canvas");
    component.drawChart();
    const expectedAngles = Array(3).fill(Math.PI * (1 / 3) * 2); // Three items, so each gets 1/3 of the circle.
    expect(component.angles).toEqual(expectedAngles);
  });

  it("returns null from detectHit when canvas context is not available", () => {
    const instance = new DashboardPieChart({ size: 100, data: [], colors: [] });
    instance.canvas = document.createElement("canvas");
    instance.canvas.getContext = () => null;
    const result = instance.detectHit(50, 50);
    expect(result).toBeNull();
  });

  it("returns from drawChart when canvas context is not available", () => {
    const beginPatchSpy = jest.spyOn(
      CanvasRenderingContext2D.prototype,
      "beginPath",
    );
    const instance = new DashboardPieChart({ size: 100, data: [], colors: [] });
    instance.canvas = document.createElement("canvas");
    instance.canvas.getContext = () => null;
    instance.drawChart();
    expect(beginPatchSpy).not.toHaveBeenCalled();
  });

  it("checks the hole in detectHit if holeStyle is provided, returning null if point is in path", () => {
    jest
      .spyOn(CanvasRenderingContext2D.prototype, "isPointInPath")
      .mockReturnValue(true);
    const instance = new DashboardPieChart({
      size: 100,
      data: [],
      colors: [],
      holeStyle: { radius: 10, color: "#fff" },
    });
    instance.canvas = document.createElement("canvas");
    const result = instance.detectHit(50, 50);
    expect(result).toBeNull();
  });

  it("calls customRef when provided", () => {
    const customRefMock = jest.fn();
    render(
      <DashboardPieChart
        size={100}
        data={[]}
        colors={[]}
        customRef={customRefMock}
      />,
    );
    expect(customRefMock).toHaveBeenCalledTimes(1);
    expect(customRefMock.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
  });
});
