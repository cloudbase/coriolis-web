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

import LoginOptions, { Props } from "./LoginOptions";

describe("LoginForm", () => {
  let defaultProps: Props;

  beforeEach(() => {
    defaultProps = {
      buttons: [
        {
          id: "google",
          name: "Google",
        },
        {
          id: "microsoft",
          name: "Microsoft",
        },
        {
          id: "facebook",
          name: "Facebook",
        },
        {
          id: "github",
          name: "GitHub",
        },
      ],
    };
  });

  it("renders without crashing", () => {
    render(<LoginOptions buttons={[]} />);
    expect(document.querySelectorAll("div").length).toBe(1);
  });

  it("renders all buttons", () => {
    const { getByText } = render(<LoginOptions {...defaultProps} />);
    expect(getByText("Sign in with Google")).toBeTruthy();
    expect(getByText("Sign in with Microsoft")).toBeTruthy();
    expect(getByText("Sign in with Facebook")).toBeTruthy();
    expect(getByText("Sign in with GitHub")).toBeTruthy();
  });
});
