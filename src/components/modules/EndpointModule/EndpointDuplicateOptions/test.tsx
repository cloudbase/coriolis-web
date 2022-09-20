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
import type { Project } from "@src/@types/Project";
import EndpointDuplicateOptions from ".";

type Props = {
  projects: Project[];
  selectedProjectId: string;
  duplicating: boolean;
  onCancelClick: () => void;
  onDuplicateClick: (projectId: string) => void;
};

const wrap = (props: Props) =>
  new TW(shallow(<EndpointDuplicateOptions {...props} />), "edOptions");
const projects: Project[] = [
  { id: "project-1", name: "Project 1" },
  { id: "project-2", name: "Project 2" },
];
describe("EndpointDuplicateOptions Component", () => {
  it("renders projects", () => {
    const wrapper = wrap({
      projects,
      selectedProjectId: "project-2",
      duplicating: false,
      onCancelClick: () => {},
      onDuplicateClick: () => {},
    });
    expect(wrapper.find("field-project").prop("enum")[1].name).toBe(
      projects[1].name
    );
    expect(wrapper.find("field-project").prop("value")).toBe("project-2");
    expect(wrapper.find("loading").length).toBe(0);
  });

  it("dispatches duplicate", () => {
    const onDuplicateClick = sinon.spy();
    const wrapper = wrap({
      projects,
      selectedProjectId: "project-2",
      duplicating: false,
      onCancelClick: () => {},
      onDuplicateClick,
    });
    wrapper.find("duplicateButton").click();
    expect(onDuplicateClick.args[0][0]).toBe("project-2");
  });

  it("renders loading", () => {
    const wrapper = wrap({
      projects,
      selectedProjectId: "project-2",
      duplicating: true,
      onCancelClick: () => {},
      onDuplicateClick: () => {},
    });
    expect(wrapper.find("loading").length).toBe(1);
  });
});
