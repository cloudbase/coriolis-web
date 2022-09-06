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
import { ThemePalette } from "@src/components/Theme";
import TestUtils from "@tests/TestUtils";
import StatusPill from ".";

describe("StatusPill", () => {
  it.each`
    status                             | background                   | label
    ${"COMPLETED"}                     | ${ThemePalette.success}      | ${"COMPLETED"}
    ${"ALLOCATED"}                     | ${ThemePalette.success}      | ${"ALLOCATED"}
    ${"POWERED_ON"}                    | ${ThemePalette.success}      | ${"POWERED ON"}
    ${"FAILED_TO_SCHEDULE"}            | ${ThemePalette.alert}        | ${"UNSCHEDULABLE"}
    ${"ERROR"}                         | ${ThemePalette.alert}        | ${"ERROR"}
    ${"ERROR_ALLOCATING_MINIONS"}      | ${ThemePalette.alert}        | ${"MINIONS ERROR"}
    ${"CANCELED"}                      | ${ThemePalette.warning}      | ${"CANCELED"}
    ${"CANCELED_AFTER_COMPLETION"}     | ${ThemePalette.warning}      | ${"CANCELED"}
    ${"PAUSED"}                        | ${"white"}                   | ${"PAUSED"}
    ${"STARTING"}                      | ${"url(running.svg)"}        | ${"STARTING"}
    ${"AWAITING_MINION_ALLOCATIONS"}   | ${"url(running.svg)"}        | ${"AWAITING MINIONS"}
    ${"HEALTHCHECKING"}                | ${"url(running.svg)"}        | ${"HEALTHCHECKING"}
    ${"CANCELLING"}                    | ${"url(cancelling.svg)"}     | ${"CANCELLING"}
    ${"DEALLOCATING_SHARED_RESOURCES"} | ${"url(cancelling.svg)"}     | ${"DEALLOCATING"}
    ${"STRANDED_AFTER_DEADLOCK"}       | ${"#424242"}                 | ${"DEADLOCKED"}
    ${"UNSCHEDULED"}                   | ${ThemePalette.grayscale[2]} | ${"UNSCHEDULED"}
    ${"UNINITIALIZED"}                 | ${ThemePalette.grayscale[2]} | ${"UNINITIALIZED"}
    ${"INFO"}                          | ${"white"}                   | ${"INFO"}
    ${"UNEXECUTED"}                    | ${""}                        | ${"UNEXECUTED"}
  `(
    "renders status $status with background $background and label $label",
    ({ status, background, label }) => {
      render(<StatusPill status={status} />);
      const wrapper = TestUtils.select("StatusPill__Wrapper")!;
      expect(wrapper.textContent).toBe(label);
      expect(
        TestUtils.rgbToHex(window.getComputedStyle(wrapper).background)
      ).toBe(background);
    }
  );

  it("renders info status with different background colors", () => {
    const wrapper = () => TestUtils.select("StatusPill__Wrapper")!;

    const { rerender } = render(<StatusPill status="INFO" alert />);
    expect(TestUtils.rgbToHex(window.getComputedStyle(wrapper()).color)).toBe(
      ThemePalette.alert
    );

    rerender(<StatusPill status="INFO" secondary />);
    expect(
      TestUtils.rgbToHex(window.getComputedStyle(wrapper()).background)
    ).toBe(ThemePalette.grayscale[8]);
  });

  it("renders small variant", () => {
    const wrapper = () => TestUtils.select("StatusPill__Wrapper")!;

    const { rerender } = render(<StatusPill status="INFO" />);
    expect(window.getComputedStyle(wrapper()).minWidth).toBe("94px");

    rerender(<StatusPill status="INFO" small />);
    expect(window.getComputedStyle(wrapper()).minWidth).toBe("78px");
  });
});
