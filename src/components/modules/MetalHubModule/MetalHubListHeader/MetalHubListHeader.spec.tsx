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

import MetalHubListHeader from "./MetalHubListHeader";

describe("MetalHubListHeader", () => {
  let defaultProps: MetalHubListHeader["props"];

  beforeEach(() => {
    defaultProps = {
      hideButton: false,
      error: "",
      fingerprint: "e4:95:6e:5c:2a:11:d4:1f:a2",
      visible: true,
      onCreateClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<MetalHubListHeader {...defaultProps} />);
    expect(getByText("e4:95:6e:5c:...:11:d4:1f:a2")).toBeTruthy();
    expect(getByText("Add a Bare Metal Server")).toBeTruthy();
  });
});
