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

import { render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import DashboardInfoCount from "./DashboardInfoCount";

jest.mock("react-router", () => ({ Link: "a" }));

describe("DashboardInfoCount", () => {
  const mockData = [
    {
      label: "Label1",
      value: 1,
      color: "red",
      link: "/link1",
      loading: false,
    },
    {
      label: "Label2",
      value: 0,
      color: "blue",
      link: "/link2",
      loading: true,
    },
  ];

  it("renders CountBlock for each data item", () => {
    render(<DashboardInfoCount data={mockData} />);
    expect(
      TestUtils.selectAll("DashboardInfoCount__CountBlockValue-")[0].textContent
    ).toBe("1");
    expect(
      TestUtils.selectAll("DashboardInfoCount__CountBlockLabel-")[0].textContent
    ).toBe("Label1");
    expect(
      TestUtils.selectAll("DashboardInfoCount__CountBlockLabel-")[1].textContent
    ).toBe("Label2");
    // In this case, the value "0" will not be rendered because of the loading state.
  });

  it("renders loading state when item.loading is true and item.value is falsy", () => {
    render(<DashboardInfoCount data={mockData} />);

    expect(
      TestUtils.select(
        "DashboardInfoCount__LoadingWrapper-",
        TestUtils.selectAll("DashboardInfoCount__CountBlock-")[1]
      )
    ).toBeTruthy();
  });

  it("renders CountBlockLabel with the correct color and link", () => {
    render(<DashboardInfoCount data={mockData} />);
    const labels = TestUtils.selectAll("DashboardInfoCount__CountBlockLabel-");

    expect(window.getComputedStyle(labels[0]).color).toBe("red");
    expect(window.getComputedStyle(labels[1]).color).toBe("blue");
    expect(labels[0].attributes.getNamedItem("to")!.value).toBe("/link1");
    expect(labels[1].attributes.getNamedItem("to")!.value).toBe("/link2");
  });
});
