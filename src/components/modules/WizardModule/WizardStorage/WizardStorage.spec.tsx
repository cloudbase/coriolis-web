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
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";
import { STORAGE_BACKEND_MOCK } from "@tests/mocks/StoragesMock";

import WizardStorage from "./";

describe("WizardStorage", () => {
  let defaultProps: WizardStorage["props"];

  beforeEach(() => {
    defaultProps = {
      storageBackends: [STORAGE_BACKEND_MOCK],
      loading: false,
      instancesDetails: [INSTANCE_MOCK],
      storageMap: null,
      defaultStorageLayout: "page",
      defaultStorage: { value: STORAGE_BACKEND_MOCK.id },
      onDefaultStorageChange: jest.fn(),
      onChange: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<WizardStorage {...defaultProps} />);
    expect(getByText("Storage Backend Mapping")).toBeTruthy();
  });
});
