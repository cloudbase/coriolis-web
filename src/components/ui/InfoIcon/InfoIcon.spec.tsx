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
import InfoIcon from "@src/components/ui/InfoIcon";
import TestUtils from "@tests/TestUtils";

describe("InfoIcon", () => {
  it("renders with data tip and apropriate icons", () => {
    const { rerender } = render(<InfoIcon text="info text" />);
    expect(
      TestUtils.select("InfoIcon__Wrapper")?.getAttribute("data-tip"),
    ).toBe("info text");
    const style = () =>
      window.getComputedStyle(TestUtils.select("InfoIcon__Wrapper")!);
    expect(style().backgroundImage).toBe("url(question.svg)");

    rerender(<InfoIcon text="info text" warning />);
    expect(style().backgroundImage).toBe("url(warning.svg)");

    rerender(<InfoIcon text="info text" filled />);
    expect(style().backgroundImage).toBe("url(question-filled.svg)");
  });
});
