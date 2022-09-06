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
import StatusImage from ".";

import questionImage from "./images/question";
import errorImage from "./images/error";
import successImage from "./images/success";

describe("StatusImage", () => {
  it.each`
    status         | image
    ${"QUESTION"}  | ${questionImage}
    ${"ERROR"}     | ${errorImage}
    ${"COMPLETED"} | ${successImage}
  `("renders image for status $status", ({ status, image }) => {
    render(<StatusImage status={status} />);
    const html = TestUtils.select("StatusImage__Image")!
      .innerHTML.replace("<!--?", "<?")
      .replace("?-->", "?>");
    expect(html).toBe(image);
  });

  it("renders loading with loading progress", () => {
    const PROGESS = 64;
    render(<StatusImage loading loadingProgress={PROGESS} />);
    expect(TestUtils.select("StatusImage__ProgressText")!.textContent).toBe(
      `${PROGESS}%`
    );
    expect(
      TestUtils.select("StatusImage__CircleProgressBar")!.getAttribute(
        "stroke-dashoffset"
      )
    ).toBe(`${300 - PROGESS * 3}`);
  });

  it("allows specifying an image size for loading", () => {
    const SIZE = 55;
    render(<StatusImage status="RUNNING" size={SIZE} />);
    const width = Number(
      document.querySelector("svg")!.getAttribute("viewBox")!.split(" ")[2]
    ).toFixed(2);
    expect(width).toBe((96 * (96 / SIZE)).toFixed(2));
  });
});
