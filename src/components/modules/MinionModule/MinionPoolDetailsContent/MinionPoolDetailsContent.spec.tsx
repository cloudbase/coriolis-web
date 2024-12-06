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
import { MINION_POOL_DETAILS_MOCK } from "@tests/mocks/MinionPoolMock";
import { TRANSFER_MOCK } from "@tests/mocks/TransferMock";
import TestUtils from "@tests/TestUtils";

import MinionPoolDetailsContent from "./MinionPoolDetailsContent";

jest.mock("react-router-dom", () => ({ Link: "a" }));
jest.mock("@src/components/modules/EndpointModule/EndpointLogos", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="EndpointLogos">{props.endpoint}</div>
  ),
}));
jest.mock(
  "@src/components/modules/MinionModule/MinionPoolDetailsContent/MinionPoolEvents",
  () => ({
    __esModule: true,
    default: () => <div data-testid="MinionPoolEvents"></div>,
  })
);

describe("MinionPoolDetailsContent", () => {
  let defaultProps: MinionPoolDetailsContent["props"];

  beforeEach(() => {
    defaultProps = {
      item: MINION_POOL_DETAILS_MOCK,
      itemId: "minion-pool-id",
      transfers: [TRANSFER_MOCK],
      deployments: [],
      endpoints: [OPENSTACK_ENDPOINT_MOCK],
      schema: [
        {
          name: "name",
          label: "Name",
          type: "text",
          required: true,
          disabled: false,
        },
      ],
      schemaLoading: false,
      loading: false,
      page: "",
      onAllocate: jest.fn(),
      onDeleteMinionPoolClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(
      <MinionPoolDetailsContent {...defaultProps} />
    );
    expect(getByText(MINION_POOL_DETAILS_MOCK.id)).toBeTruthy();
    expect(getByText(MINION_POOL_DETAILS_MOCK.notes!)).toBeTruthy();
  });

  it("calls allocate callback", () => {
    const { getByText } = render(
      <MinionPoolDetailsContent
        {...defaultProps}
        item={{ ...MINION_POOL_DETAILS_MOCK, status: "DEALLOCATED" }}
      />
    );
    getByText("Allocate").click();
    expect(defaultProps.onAllocate).toHaveBeenCalled();
  });

  it("renders loading", () => {
    render(<MinionPoolDetailsContent {...defaultProps} loading />);
    expect(TestUtils.select("MinionPoolDetailsContent__Loading")).toBeTruthy();
  });

  it("renders machines page", () => {
    render(<MinionPoolDetailsContent {...defaultProps} page="machines" />);
    expect(TestUtils.select("MinionPoolMachines")).toBeTruthy();
  });

  it("renders events page", () => {
    const { getByTestId } = render(
      <MinionPoolDetailsContent {...defaultProps} page="events" />
    );
    expect(getByTestId("MinionPoolEvents")).toBeTruthy();
  });
});
