/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import TestUtils from "@tests/TestUtils";
import { User } from "@src/@types/User";
import UserDropdown from ".";

jest.mock("react-router-dom", () => ({ Link: "div" }));

const USER: User = {
  id: "user-id",
  name: "User Name",
  email: "email@email.test",
  project: {
    id: "project-id",
    name: "Project Name",
  },
};

describe("UserDropdown", () => {
  it("renders no user", () => {
    render(<UserDropdown user={null} onItemClick={() => {}} />);
    TestUtils.select("UserDropdown__Icon")?.click();
    expect(TestUtils.select("UserDropdown__Label")?.textContent).toBe(
      "No signed in user"
    );
  });

  it("renders user menu", () => {
    render(<UserDropdown user={USER} onItemClick={() => {}} />);
    TestUtils.select("UserDropdown__Icon")?.click();
    expect(TestUtils.select("UserDropdown__Username")?.textContent).toBe(
      USER.name
    );
    expect(TestUtils.select("UserDropdown__Email")?.textContent).toBe(
      USER.email
    );
    const listItems = TestUtils.selectAll("UserDropdown__ListItem");
    expect(listItems).toHaveLength(3);
    expect(listItems[0].textContent).toBe("About Coriolis");
  });

  it("fires item click", () => {
    const onItemClick = jest.fn();
    render(<UserDropdown user={USER} onItemClick={onItemClick} />);
    TestUtils.select("UserDropdown__Icon")?.click();
    TestUtils.selectAll("UserDropdown__Label")[2].click();
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ value: "signout" })
    );
  });
});
