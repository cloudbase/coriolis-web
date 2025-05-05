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

import DateUtils from "@src/utils/DateUtils";
import { render } from "@testing-library/react";
import { METALHUB_SERVER_MOCK } from "@tests/mocks/MetalHubServerMock";

import MetalHubListItem from "./MetalHubListItem";

describe("MetalHubListItem", () => {
  let defaultProps: MetalHubListItem["props"];

  beforeEach(() => {
    defaultProps = {
      item: METALHUB_SERVER_MOCK,
      selected: false,
      onSelectedChange: jest.fn(),
      onClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText, getAllByText } = render(
      <MetalHubListItem {...defaultProps} />,
    );
    expect(getByText(METALHUB_SERVER_MOCK.hostname!)).toBeTruthy();
    expect(getByText("Active")).toBeTruthy();
    expect(getByText(METALHUB_SERVER_MOCK.api_endpoint)).toBeTruthy();
    expect(
      getAllByText(
        DateUtils.getLocalDate(METALHUB_SERVER_MOCK.created_at).toFormat(
          "yyyy-LL-dd HH:mm:ss",
        ),
      ).length,
    ).toBe(2);
  });

  it("renders default hostname when hostname is empty and inactive status", () => {
    const { getByText } = render(
      <MetalHubListItem
        {...defaultProps}
        item={{
          ...METALHUB_SERVER_MOCK,
          hostname: "",
          active: false,
        }}
      />,
    );
    expect(getByText("No Hostname")).toBeTruthy();
    expect(getByText("Inactive")).toBeTruthy();
  });
});
