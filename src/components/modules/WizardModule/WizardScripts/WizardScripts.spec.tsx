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

import { fireEvent, render, screen } from "@testing-library/react";
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
      onScriptsChange: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText, getAllByText } = render(
      <WizardScripts {...defaultProps} />,
    );
    expect(getByText(INSTANCE_MOCK.name)).toBeTruthy();
    expect(getAllByText("Choose Scripts").length).toBeGreaterThan(0);
  });

  it("offers 'Edit Scripts' for a configured target and 'Choose Scripts' otherwise", () => {
    const { getByText, getAllByText } = render(
      <WizardScripts
        {...defaultProps}
        userScriptData={{
          global: {
            linux: [
              { phase: "osmorphing_pre_os_mount", payload: "echo pre" },
              { phase: "replica_first_boot", payload: "echo boot" },
            ],
          },
        }}
      />,
    );
    expect(getByText("Edit Scripts")).toBeTruthy();
    expect(getAllByText("Choose Scripts").length).toBe(2);
  });

  it("opens the per-phase modal showing all three phases", () => {
    const { getAllByText } = render(<WizardScripts {...defaultProps} />);
    fireEvent.click(getAllByText("Choose Scripts")[0]);
    expect(screen.getByText("Windows Script File - User Scripts")).toBeTruthy();
    expect(screen.getByText("OS morphing: before mount")).toBeTruthy();
    expect(screen.getByText("OS morphing: after mount")).toBeTruthy();
    expect(screen.getByText("VM first boot script")).toBeTruthy();
    expect(screen.getAllByText("Choose File...").length).toBe(3);
  });
});
