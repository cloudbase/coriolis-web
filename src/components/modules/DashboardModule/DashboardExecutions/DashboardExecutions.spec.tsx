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

import { DateTime } from "luxon";
import React from "react";

import { MigrationItem, TransferItem } from "@src/@types/MainItem";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TestUtils from "@tests/TestUtils";

import DashboardExecutions from "./DashboardExecutions";

type BuildType<T extends "replica" | "migration"> = T extends "replica"
  ? TransferItem
  : MigrationItem;

const buildItem = <T extends "replica" | "migration">(
  type: T,
  date: string
): BuildType<T> => {
  const item = {
    id: "",
    type,
    name: "",
    created_at: date,
    updated_at: date,
    origin_endpoint_id: "",
    destination_endpoint_id: "",
    notes: "",
    origin_minion_pool_id: null,
    destination_minion_pool_id: null,
    instances: [""],
    info: {},
    destination_environment: {},
    source_environment: {},
    transfer_result: null,
    last_execution_status: "",
    user_id: "",
  };
  return item as BuildType<T>;
};
const now = DateTime.utc();
const TWENTIETH = DateTime.utc(now.year, now.month, 20, 10, 0);
const replicas: DashboardExecutions["props"]["replicas"] = [
  buildItem("replica", TWENTIETH.minus({ days: 5 }).toISO()!),
  buildItem("replica", TWENTIETH.toISO()!),
];

const migrations: DashboardExecutions["props"]["migrations"] = [
  buildItem("migration", TWENTIETH.toISO()!),
  buildItem("migration", TWENTIETH.minus({ months: 2 }).toISO()!),
];

describe("DashboardExecutions", () => {
  let defaultProps: DashboardExecutions["props"];

  beforeEach(() => {
    defaultProps = {
      replicas,
      migrations,
      loading: false,
    };
  });

  it("shows no recent activity message", () => {
    const newProps = {
      ...defaultProps,
      replicas: [],
      migrations: [],
    };
    render(<DashboardExecutions {...newProps} />);

    expect(TestUtils.select("DashboardExecutions__Title")?.textContent).toBe(
      "Items Created"
    );
    expect(
      TestUtils.select("DashboardExecutions__NoDataMessage")?.textContent
    ).toBe("No recent activity in this project");
  });

  it("groups data correctly", () => {
    render(<DashboardExecutions {...defaultProps} />);
    expect(
      TestUtils.select("DashboardExecutions__BarChartWrapper")
    ).toBeTruthy();
    expect(TestUtils.selectAll("DashboardBarChart__Bar-")).toHaveLength(2);
    expect(
      TestUtils.selectAll(
        "DashboardBarChart__StackedBar-",
        TestUtils.selectAll("DashboardBarChart__Bar-")[0]
      )
    ).toHaveLength(1);
    expect(
      TestUtils.selectAll(
        "DashboardBarChart__StackedBar-",
        TestUtils.selectAll("DashboardBarChart__Bar-")[1]
      )
    ).toHaveLength(2);
    expect(TestUtils.select("DropdownLink__Label")?.textContent).toBe(
      "Last 30 days"
    );
    expect(
      TestUtils.selectAll("DashboardBarChart__BarLabel")[0].textContent
    ).toBe(TWENTIETH.minus({ days: 5 }).toFormat("dd LLL"));
    expect(
      TestUtils.selectAll("DashboardBarChart__BarLabel")[1].textContent
    ).toBe(TWENTIETH.toFormat("dd LLL"));
  });

  it("updates period and regroups data when dropdown is changed", async () => {
    // Mocking the offset width is necessary due to how the rendered
    // output behaves within the @testing-library/react environment
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 500,
    });

    render(<DashboardExecutions {...defaultProps} />);

    userEvent.click(TestUtils.select("DropdownLink__LinkButton")!);
    expect(TestUtils.selectAll("DropdownLink__ListItem-")[1].textContent).toBe(
      "Last 12 months"
    );
    userEvent.click(TestUtils.selectAll("DropdownLink__ListItem-")[1]!);
    expect(TestUtils.select("DropdownLink__Label")?.textContent).toBe(
      "Last 12 months"
    );
    expect(TestUtils.selectAll("DashboardBarChart__Bar-")).toHaveLength(2);
    expect(
      TestUtils.selectAll(
        "DashboardBarChart__StackedBar-",
        TestUtils.selectAll("DashboardBarChart__Bar-")[0]
      )
    ).toHaveLength(1);
    expect(
      TestUtils.selectAll(
        "DashboardBarChart__StackedBar-",
        TestUtils.selectAll("DashboardBarChart__Bar-")[1]
      )
    ).toHaveLength(2);
    expect(
      TestUtils.selectAll("DashboardBarChart__BarLabel")[0].textContent
    ).toBe(TWENTIETH.minus({ months: 2 }).toFormat("LLL"));
    expect(
      TestUtils.selectAll("DashboardBarChart__BarLabel")[1].textContent
    ).toBe(TWENTIETH.toFormat("LLL"));
  });

  it("shows tooltip correctly on bar hover", () => {
    // Mocking the offset width is necessary due to how the rendered
    // output behaves within the @testing-library/react environment
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 500,
    });
    render(<DashboardExecutions {...defaultProps} />);

    userEvent.hover(TestUtils.select("DashboardBarChart__StackedBar-")!);

    expect(TestUtils.select("DashboardExecutions__Tooltip")).toBeTruthy();
    expect(
      TestUtils.select("DashboardExecutions__TooltipHeader")?.textContent
    ).toBe(TWENTIETH.minus({ days: 5 }).toFormat("dd LLLL"));
    expect(
      TestUtils.selectAll("DashboardExecutions__TooltipRow-")[0].textContent
    ).toBe("Created1");
    expect(
      TestUtils.selectAll("DashboardExecutions__TooltipRow-")[1].textContent
    ).toBe("Replicas1");
    expect(
      TestUtils.selectAll("DashboardExecutions__TooltipRow-")[2].textContent
    ).toBe("Migrations0");

    userEvent.unhover(TestUtils.select("DashboardBarChart__StackedBar-")!);
    expect(TestUtils.select("DashboardExecutions__Tooltip")).toBeFalsy();
  });

  it("renders correct child based on state and props", () => {
    // Mocking the offset width is necessary due to how the rendered
    // output behaves within the @testing-library/react environment
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 500,
    });
    const { rerender } = render(<DashboardExecutions {...defaultProps} />);
    expect(TestUtils.selectAll("DashboardBarChart__Bar-")).toHaveLength(2);

    const newProps = {
      ...defaultProps,
      replicas: [],
    };
    rerender(<DashboardExecutions {...newProps} />);
    expect(TestUtils.selectAll("DashboardBarChart__Bar-")).toHaveLength(1);
    expect(TestUtils.select("DashboardExecutions__NoDataMessage")).toBeFalsy();

    const newProps2 = {
      ...defaultProps,
      migrations: [],
      replicas: [],
    };
    rerender(<DashboardExecutions {...newProps2} />);
    expect(TestUtils.select("DashboardExecutions__NoDataMessage")).toBeTruthy();
  });

  it("shows loading state when loading prop is true and there are no replicas", () => {
    const newProps = {
      ...defaultProps,
      loading: true,
    };
    const { rerender } = render(<DashboardExecutions {...newProps} />);

    expect(TestUtils.select("DashboardExecutions__LoadingWrapper")).toBeFalsy();

    const newProps2 = {
      ...defaultProps,
      loading: true,
      replicas: [],
    };
    rerender(<DashboardExecutions {...newProps2} />);

    expect(
      TestUtils.select("DashboardExecutions__LoadingWrapper")
    ).toBeTruthy();
  });

  it("shows no bar if item is not of type replica or migration", () => {
    const newProps: DashboardExecutions["props"] = {
      ...defaultProps,
      replicas: [
        {
          ...replicas[0],
          // @ts-expect-error
          type: "invalid",
        },
      ],
    };
    render(<DashboardExecutions {...newProps} />);
    expect(TestUtils.selectAll("DashboardBarChart__Bar-")).toHaveLength(1);
  });
});
