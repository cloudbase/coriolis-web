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

import { fireEvent, render } from "@testing-library/react";

import ProjectListItem from ".";

describe("ProjectListItem", () => {
  let defaultProps: ProjectListItem["props"];

  beforeEach(() => {
    defaultProps = {
      item: {
        id: "project-id",
        name: "project-name",
      },
      onClick: jest.fn(),
      getMembers: jest.fn(),
      isCurrentProject: jest.fn(),
      onSwitchProjectClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<ProjectListItem {...defaultProps} />);
    expect(getByText(defaultProps.item.name)).toBeTruthy();
  });

  it("switches project", () => {
    render(<ProjectListItem {...defaultProps} />);
    const switchProjectButton = Array.from(
      document.querySelectorAll("button")
    ).find(el => el.textContent?.includes("Switch"));
    expect(switchProjectButton).toBeTruthy();

    fireEvent.mouseDown(switchProjectButton!);
    fireEvent.mouseUp(switchProjectButton!);

    switchProjectButton!.click();
    expect(defaultProps.onSwitchProjectClick).toHaveBeenCalled();
  });
});
