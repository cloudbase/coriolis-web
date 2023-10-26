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

import NavigationMini from "./";
import TestUtils from "@tests/TestUtils";

jest.mock("react-router-dom", () => ({ Link: "a" }));
jest.mock("@src/components/modules/NavigationModule/Navigation", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="navigation">open: {String(props.open)}</div>
  ),
}));

describe("NavigationMini", () => {
  it("renders without crasing", () => {
    render(<NavigationMini />);
    expect(TestUtils.select("NavigationMini__Wrapper")).toBeTruthy();
  });

  it("toggles the menu", () => {
    const { getByTestId } = render(<NavigationMini />);
    expect(getByTestId("navigation").textContent).toBe("open: false");
    TestUtils.select("NavigationMini__MenuImage")!.click();
    expect(getByTestId("navigation").textContent).toBe("open: true");
  });
});
