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

import React, { act } from "react";

import { render } from "@testing-library/react";
import {
  OPENSTACK_ENDPOINT_MOCK,
  VMWARE_ENDPOINT_MOCK,
} from "@tests/mocks/EndpointsMock";
import { PROVIDERS_MOCK } from "@tests/mocks/ProvidersMock";
import TestUtils from "@tests/TestUtils";

import MinionEndpointModal from "./MinionEndpointModal";

jest.mock("@src/components/modules/EndpointModule/EndpointLogos", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="EndpointLogos">{props.endpoint}</div>
  ),
}));

jest.mock("react-transition-group", () => ({
  CSSTransition: (props: any) => <div>{props.children}</div>,
}));

describe("MinionEndpointModal", () => {
  let defaultProps: MinionEndpointModal["props"];

  beforeEach(() => {
    defaultProps = {
      providers: PROVIDERS_MOCK,
      endpoints: [OPENSTACK_ENDPOINT_MOCK, VMWARE_ENDPOINT_MOCK],
      loading: false,
      onRequestClose: jest.fn(),
      onSelectEndpoint: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByTestId } = render(<MinionEndpointModal {...defaultProps} />);
    expect(getByTestId("EndpointLogos").textContent).toBe("vmware_vsphere");
  });

  it("renders no endpoints if provider doesn't have support for minions", () => {
    render(
      <MinionEndpointModal
        {...defaultProps}
        providers={{ ...PROVIDERS_MOCK, vmware_vsphere: { types: [] } }}
      />,
    );
    expect(
      TestUtils.select("MinionEndpointModal__NoEndpoints")?.textContent,
    ).toContain("Please create a Coriolis Endpoint");
  });

  it("renders no endpoints if no providers", () => {
    render(<MinionEndpointModal {...defaultProps} providers={null} />);
    expect(
      TestUtils.select("MinionEndpointModal__NoEndpoints")?.textContent,
    ).toContain("Please create a Coriolis Endpoint");
  });

  it("selects an endpoint", async () => {
    const { getByText } = render(<MinionEndpointModal {...defaultProps} />);
    await act(async () => {
      TestUtils.select("DropdownButton__Wrapper")?.click();
    });
    await act(async () => {
      TestUtils.select("Dropdown__ListItem-")?.click();
    });
    getByText("Next").click();
    expect(defaultProps.onSelectEndpoint).toHaveBeenCalledWith(
      VMWARE_ENDPOINT_MOCK,
      "source",
    );
  });

  it("renders loading", () => {
    render(<MinionEndpointModal {...defaultProps} loading />);
    expect(
      TestUtils.select("MinionEndpointModal__LoadingWrapper"),
    ).toBeTruthy();
  });
});
