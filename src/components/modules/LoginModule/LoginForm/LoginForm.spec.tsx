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

import notificationStore from "@src/stores/NotificationStore";
import { fireEvent, render } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import LoginForm from "./LoginForm";

jest.mock("@src/stores/NotificationStore", () => ({
  alert: jest.fn(),
}));

describe("LoginForm", () => {
  let defaultProps: LoginForm["props"];

  beforeEach(() => {
    defaultProps = {
      className: "class-custom-name",
      showUserDomainInput: false,
      loading: false,
      loginFailedResponse: null,
      domain: "default",
      onDomainChange: jest.fn(),
      onFormSubmit: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<LoginForm {...defaultProps} />);
    expect(getByText("Username")).toBeTruthy();
    expect(getByText("Password")).toBeTruthy();
  });

  it("submits username and password", () => {
    render(<LoginForm {...defaultProps} />);
    const userInput = TestUtils.selectAll("TextInput__Input")[0];
    const passwordInput = TestUtils.selectAll("TextInput__Input")[1];
    fireEvent.change(userInput, { target: { value: "username" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.submit(document.querySelector("form")!);
    expect(defaultProps.onFormSubmit).toHaveBeenCalledWith({
      username: "username",
      password: "password",
    });
  });

  it("submits domain", () => {
    render(<LoginForm {...defaultProps} showUserDomainInput={true} />);
    const domainInput = TestUtils.selectAll("TextInput__Input")[0];
    expect((domainInput as HTMLInputElement).value).toBe(defaultProps.domain);
    fireEvent.change(domainInput, { target: { value: "new-domain" } });
    expect(defaultProps.onDomainChange).toHaveBeenCalledWith("new-domain");
  });

  it("shows fill all fields error", () => {
    render(<LoginForm {...defaultProps} />);
    fireEvent.submit(document.querySelector("form")!);
    expect(notificationStore.alert).toHaveBeenCalledWith(
      "Please fill in all fields"
    );
  });

  it("renders incorrect crediantials message", () => {
    const { getByText } = render(
      <LoginForm {...defaultProps} loginFailedResponse={{ status: 401 }} />
    );
    expect(getByText("Incorrect credentials", { exact: false })).toBeTruthy();
  });

  it("renders other error message", () => {
    const { getByText } = render(
      <LoginForm
        {...defaultProps}
        loginFailedResponse={{ status: 500, message: "other error" }}
      />
    );
    expect(getByText("other error", { exact: false })).toBeTruthy();
  });
});
