/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import TestUtils from "@tests/TestUtils";
import SmallLoading from ".";

describe("SmallLoading", () => {
  it("renders progress text", () => {
    const { rerender } = render(<SmallLoading loadingProgress={33} />);
    expect(TestUtils.select("SmallLoading__ProgressText")?.textContent).toBe(
      "33%"
    );
    rerender(<SmallLoading loadingProgress={66.66} />);
    expect(TestUtils.select("SmallLoading__ProgressText")?.textContent).toBe(
      "67%"
    );
  });

  it("doesn't render progress if progress is -1", () => {
    render(<SmallLoading loadingProgress={-1} />);
    expect(TestUtils.select("SmallLoading__ProgressText")).toBeNull();
  });
});
