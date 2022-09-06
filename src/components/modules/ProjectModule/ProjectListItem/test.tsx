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
import ProjectListItem from ".";
import type { Project } from "@src/@types/Project";

type Props = {
  item: Project;
  onClick: () => void;
  getMembers: (projectId: string) => number;
  isCurrentProject: (projectId: string) => boolean;
  onSwitchProjectClick: (projectId: string) => void;
};

const wrap = (props: Props) =>
  new TW(shallow(<ProjectListItem {...props} />), "plItem");

const item: Project = {
  id: "p_id",
  name: "p_name",
  description: "p_description",
  enabled: true,
};
describe("ProjectListItem Component", () => {
  it("renders with correct data", () => {
    const wrapper = wrap({
      item,
      onClick: () => {},
      getMembers: () => 3,
      isCurrentProject: () => true,
      onSwitchProjectClick: () => {},
    });
    expect(wrapper.findText("name")).toBe(item.name);
    expect(wrapper.findText("description")).toBe(item.description);
    expect(wrapper.findText("members")).toBe("3");
    expect(wrapper.findText("enabled")).toBe("Yes");
    expect(wrapper.findText("currentButton", false, true)).toBe("Current");
  });

  it("dispatches click", () => {
    const onClick = sinon.spy();
    const wrapper = wrap({
      item,
      onClick,
      getMembers: () => 3,
      isCurrentProject: () => true,
      onSwitchProjectClick: () => {},
    });
    wrapper.find("content").click();
    expect(onClick.calledOnce).toBe(true);
  });

  it("dispatches switch project click", () => {
    const onSwitchProjectClick = sinon.spy();
    const wrapper = wrap({
      item,
      onClick: () => {},
      getMembers: () => 3,
      isCurrentProject: () => true,
      onSwitchProjectClick,
    });
    wrapper.find("currentButton").click();
    expect(onSwitchProjectClick.calledOnce).toBe(true);
    expect(onSwitchProjectClick.args[0][0]).toBe("p_id");
  });
});
