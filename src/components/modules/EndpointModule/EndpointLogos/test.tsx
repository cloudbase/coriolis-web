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
import EndpointLogos from ".";

const wrap = props =>
  new TestWrapper(shallow(<EndpointLogos {...props} />), "endpointLogos");

describe("EndpointLogos Component", () => {
  it("renders 32px aws", () => {
    const wrapper = wrap({ height: 32, endpoint: "aws" });
    const logo = wrapper.find("logo");
    expect(logo.prop("url")).toBe("/api/logos/aws/32");
  });

  it("renders 128px azure disabled", () => {
    const wrapper = wrap({ height: 128, endpoint: "azure", disabled: true });
    const logo = wrapper.find("logo");
    expect(logo.prop("url")).toBe("/api/logos/azure/128/disabled");
  });

  it("renders 64px generic logo", () => {
    const wrapper = wrap({ height: 64, endpoint: "generic" });
    const logo = wrapper.find("genericLogo");
    expect(logo.prop("name")).toBe("generic");
    expect(logo.prop("size").h).toBe(64);
  });
});
