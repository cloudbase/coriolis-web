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

import React, { act } from "react";

import { Project, RoleAssignment } from "@src/@types/Project";
import { render } from "@testing-library/react";

import ProjectDetailsContent from "./";
import { User } from "@src/@types/User";
import TestUtils from "@tests/TestUtils";

jest.mock("react-router", () => ({ Link: "a" }));

const PROJECT: Project = {
  id: "project-id",
  name: "project-name",
};
const USER: User = {
  id: "user-id",
  name: "user-name",
  project: PROJECT,
  email: "user-email",
  enabled: true,
};
const ROLE_ASSIGNMENT: RoleAssignment = {
  scope: {
    project: PROJECT,
  },
  role: {
    id: "role-id",
    name: "role-name",
  },
  user: USER,
};

describe("ProjectDetailsContent", () => {
  let defaultProps: ProjectDetailsContent["props"];

  beforeEach(() => {
    defaultProps = {
      project: PROJECT,
      loading: false,
      users: [USER],
      usersLoading: false,
      roleAssignments: [ROLE_ASSIGNMENT],
      roles: [ROLE_ASSIGNMENT.role],
      loggedUserId: "admin",
      onEnableUser: jest.fn(),
      onRemoveUser: jest.fn(),
      onUserRoleChange: jest.fn(),
      onAddMemberClick: jest.fn(),
      onDeleteClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<ProjectDetailsContent {...defaultProps} />);
    expect(getByText(PROJECT.name)).toBeTruthy();
    expect(getByText(PROJECT.id)).toBeTruthy();
  });

  describe("user actions", () => {
    const openActionsDropdown = async () => {
      const dropdowns = TestUtils.selectAll("DropdownLink__LinkButton");
      let actionsDropdown: HTMLElement | undefined;

      for (const dropdown of dropdowns) {
        if (dropdown.textContent?.includes("Actions")) {
          actionsDropdown = dropdown;
          break;
        }
      }
      expect(actionsDropdown).toBeTruthy();
      await act(async () => {
        actionsDropdown?.click();
      });
    };

    const clickAction = async (action: string) => {
      const items = TestUtils.selectAll("DropdownLink__ListItem-");
      let actionItem: HTMLElement | undefined;

      for (const item of items) {
        if (item.textContent?.includes(action)) {
          actionItem = item;
          break;
        }
      }

      expect(actionItem).toBeTruthy();
      await act(async () => {
        actionItem?.click();
      });
    };

    it("removes user", async () => {
      render(<ProjectDetailsContent {...defaultProps} />);

      await openActionsDropdown();
      await clickAction("Remove");

      expect(TestUtils.select("AlertModal__Message")).toBeTruthy();
      await act(async () => {
        TestUtils.select("AlertModal__Buttons")
          ?.querySelectorAll("button")[1]
          .click();
      });

      expect(defaultProps.onRemoveUser).toBeCalled();
    });

    it("cancels removing user", async () => {
      render(<ProjectDetailsContent {...defaultProps} />);

      await openActionsDropdown();
      await clickAction("Remove");

      expect(TestUtils.select("AlertModal__Message")).toBeTruthy();
      await act(async () => {
        TestUtils.select("AlertModal__Buttons")
          ?.querySelectorAll("button")[0]
          .click();
      });

      expect(defaultProps.onRemoveUser).not.toBeCalled();
    });

    it("enables user", async () => {
      render(
        <ProjectDetailsContent
          {...defaultProps}
          users={[{ ...USER, enabled: false }]}
        />,
      );

      await openActionsDropdown();
      await clickAction("Enable");

      expect(defaultProps.onEnableUser).toBeCalled();
    });

    it("handles invalid action", () => {
      const component = new ProjectDetailsContent(defaultProps);
      component.handleUserAction(USER, { label: "Invalid", value: "invalid" });

      expect(defaultProps.onEnableUser).not.toBeCalled();
      expect(defaultProps.onRemoveUser).not.toBeCalled();
    });
  });

  it("renders loading", () => {
    render(<ProjectDetailsContent {...defaultProps} loading />);
    expect(
      TestUtils.select("ProjectDetailsContent__LoadingWrapper"),
    ).toBeTruthy();
  });

  it("changes user role", async () => {
    render(<ProjectDetailsContent {...defaultProps} />);
    const dropdowns = TestUtils.selectAll("DropdownLink__LinkButton");
    let roleDropdown: HTMLElement | undefined;

    for (const dropdown of dropdowns) {
      if (dropdown.textContent?.includes(ROLE_ASSIGNMENT.role.name)) {
        roleDropdown = dropdown;
        break;
      }
    }

    expect(roleDropdown).toBeTruthy();
    await act(async () => {
      roleDropdown?.click();
    });

    const items = TestUtils.selectAll("DropdownLink__ListItem-");
    let roleItem: HTMLElement | undefined;

    for (const item of items) {
      if (item.textContent?.includes(ROLE_ASSIGNMENT.role.name)) {
        roleItem = item;
        break;
      }
    }

    expect(roleItem).toBeTruthy();
    await act(async () => {
      roleItem?.click();
    });

    expect(defaultProps.onUserRoleChange).toBeCalledWith(
      USER,
      ROLE_ASSIGNMENT.role.id,
      false,
    );
  });
});
