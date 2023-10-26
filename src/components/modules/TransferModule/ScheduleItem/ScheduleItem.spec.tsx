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

import { DateTime } from "luxon";
import React from "react";

import DateUtils from "@src/utils/DateUtils";
import { render } from "@testing-library/react";
import { SCHEDULE_MOCK } from "@tests/mocks/SchedulesMock";
import TestUtils from "@tests/TestUtils";

import ScheduleItem from "./";

const COL_WIDTHS = ["6%", "18%", "10%", "18%", "10%", "10%", "23%", "5%"];

describe("ScheduleItem", () => {
  let defaultProps: ScheduleItem["props"];

  beforeEach(() => {
    defaultProps = {
      colWidths: COL_WIDTHS,
      item: SCHEDULE_MOCK,
      unsavedSchedules: [],
      timezone: "local",
      saving: false,
      enabling: false,
      deleting: false,
      onChange: jest.fn(),
      onSaveSchedule: jest.fn(),
      onShowOptionsClick: jest.fn(),
      onDeleteClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<ScheduleItem {...defaultProps} />);
    expect(getByText(DateTime.local(2023, 4, 4).weekdayLong!)).toBeTruthy();
  });

  it("handles expiration date change", () => {
    render(
      <ScheduleItem
        {...defaultProps}
        item={{ ...SCHEDULE_MOCK, enabled: false }}
      />
    );
    TestUtils.selectAll("DropdownButton__Wrapper-")[5]?.click();
    const day = document.querySelector(".rdtDay.rdtNew") as HTMLElement;
    expect(day).toBeTruthy();
    day.click();
    TestUtils.selectAll("DropdownButton__Wrapper-")[5]?.click();
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it.each`
    fieldName   | fieldIndex | value                      | valueIndex
    ${"dom"}    | ${1}       | ${13}                      | ${13}
    ${"dow"}    | ${2}       | ${4}                       | ${5}
    ${"hour"}   | ${3}       | ${DateUtils.getUtcHour(2)} | ${3}
    ${"minute"} | ${4}       | ${30}                      | ${31}
  `(
    "handles $fieldName change",
    ({ fieldName, fieldIndex, value, valueIndex }) => {
      render(
        <ScheduleItem
          {...defaultProps}
          item={{ ...SCHEDULE_MOCK, enabled: false }}
        />
      );
      TestUtils.selectAll("DropdownButton__Wrapper-")[fieldIndex]?.click();
      TestUtils.selectAll("Dropdown__ListItem-")[valueIndex]?.click();
      expect(defaultProps.onChange).toHaveBeenCalledWith({
        schedule: { [fieldName]: value },
      });
    }
  );

  it("enables item", () => {
    render(<ScheduleItem {...defaultProps} />);
    TestUtils.select("Switch__InputWrapper-")!.click();
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      {
        enabled: false,
      },
      true
    );
  });
});
