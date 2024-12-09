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

import { Endpoint } from "@src/@types/Endpoint";
import { DeploymentItem, TransferItem } from "@src/@types/MainItem";
import { fireEvent, render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import DashboardTopEndpoints from "./DashboardTopEndpoints";

jest.mock("react-router-dom", () => ({ Link: "a" }));

type BuildType<T extends "replica" | "migration"> = T extends "replica"
  ? TransferItem
  : DeploymentItem;

const buildItem = <T extends "replica" | "migration">(
  type: T,
  origin_endpoint_id: string,
  destination_endpoint_id: string
): BuildType<T> => {
  const item = {
    id: "",
    type,
    name: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    origin_endpoint_id,
    destination_endpoint_id,
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
  return item as unknown as BuildType<T>;
};

const buildEndpoint = (id: string): Endpoint => ({
  id,
  name: `${id}-name`,
  description: "",
  type: "openstack",
  created_at: new Date().toISOString(),
  mapped_regions: [],
  connection_info: {},
});

const replicas: DashboardTopEndpoints["props"]["transfers"] = [
  buildItem("replica", "a", "b"),
  buildItem("replica", "a", "b"),
  buildItem("replica", "c", "d"),
];

const endpoints: DashboardTopEndpoints["props"]["endpoints"] = [
  buildEndpoint("a"),
  buildEndpoint("b"),
  buildEndpoint("c"),
  buildEndpoint("d"),
  buildEndpoint("e"),
  buildEndpoint("f"),
];

describe("DashboardTopEndpoints", () => {
  const defaultProps: DashboardTopEndpoints["props"] = {
    transfers: replicas,
    endpoints,
    style: {},
    loading: false,
    onNewClick: jest.fn(),
  };

  it("should display a loading state", () => {
    render(
      <DashboardTopEndpoints
        {...defaultProps}
        transfers={[]}
        endpoints={[]}
        loading={true}
      />
    );
    expect(TestUtils.select("StatusImage__Image")).toBeTruthy();
  });

  it("should display no data message", () => {
    render(
      <DashboardTopEndpoints {...defaultProps} transfers={[]} endpoints={[]} />
    );
    expect(TestUtils.select("DashboardTopEndpoints__NoItems")).toBeTruthy();
  });

  it("should trigger onNewClick when New Endpoint button is clicked", () => {
    const onNewClickMock = jest.fn();
    render(
      <DashboardTopEndpoints
        {...defaultProps}
        onNewClick={onNewClickMock}
        transfers={[]}
        endpoints={[]}
      />
    );

    fireEvent.click(
      TestUtils.select("DashboardTopEndpoints__NoItems")?.querySelector(
        "button"
      )!
    );
    expect(onNewClickMock).toHaveBeenCalledTimes(1);
  });

  it("should display the chart with data", () => {
    render(<DashboardTopEndpoints {...defaultProps} />);

    expect(
      TestUtils.select("DashboardTopEndpoints__ChartWrapper")
    ).toBeTruthy();
    expect(
      TestUtils.selectAll(
        "DashboardTopEndpoints__LegendLabel-"
      )[0].attributes.getNamedItem("to")?.value
    ).toBe("/endpoints/a");

    expect(
      TestUtils.selectAll("DashboardTopEndpoints__LegendLabel-")[1].textContent
    ).toBe("b-name");
  });

  it("should call calculateGroupedEndpoints when component receives new props", () => {
    const calculateGroupedEndpointsSpy = jest.spyOn(
      DashboardTopEndpoints.prototype,
      "calculateGroupedEndpoints"
    );

    const { rerender } = render(<DashboardTopEndpoints {...defaultProps} />);

    const newProps = {
      ...defaultProps,
      replicas: [],
      migrations: [],
      endpoints: [],
    };
    rerender(<DashboardTopEndpoints {...newProps} />);

    expect(calculateGroupedEndpointsSpy).toHaveBeenCalledWith(newProps);
    expect(calculateGroupedEndpointsSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle mouse over and update state", () => {
    const setStateSpy = jest
      .spyOn(DashboardTopEndpoints.prototype, "setState")
      .mockImplementationOnce(() => {});

    const instance = new DashboardTopEndpoints(defaultProps);
    instance.chartRef = document.createElement("div");
    const groupedEndpoint = {
      endpoint: endpoints[0],
      replicasCount: 1,
      migrationsCount: 2,
      value: 3,
    };
    instance.handleMouseOver(groupedEndpoint, 10, 10);
    expect(setStateSpy).toHaveBeenCalledWith({
      groupedEndpoint,
      tooltipPosition: { x: 26, y: -22 },
    });
  });

  it("should handle mouse over and not update state if there's no chartRef", () => {
    const setStateSpy = jest
      .spyOn(DashboardTopEndpoints.prototype, "setState")
      .mockImplementationOnce(() => {});

    const instance = new DashboardTopEndpoints(defaultProps);
    instance.chartRef = null;
    const groupedEndpoint = {
      endpoint: endpoints[0],
      replicasCount: 1,
      migrationsCount: 2,
      value: 3,
    };
    instance.handleMouseOver(groupedEndpoint, 10, 10);
    expect(setStateSpy).not.toHaveBeenCalled();
  });

  it("should handle mouse leave and update state", () => {
    const setStateSpy = jest
      .spyOn(DashboardTopEndpoints.prototype, "setState")
      .mockImplementationOnce(() => {});

    const instance = new DashboardTopEndpoints(defaultProps);
    instance.handleMouseLeave();
    expect(setStateSpy).toHaveBeenCalledWith({
      groupedEndpoint: null,
    });
  });
});
