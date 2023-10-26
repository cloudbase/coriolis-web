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
import {
  OPENSTACK_ENDPOINT_MOCK,
  VMWARE_ENDPOINT_MOCK,
} from "@tests/mocks/EndpointsMock";

import WizardEndpointList from "./";

jest.mock("@src/components/modules/EndpointModule/EndpointLogos", () => ({
  __esModule: true,
  default: (props: any) => <div>{props.endpoint}</div>,
}));

describe("WizardEndpointList", () => {
  let defaultProps: WizardEndpointList["props"];

  beforeEach(() => {
    defaultProps = {
      providers: ["vmware_vsphere", "openstack"],
      endpoints: [VMWARE_ENDPOINT_MOCK, OPENSTACK_ENDPOINT_MOCK],
      loading: false,
      onChange: jest.fn(),
      onAddEndpoint: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<WizardEndpointList {...defaultProps} />);
    expect(getByText("vmware_vsphere")).toBeTruthy();
    expect(getByText("openstack")).toBeTruthy();
  });
});
