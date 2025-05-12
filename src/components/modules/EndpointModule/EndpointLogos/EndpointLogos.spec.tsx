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

import EndpointLogos from "./EndpointLogos";

jest.mock("@src/utils/Config", () => ({
  config: {
    providerSortPriority: {},
    providerNames: {
      openstack: "OpenStack",
      vmware_vsphere: "VMware vSphere",
    },
  },
}));

describe("EndpointLogos", () => {
  let defaultProps: EndpointLogos["props"];

  beforeEach(() => {
    defaultProps = {
      endpoint: "openstack",
      height: 64,
    };
  });

  it("renders without crashing", () => {
    render(<EndpointLogos {...defaultProps} />);
    expect(TestUtils.select("EndpointLogos__Logo")).toBeTruthy();
  });

  it("renders generic logo", () => {
    const { getByText } = render(
      <EndpointLogos {...defaultProps} endpoint="new-endpoint" />,
    );
    expect(getByText("new-endpoint")).toBeTruthy();
  });

  it("doesn't render for unsupported height", () => {
    render(<EndpointLogos {...defaultProps} height={1} />);
    expect(TestUtils.select("EndpointLogos__Logo")).toBeFalsy();
  });
});
