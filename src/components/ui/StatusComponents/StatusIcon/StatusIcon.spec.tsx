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
import { ThemePalette } from "@src/components/Theme";
import StatusIcon from ".";

import progressImage from "./images/progress";

describe("StatusIcon", () => {
  it("renders RUNNING status", () => {
    render(<StatusIcon status="RUNNING" />);
    const background = window.getComputedStyle(
      TestUtils.select("StatusIcon__Wrapper")!,
    ).backgroundImage;
    expect(background).toContain(
      encodeURIComponent(
        progressImage(ThemePalette.grayscale[3], ThemePalette.primary),
      ),
    );
  });

  it.each`
    status         | image
    ${"ERROR"}     | ${"error.svg"}
    ${"COMPLETED"} | ${"success.svg"}
    ${"SCHEDULED"} | ${"pending.svg"}
  `("renders $image image for $status status", ({ status, image }) => {
    render(<StatusIcon status={status} />);
    const background = window.getComputedStyle(
      TestUtils.select("StatusIcon__Wrapper")!,
    ).backgroundImage;
    expect(background).toBe(`url(${image})`);
  });

  it.each`
    status         | image
    ${"COMPLETED"} | ${"success-hollow.svg"}
    ${"ERROR"}     | ${"error-hollow.svg"}
    ${"INFO"}      | ${"warning-hollow.svg"}
  `("renders hollow image $image for $status status", ({ status, image }) => {
    render(<StatusIcon status={status} hollow />);
    const background = window.getComputedStyle(
      TestUtils.select("StatusIcon__Wrapper")!,
    ).backgroundImage;
    expect(background).toBe(`url(${image})`);
  });

  it("uses white background if specified", () => {
    render(<StatusIcon status="CANCELLING" useBackground />);
    const background = window.getComputedStyle(
      TestUtils.select("StatusIcon__Wrapper")!,
    ).backgroundImage;
    expect(background).toContain(
      encodeURIComponent(
        progressImage(ThemePalette.grayscale[3], ThemePalette.warning, true),
      ),
    );
  });
});
