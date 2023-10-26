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

import DomUtils from "@src/utils/DomUtils";
import { fireEvent, render } from "@testing-library/react";
import { PROGRESS_UPDATE_MOCK, TASK_MOCK } from "@tests/mocks/ExecutionsMock";
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";
import TestUtils from "@tests/TestUtils";

import TaskItem from "./";

const COLUMN_WIDTHS = ["26%", "18%", "36%", "20%"];

describe("TaskItem", () => {
  let defaultProps: TaskItem["props"];

  beforeEach(() => {
    defaultProps = {
      columnWidths: COLUMN_WIDTHS,
      item: { ...TASK_MOCK, depends_on: ["task-id-2"] },
      otherItems: [
        {
          ...TASK_MOCK,
          id: "task-id-2",
        },
      ],
      open: true,
      instancesDetails: [INSTANCE_MOCK],
      onDependsOnClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<TaskItem {...defaultProps} />);
    expect(getByText(TASK_MOCK.id)).toBeTruthy();
  });

  it("renders '-' for no progress update", () => {
    const { getByText } = render(
      <TaskItem
        {...defaultProps}
        item={{ ...TASK_MOCK, progress_updates: [] }}
      />
    );
    expect(getByText("-")).toBeTruthy();
  });

  it("renders progress update percentage", () => {
    render(
      <TaskItem
        {...defaultProps}
        item={{
          ...TASK_MOCK,
          progress_updates: [{ ...PROGRESS_UPDATE_MOCK, total_steps: null }],
        }}
      />
    );
    const progressBar = TestUtils.select("ProgressBar__Progress");
    expect(progressBar).toBeTruthy();
  });

  it("doesn't render progress bar if no percentage", () => {
    render(
      <TaskItem
        {...defaultProps}
        item={{
          ...TASK_MOCK,
          progress_updates: [
            { ...PROGRESS_UPDATE_MOCK, total_steps: null, message: "test" },
          ],
        }}
      />
    );
    expect(TestUtils.select("ProgressBar__Progress")).toBeFalsy();
  });

  it("copies exception to clipboard", () => {
    jest.mock("@src/utils/DomUtils", () => ({
      getEventPath: jest.fn(),
    }));
    const copyTextToClipboard = jest
      .spyOn(DomUtils, "copyTextToClipboard")
      .mockImplementation(() => Promise.resolve(true));
    copyTextToClipboard;
    render(<TaskItem {...defaultProps} />);
    const exceptionText = TestUtils.select("TaskItem__ExceptionText")!;
    const copyButton = TestUtils.select("CopyButton__Wrapper", exceptionText);
    exceptionText.click();
    copyButton?.click();
    fireEvent.mouseDown(exceptionText);
    fireEvent.mouseUp(exceptionText);
    expect(copyTextToClipboard).toHaveBeenCalledTimes(2);
  });

  it("fires dependsOn click", () => {
    render(<TaskItem {...defaultProps} />);
    const dependsOnValueElement = TestUtils.select(
      "TaskItem__Value",
      TestUtils.select("TaskItem__DependsOnIds")!
    )!;
    fireEvent.mouseDown(dependsOnValueElement);
    fireEvent.mouseUp(dependsOnValueElement);
    dependsOnValueElement.click();

    expect(defaultProps.onDependsOnClick).toHaveBeenCalledTimes(1);
  });

  it("render 'N/A' if no exception text", () => {
    render(
      <TaskItem
        {...defaultProps}
        item={{ ...TASK_MOCK, exception_details: "" }}
      />
    );
    expect(
      Array.from(TestUtils.selectAll("TaskItem__Label-")).find(
        el => el.textContent === "Exception Details"
      )?.nextElementSibling?.textContent
    ).toBe("N/A");
  });
});
