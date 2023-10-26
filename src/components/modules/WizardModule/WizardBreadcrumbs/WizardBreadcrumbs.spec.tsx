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

import WizardBreadcrumbs from ".";

describe("WizardBreadcrumbs", () => {
  let defaultProps: WizardBreadcrumbs["props"];

  beforeEach(() => {
    defaultProps = {
      selected: { id: "2" },
      pages: [
        { id: "1", title: "The title 1", breadcrumb: "The breadcrumb 1" },
        { id: "2", title: "The title 2", breadcrumb: "The breadcrumb 2" },
      ],
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<WizardBreadcrumbs {...defaultProps} />);
    expect(getByText("The breadcrumb 1")).toBeTruthy();
  });
});
