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

import React, { act } from "react";

import { render } from "@testing-library/react";
import {
  EXECUTION_MOCK,
  EXECUTION_TASKS_MOCK,
} from "@tests/mocks/ExecutionsMock";
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";
import TestUtils from "@tests/TestUtils";

import Executions from "./";

describe("Executions", () => {
  let defaultProps: Executions["props"];

  beforeEach(() => {
    defaultProps = {
      executions: [EXECUTION_MOCK],
      executionsTasks: [EXECUTION_TASKS_MOCK],
      loading: false,
      tasksLoading: false,
      instancesDetails: [INSTANCE_MOCK],
      onChange: jest.fn(),
      onCancelExecutionClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<Executions {...defaultProps} />);
    expect(getByText(EXECUTION_TASKS_MOCK.tasks[0].id)).toBeTruthy();
    expect(getByText(EXECUTION_MOCK.id)).toBeTruthy();
  });

  it("sets selected execution on new props", () => {
    const { getByText, rerender } = render(<Executions {...defaultProps} />);
    rerender(
      <Executions
        {...defaultProps}
        executions={[
          EXECUTION_MOCK,
          { ...EXECUTION_MOCK, id: "new-id", status: "RUNNING" },
        ]}
      />
    );
    expect(getByText("new-id")).toBeTruthy();

    rerender(
      <Executions
        {...defaultProps}
        executions={[
          EXECUTION_MOCK,
          { ...EXECUTION_MOCK, id: "new-id", status: "COMPLETED" },
          { ...EXECUTION_MOCK, id: "new-id-2", status: "RUNNING" },
        ]}
      />
    );
    expect(getByText("new-id-2")).toBeTruthy();

    rerender(<Executions {...defaultProps} executions={[EXECUTION_MOCK]} />);
    expect(getByText(EXECUTION_MOCK.id)).toBeTruthy();
  });

  it("renders with no executions", () => {
    const { getByText, rerender } = render(<Executions {...defaultProps} />);
    expect(getByText(EXECUTION_MOCK.id)).toBeTruthy();

    rerender(<Executions {...defaultProps} executions={[]} />);
    expect(getByText("This transfer has not been executed yet.")).toBeTruthy();
  });

  it("doesn't dispatch onChange if no executions", () => {
    const { rerender } = render(
      <Executions {...defaultProps} executions={[]} />
    );
    rerender(<Executions {...defaultProps} executions={[]} />);
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it("handles previous executions", async () => {
    const { rerender } = render(
      <Executions
        {...defaultProps}
        executions={[
          EXECUTION_MOCK,
          { ...EXECUTION_MOCK, id: "new-id", status: "RUNNING" },
        ]}
      />
    );
    const previousArrow = () =>
      TestUtils.selectAll(
        "Arrow__Wrapper",
        TestUtils.select("Timeline__Wrapper")!
      )[0];
    await act(async () => {
      previousArrow().click();
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith(EXECUTION_MOCK.id);

    rerender(<Executions {...defaultProps} />);
    await act(async () => {
      previousArrow().click();
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith(EXECUTION_MOCK.id);
  });

  it("doesn't handle previous executions in edge cases", () => {
    const executionsComponent = new Executions(defaultProps);
    executionsComponent.handlePreviousExecutionClick();
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it("handles next executions", async () => {
    render(
      <Executions
        {...defaultProps}
        executions={[
          EXECUTION_MOCK,
          { ...EXECUTION_MOCK, id: "new-id", status: "RUNNING" },
        ]}
      />
    );
    const nextArrow = TestUtils.selectAll(
      "Arrow__Wrapper",
      TestUtils.select("Timeline__Wrapper")!
    )[1];
    await act(async () => {
      nextArrow.click();
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith("new-id");

    const previousArrow = () =>
      TestUtils.selectAll(
        "Arrow__Wrapper",
        TestUtils.select("Timeline__Wrapper")!
      )[0];
    await act(async () => {
      previousArrow().click();
    });

    await act(async () => {
      nextArrow.click();
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith("new-id");
  });

  it("doesn't handle next executions in edge cases", () => {
    const executionsComponent = new Executions(defaultProps);
    executionsComponent.handleNextExecutionClick();
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it("handles timeline item click", async () => {
    render(
      <Executions
        {...defaultProps}
        executions={[
          EXECUTION_MOCK,
          { ...EXECUTION_MOCK, id: "new-id", status: "RUNNING" },
        ]}
      />
    );
    const timelineItem = TestUtils.select("Timeline__Item-");
    expect(timelineItem).toBeTruthy();
    await act(async () => {
      timelineItem!.click();
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith(EXECUTION_MOCK.id);
  });

  it("handles cancel execution click", async () => {
    const newExecution = { ...EXECUTION_MOCK, id: "new-id", status: "RUNNING" };
    render(
      <Executions
        {...defaultProps}
        executions={[EXECUTION_MOCK, newExecution]}
      />
    );
    const cancelExecutionButton = Array.from(
      document.querySelectorAll("button")
    ).find(el => el.textContent === "Cancel Execution");
    expect(cancelExecutionButton).toBeTruthy();
    await act(async () => {
      cancelExecutionButton!.click();
    });
    expect(defaultProps.onCancelExecutionClick).toHaveBeenCalledWith(
      newExecution
    );
  });

  it("force cancels execution", async () => {
    const newExecution = {
      ...EXECUTION_MOCK,
      id: "new-id",
      status: "CANCELLING",
    };
    render(
      <Executions
        {...defaultProps}
        executions={[EXECUTION_MOCK, newExecution]}
      />
    );
    const cancelExecutionButton = Array.from(
      document.querySelectorAll("button")
    ).find(el => el.textContent === "Force Cancel Execution");
    expect(cancelExecutionButton).toBeTruthy();
    await act(async () => {
      cancelExecutionButton!.click();
    });
    expect(defaultProps.onCancelExecutionClick).toHaveBeenCalledWith(
      newExecution,
      true
    );
  });

  it("renders loading", () => {
    render(<Executions {...defaultProps} loading />);
    expect(TestUtils.select("Executions__LoadingWrapper")).toBeTruthy();
  });

  it("deletes execution", async () => {
    const deleteExecution = jest.fn();
    render(
      <Executions {...defaultProps} onDeleteExecutionClick={deleteExecution} />
    );
    const deleteExecutionButton = Array.from(
      document.querySelectorAll("button")
    ).find(el => el.textContent === "Delete Execution");
    expect(deleteExecutionButton).toBeTruthy();
    await act(async () => {
      deleteExecutionButton!.click();
    });
    expect(deleteExecution).toHaveBeenCalledWith(EXECUTION_MOCK);
  });
});
