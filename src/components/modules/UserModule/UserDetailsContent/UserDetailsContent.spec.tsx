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
import { USER_MOCK } from "@tests/mocks/UsersMock";
import TestUtils from "@tests/TestUtils";

import UserDetailsContent from "./";

jest.mock("react-router", () => ({ Link: "a" }));

describe("UserDetailsContent", () => {
  let defaultProps: UserDetailsContent["props"];

  beforeEach(() => {
    defaultProps = {
      user: USER_MOCK,
      loading: false,
      projects: [USER_MOCK.project],
      userProjects: [USER_MOCK.project],
      isLoggedUser: false,
      onUpdatePasswordClick: jest.fn(),
      onDeleteClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<UserDetailsContent {...defaultProps} />);
    expect(getByText(USER_MOCK.name)).toBeTruthy();
  });

  it("renders loading", () => {
    render(<UserDetailsContent {...defaultProps} loading />);
    expect(TestUtils.select("UserDetailsContent__LoadingWrapper")).toBeTruthy();
  });

  it("fires delete click", () => {
    const { getByText } = render(<UserDetailsContent {...defaultProps} />);
    getByText("Delete user").click();
    expect(defaultProps.onDeleteClick).toHaveBeenCalled();
  });

  it("renders without crashing when user projects are not in projects", () => {
    const { getByText } = render(
      <UserDetailsContent
        {...defaultProps}
        projects={[{ ...USER_MOCK.project, id: "2" }]}
      />
    );
    expect(getByText(USER_MOCK.name)).toBeTruthy();
  });
});
