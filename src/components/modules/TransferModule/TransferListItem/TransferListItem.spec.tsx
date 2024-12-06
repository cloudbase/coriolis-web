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

import TransferListItem from ".";
import { TRANSFER_MOCK } from "@tests/mocks/TransferMock";

describe("TransferListItem", () => {
  let defaultProps: TransferListItem["props"];

  beforeEach(() => {
    defaultProps = {
      item: TRANSFER_MOCK,
      selected: false,
      userNameLoading: false,
      onSelectedChange: jest.fn(),
      endpointType: jest.fn(),
      getUserName: jest.fn(),
      onClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<TransferListItem {...defaultProps} />);
    expect(getByText(TRANSFER_MOCK.notes!)).toBeTruthy();
  });
});
