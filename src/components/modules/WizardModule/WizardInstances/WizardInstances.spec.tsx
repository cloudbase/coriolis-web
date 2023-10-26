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

import WizardInstances from ".";
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";

describe("WizardInstances", () => {
  let defaultProps: WizardInstances["props"];

  beforeEach(() => {
    defaultProps = {
      instances: [INSTANCE_MOCK],
      currentPage: 1,
      instancesPerPage: 10,
      loading: false,
      chunksLoading: false,
      searching: false,
      searchNotFound: false,
      reloading: false,
      hasSourceOptions: true,
      onSearchInputChange: jest.fn(),
      onReloadClick: jest.fn(),
      onInstanceClick: jest.fn(),
      onPageClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<WizardInstances {...defaultProps} />);
    expect(getByText(INSTANCE_MOCK.name)).toBeTruthy();
    expect(getByText(INSTANCE_MOCK.instance_name!)).toBeTruthy();
  });
});
