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

import { fireEvent, render } from "@testing-library/react";
import { TASK_MOCK } from "@tests/mocks/ExecutionsMock";
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";
import TestUtils from "@tests/TestUtils";

import Tasks from "./";

jest.mock("@src/components/modules/TransferModule/TaskItem", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid={`TaskItem-${props.item.id}`}
      onMouseUp={props.onMouseUp}
      onMouseDown={props.onMouseDown}
    >
      <div data-testid="TaskItem-Content">
        ID: {props.item.id}; Open: {String(props.open)};
      </div>
      <div
        data-testid="TaskItem-DependsOn"
        onClick={() => {
          props.onDependsOnClick(props.item.depends_on[0]);
        }}
      />
    </div>
  ),
}));

describe("Tasks", () => {
  let defaultProps: Tasks["props"];

  beforeEach(() => {
    defaultProps = {
      items: [
        { ...TASK_MOCK },
        { ...TASK_MOCK, id: "task-2", depends_on: ["task-id"] },
      ],
      instancesDetails: [INSTANCE_MOCK],
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<Tasks {...defaultProps} />);
    expect(getByText("Task")).toBeTruthy();
  });

  it("opens running task, closes when not running", () => {
    const { rerender, getByTestId } = render(<Tasks {...defaultProps} />);
    const taskItem = getByTestId("TaskItem-task-2");
    expect(taskItem).toBeTruthy();
    expect(taskItem.textContent).toContain("Open: false");

    rerender(
      <Tasks
        {...defaultProps}
        items={[
          defaultProps.items[0],
          { ...defaultProps.items[1], status: "RUNNING" },
        ]}
      />
    );
    expect(taskItem.textContent).toContain("Open: true");

    rerender(<Tasks {...defaultProps} />);
    expect(taskItem.textContent).toContain("Open: false");
  });

  it("handles a little drag as mouse click", () => {
    const { getByTestId } = render(<Tasks {...defaultProps} />);
    const taskItem = getByTestId("TaskItem-task-id");
    expect(taskItem).toBeTruthy();
    expect(taskItem.textContent).toContain("Open: false");

    fireEvent.mouseDown(taskItem);
    fireEvent.mouseUp(taskItem);
    expect(taskItem.textContent).toContain("Open: true");

    fireEvent.mouseDown(taskItem);
    fireEvent.mouseUp(taskItem);
    expect(taskItem.textContent).toContain("Open: false");
  });

  it("handles depends on click", () => {
    const { getByTestId } = render(<Tasks {...defaultProps} />);
    const firstTaskItem = getByTestId("TaskItem-task-id");
    const secondTaskItem = getByTestId("TaskItem-task-2");
    expect(firstTaskItem).toBeTruthy();
    expect(secondTaskItem).toBeTruthy();
    expect(firstTaskItem.textContent).toContain("Open: false");
    expect(secondTaskItem.textContent).toContain("Open: false");

    fireEvent.mouseDown(secondTaskItem);
    fireEvent.mouseUp(secondTaskItem);
    expect(secondTaskItem.textContent).toContain("Open: true");
    const dependsOn = secondTaskItem.querySelector(
      "[data-testid='TaskItem-DependsOn']"
    ) as HTMLElement;
    expect(dependsOn).toBeTruthy();
    dependsOn!.click();
    expect(firstTaskItem.textContent).toContain("Open: true");
  });

  it("renders loading", () => {
    render(<Tasks {...defaultProps} loading />);
    expect(TestUtils.select("Tasks__LoadingWrapper")).toBeTruthy();
  });
});
