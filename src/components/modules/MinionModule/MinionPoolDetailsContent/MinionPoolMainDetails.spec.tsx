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
import { OPENSTACK_ENDPOINT_MOCK } from "@tests/mocks/EndpointsMock";
import { MINION_POOL_MOCK } from "@tests/mocks/MinionPoolMock";
import { DEPLOYMENT_MOCK, TRANSFER_MOCK } from "@tests/mocks/TransferMock";

import MinionPoolMainDetails from "./MinionPoolMainDetails";

jest.mock("react-router-dom", () => ({ Link: "a" }));
jest.mock("@src/components/modules/EndpointModule/EndpointLogos", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="EndpointLogos">{props.endpoint}</div>
  ),
}));

describe("MinionPoolMainDetails", () => {
  let defaultProps: MinionPoolMainDetails["props"];

  beforeEach(() => {
    defaultProps = {
      item: MINION_POOL_MOCK,
      transfers: [TRANSFER_MOCK],
      deployments: [DEPLOYMENT_MOCK],
      schema: [],
      schemaLoading: false,
      endpoints: [OPENSTACK_ENDPOINT_MOCK],
      bottomControls: <div data-testid="bottom-controls">BC</div>,
    };
  });

  it("renders without crashing", () => {
    const { getByText, getByTestId } = render(
      <MinionPoolMainDetails {...defaultProps} />
    );
    expect(getByText(MINION_POOL_MOCK.notes!)).toBeTruthy();
    expect(getByText(OPENSTACK_ENDPOINT_MOCK.name)).toBeTruthy();
    expect(getByTestId("bottom-controls")).toBeTruthy();
    expect(
      getByText(MINION_POOL_MOCK.environment_options.option_1)
    ).toBeTruthy();
    expect(getByText("Object Option - Object Option 1")).toBeTruthy();
    expect(
      getByText(MINION_POOL_MOCK.environment_options.array_option[0])
    ).toBeTruthy();
    expect(getByText("source_value=destination_value")).toBeTruthy();
  });

  it("renders missing endpoint", () => {
    render(<MinionPoolMainDetails {...defaultProps} endpoints={[]} />);
    let missingEndpoint: Element | null = null;
    document.querySelectorAll("*").forEach(element => {
      if (element.textContent === "Endpoint is missing") {
        missingEndpoint = element;
      }
    });
    expect(missingEndpoint).toBeTruthy();
  });
});
