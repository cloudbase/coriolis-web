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
import LoginForm from ".";

const wrap = props =>
  new TW(shallow(<LoginForm {...props} domain="default" />), "loginForm");

describe("LoginForm Component", () => {
  it("renders incorrect credentials", () => {
    const wrapper = wrap({ loginFailedResponse: { status: 401 } });
    expect(
      wrapper.find("errorText").prop("dangerouslySetInnerHTML").__html
    ).toBe("Incorrect credentials.<br />Please try again."); // eslint-disable-line
  });

  it("renders server error", () => {
    const wrapper = wrap({ loginFailedResponse: {} });
    expect(
      wrapper.find("errorText").prop("dangerouslySetInnerHTML").__html
    ).toBe(
      "Request failed, there might be a problem with the connection to the server."
    ); // eslint-disable-line
  });

  it("submits correct info", () => {
    const onFormSubmit = sinon.spy();
    const wrapper = wrap({ onFormSubmit });
    wrapper
      .find("usernameField")
      .simulate("change", { target: { value: "usr" } });
    wrapper
      .find("passwordField")
      .simulate("change", { target: { value: "pswd" } });
    wrapper.shallow.simulate("submit", { preventDefault: () => {} });
    expect(onFormSubmit.args[0][0].username).toBe("usr");
    expect(onFormSubmit.args[0][0].password).toBe("pswd");
  });
});
