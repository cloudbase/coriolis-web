/*
Copyright (C) 2017  Cloudbase Solutions SRL
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
import { shallow } from "enzyme";
import sinon from "sinon";
import TW from "@src/utils/TestWrapper";
import type { User } from "@src/@types/User";
import UserListItem from ".";

type Props = {
  item: User;
  onClick: () => void;
  getProjectName: (projectId: string | null) => string;
};

const wrap = (props: Props) =>
  new TW(shallow(<UserListItem {...props} />), "ulItem");

const user = {
  id: "id",
  name: "User Name",
  description: "user description",
  email: "user@email.com",
  project_id: "project_id",
  enabled: true,
  project: { name: "", id: "" },
};
describe("UserListItem Component", () => {
  it("renders with correct data", () => {
    const wrapper = wrap({
      item: user,
      onClick: () => {},
      getProjectName: id => `project ${id || ""}`,
    });
    expect(wrapper.findText("name")).toBe(user.name);
    expect(wrapper.findText("description")).toBe(user.description);
    expect(wrapper.findText("email")).toBe(user.email);
    expect(wrapper.findText("project")).toBe("project project_id");
    expect(wrapper.findText("enabled")).toBe("Yes");
  });

  it("dispatches click", () => {
    const onClick = sinon.spy();
    const wrapper = wrap({ item: user, onClick, getProjectName: () => "" });
    wrapper.find("content").click();
    expect(onClick.calledOnce).toBe(true);
  });
});
