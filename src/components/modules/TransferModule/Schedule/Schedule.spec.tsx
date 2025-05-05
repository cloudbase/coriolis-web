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
import React, { act } from "react";

import DateUtils from "@src/utils/DateUtils";
import { render } from "@testing-library/react";
import { SCHEDULE_MOCK } from "@tests/mocks/SchedulesMock";
import TestUtils from "@tests/TestUtils";

import Schedule from "./";

jest.mock("@src/plugins/default/ContentPlugin", () => jest.fn(() => null));

describe("Schedule", () => {
  let defaultProps: Schedule["props"];

  beforeEach(() => {
    defaultProps = {
      schedules: [SCHEDULE_MOCK],
      unsavedSchedules: [],
      timezone: "utc",
      disableExecutionOptions: false,
      onTimezoneChange: jest.fn(),
      onAddScheduleClick: jest.fn(),
      onChange: jest.fn(),
      onRemove: jest.fn(),
      onSaveSchedule: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<Schedule {...defaultProps} />);
    expect(getByText("Add Schedule")).toBeTruthy();
    expect(TestUtils.select("Schedule__Timezone-")?.textContent).toContain(
      "all times inUTC",
    );
  });

  it("deletes a schedule", async () => {
    render(
      <Schedule
        {...defaultProps}
        schedules={[{ ...SCHEDULE_MOCK, enabled: false }]}
      />,
    );
    await act(async () => {
      TestUtils.select("ScheduleItem__DeleteButton-")?.click();
    });
    expect(TestUtils.select("AlertModal__Message-")?.textContent).toContain(
      "delete this schedule?",
    );
    const modal = TestUtils.select("AlertModal__Wrapper-")!;
    await act(async () => {
      Array.from(modal.querySelectorAll("button"))
        .find(b => b.textContent === "Yes")
        ?.click();
    });
    expect(defaultProps.onRemove).toHaveBeenCalledWith(SCHEDULE_MOCK.id);
  });

  it("dismisses the delete modal", async () => {
    render(
      <Schedule
        {...defaultProps}
        schedules={[{ ...SCHEDULE_MOCK, enabled: false }]}
      />,
    );
    await act(async () => {
      TestUtils.select("ScheduleItem__DeleteButton-")?.click();
    });
    expect(TestUtils.select("AlertModal__Message-")?.textContent).toContain(
      "delete this schedule?",
    );
    const modal = TestUtils.select("AlertModal__Wrapper-")!;
    await act(async () => {
      Array.from(modal.querySelectorAll("button"))
        .find(b => b.textContent === "No")
        ?.click();
    });
    expect(defaultProps.onRemove).not.toHaveBeenCalled();
  });

  it("changes execution options", async () => {
    render(
      <Schedule
        {...defaultProps}
        schedules={[{ ...SCHEDULE_MOCK, enabled: false }]}
      />,
    );
    const optionsButton = Array.from(document.querySelectorAll("button")).find(
      el => el.textContent === "•••",
    );
    await act(() => {
      optionsButton?.click();
    });
    expect(TestUtils.select("Modal__Title-")?.textContent).toBe(
      "Execution options",
    );
    const modal = TestUtils.select("TransferExecutionOptions__Wrapper-")!;
    await act(async () => {
      TestUtils.select("Switch__InputWrapper-", modal)?.click();
    });
    const yesButton = Array.from(modal.querySelectorAll("button")).find(
      el => el.textContent === "Save",
    );
    expect(yesButton).toBeTruthy();
    await act(async () => {
      yesButton!.click();
    });
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it("dismisses the execution options modal", async () => {
    render(
      <Schedule
        {...defaultProps}
        schedules={[{ ...SCHEDULE_MOCK, enabled: false }]}
      />,
    );
    const optionsButton = Array.from(document.querySelectorAll("button")).find(
      el => el.textContent === "•••",
    );
    await act(() => {
      optionsButton?.click();
    });
    expect(TestUtils.select("Modal__Title-")?.textContent).toBe(
      "Execution options",
    );
    const modal = TestUtils.select("TransferExecutionOptions__Wrapper-")!;
    const noButton = Array.from(modal.querySelectorAll("button")).find(
      el => el.textContent === "Cancel",
    );
    expect(noButton).toBeTruthy();
    await act(async () => {
      noButton!.click();
    });
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it("adds a schedule with UTC", () => {
    const { getByText } = render(<Schedule {...defaultProps} />);
    getByText("Add Schedule").click();
    expect(defaultProps.onAddScheduleClick).toHaveBeenCalledWith({
      schedule: { hour: 0, minute: 0 },
    });
  });

  it("adds a schedule with local timezone", () => {
    const { getByText } = render(
      <Schedule {...defaultProps} timezone="local" />,
    );
    getByText("Add Schedule").click();
    expect(defaultProps.onAddScheduleClick).toHaveBeenCalledWith({
      schedule: { hour: DateUtils.getUtcHour(0), minute: 0 },
    });
  });

  it("renders loading", () => {
    render(<Schedule {...defaultProps} loading />);
    expect(TestUtils.select("Schedule__LoadingWrapper")).toBeTruthy();
  });

  it("changes schedule", async () => {
    render(
      <Schedule
        {...defaultProps}
        schedules={[{ ...SCHEDULE_MOCK, enabled: false }]}
      />,
    );
    const monthDropdown = TestUtils.select("DropdownButton__Wrapper-")!;
    expect(monthDropdown).toBeTruthy();
    await act(async () => {
      monthDropdown.click();
    });
    const february = Array.from(
      TestUtils.selectAll("Dropdown__ListItem-")!,
    ).find(el => el.textContent === DateTime.local(2023, 2).monthLong);
    expect(february).toBeTruthy();
    await act(async () => {
      february!.click();
    });
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      SCHEDULE_MOCK.id,
      {
        schedule: { month: 2 },
      },
      undefined,
    );
  });

  it("saves schedule", () => {
    render(
      <Schedule
        {...defaultProps}
        schedules={[{ ...SCHEDULE_MOCK, enabled: false }]}
        unsavedSchedules={[{ ...SCHEDULE_MOCK }]}
      />,
    );
    TestUtils.select("ScheduleItem__SaveButton-")?.click();
    expect(defaultProps.onSaveSchedule).toHaveBeenCalled();
  });

  it("handles saving", () => {
    render(<Schedule {...defaultProps} savingIds={[SCHEDULE_MOCK.id!]} />);
    expect(TestUtils.select("ScheduleItem__SavingIcon-")).toBeTruthy();
  });

  it("handles enabling", () => {
    render(<Schedule {...defaultProps} enablingIds={[SCHEDULE_MOCK.id!]} />);
    expect(TestUtils.select("ScheduleItem__EnablingIcon-")).toBeTruthy();
  });

  it("handles deleting", () => {
    render(<Schedule {...defaultProps} deletingIds={[SCHEDULE_MOCK.id!]} />);
    expect(TestUtils.select("ScheduleItem__DeletingIcon-")).toBeTruthy();
  });

  it("renders primary no schedules", () => {
    render(<Schedule {...defaultProps} schedules={[]} />);
    expect(TestUtils.select("Schedule__NoSchedules-")?.textContent).toContain(
      "has no Schedules",
    );
  });

  it("renders secondary no schedules", () => {
    render(<Schedule {...defaultProps} schedules={[]} secondaryEmpty />);
    expect(TestUtils.select("Schedule__NoSchedules-")?.textContent).toContain(
      "Schedule this Transfer",
    );
  });

  it("adds schedule from no schedules", () => {
    const { getByText, rerender } = render(
      <Schedule {...defaultProps} schedules={[]} />,
    );
    getByText("Add Schedule").click();
    expect(defaultProps.onAddScheduleClick).toHaveBeenCalled();

    rerender(<Schedule {...defaultProps} schedules={[]} adding />);
    expect(getByText("Adding ...")).toBeTruthy();
  });

  it("changes timezone", async () => {
    render(<Schedule {...defaultProps} />);
    const timezoneDropdown = TestUtils.select(
      "DropdownLink__LinkButton-",
      TestUtils.select("Schedule__Timezone-")!,
    )!;
    expect(timezoneDropdown).toBeTruthy();
    await act(async () => {
      timezoneDropdown.click();
    });
    await act(async () => {
      TestUtils.select("DropdownLink__ListItem-")!.click();
    });
    expect(defaultProps.onTimezoneChange).toHaveBeenCalled();
  });
});
