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

import WizardScripts from "./";

describe("WizardScripts", () => {
  let defaultProps: WizardScripts["props"];

  beforeEach(() => {
    defaultProps = {
      instances: [INSTANCE_MOCK],
      uploadedScripts: [],
      removedScripts: [],
      userScriptData: null,
      onScriptUpload: jest.fn(),
      onCancelScript: jest.fn(),
      onScriptDataRemove: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<WizardScripts {...defaultProps} />);
    expect(getByText(INSTANCE_MOCK.name)).toBeTruthy();
  });
});
