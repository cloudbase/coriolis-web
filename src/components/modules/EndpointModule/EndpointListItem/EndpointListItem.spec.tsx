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
import { render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import EndpointListItem from "./EndpointListItem";

jest.mock("@src/components/modules/EndpointModule/EndpointLogos", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="EndpointLogos">{props.endpoint}</div>
  ),
}));

const OPENSTACK_ENDPOINT: Endpoint = {
  name: "Openstack",
  type: "openstack",
  id: "1",
  description: "openstack description",
  created_at: new Date().toISOString(),
  mapped_regions: [],
  connection_info: {},
};

describe("EndpointListItem", () => {
  let defaultProps: EndpointListItem["props"];

  beforeEach(() => {
    defaultProps = {
      item: OPENSTACK_ENDPOINT,
      onClick: jest.fn(),
      selected: false,
      onSelectedChange: jest.fn(),
      getUsage: jest.fn().mockImplementation(() => ({
        replicasCount: 3,
        migrationsCount: 2,
      })),
    };
  });

  it("renders without crashing", () => {
    const { getByText, getByTestId } = render(
      <EndpointListItem {...defaultProps} />
    );
    expect(getByText(OPENSTACK_ENDPOINT.name)).toBeTruthy();
    expect(getByText(OPENSTACK_ENDPOINT.description)).toBeTruthy();
    expect(getByTestId("EndpointLogos").textContent).toBe(
      OPENSTACK_ENDPOINT.type
    );
  });

  it("renders usage", () => {
    const { getByText } = render(<EndpointListItem {...defaultProps} />);
    expect(defaultProps.getUsage).toHaveBeenCalledWith(OPENSTACK_ENDPOINT);
    expect(getByText("2 migrations, 3 replicas")).toBeTruthy();
  });

  it("renders N/A when no description", () => {
    const newProps = {
      ...defaultProps,
      item: {
        ...OPENSTACK_ENDPOINT,
        description: "",
      },
    };
    const { getByText } = render(<EndpointListItem {...newProps} />);
    expect(getByText("N/A")).toBeTruthy();
  });

  it("renders selected checkbox", () => {
    render(<EndpointListItem {...defaultProps} selected />);
    const checkbox = TestUtils.selectContains("EndpointListItem__Checkbox")!;
    const style = window.getComputedStyle(checkbox);
    expect(style.opacity).toBe("1");
  });
});
