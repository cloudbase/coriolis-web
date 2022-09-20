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
import TestWrapper from "@src/utils/TestWrapper";
import LoginOptions from ".";

const wrap = props =>
  new TestWrapper(shallow(<LoginOptions {...props} />), "loginOptions");

const buttons = [
  {
    name: "Google",
    id: "google",
    url: "",
  },
  {
    name: "Microsoft",
    id: "microsoft",
    url: "",
  },
  {
    name: "Facebook",
    id: "facebook",
    url: "",
  },
  {
    name: "GitHub",
    id: "github",
    url: "",
  },
];

describe("LoginOptions Component", () => {
  it("renders with all buttons", () => {
    const wrapper = wrap({ buttons });
    expect(wrapper.findPartialId("button").length).toBe(4);
    buttons.forEach(button => {
      expect(wrapper.findText(`button-${button.id}`)).toBe(
        `<styled.div />Sign in with ${button.name}`
      );
      expect(wrapper.find(`logo-${button.id}`).prop("id")).toBe(button.id);
    });
  });
});
