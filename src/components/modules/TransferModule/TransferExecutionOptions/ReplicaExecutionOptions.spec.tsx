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
import TestUtils from "@tests/TestUtils";

import ReplicaExecutionOptions from ".";

jest.mock("@src/plugins/default/ContentPlugin", () => jest.fn(() => null));

describe("ReplicaExecutionOptions", () => {
  let defaultProps: ReplicaExecutionOptions["props"];

  beforeEach(() => {
    defaultProps = {
      options: {
        shutdown_instances: true,
      },
      disableExecutionOptions: false,
      onChange: jest.fn(),
      executionLabel: "Execute",
      onCancelClick: jest.fn(),
      onExecuteClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<ReplicaExecutionOptions {...defaultProps} />);
    expect(getByText(defaultProps.executionLabel)).toBeTruthy();
  });

  it("executes on Enter", () => {
    render(<ReplicaExecutionOptions {...defaultProps} />);
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(defaultProps.onExecuteClick).toHaveBeenCalled();
  });

  it("returns original field value if options is null", () => {
    render(
      <ReplicaExecutionOptions
        {...defaultProps}
        options={{ shutdown_instances: null }}
      />
    );
    expect(TestUtils.select("Switch__Wrapper")?.textContent).toBe("No");
  });

  it("handles value change", () => {
    render(<ReplicaExecutionOptions {...defaultProps} />);
    fireEvent.click(TestUtils.select("Switch__InputWrapper")!);
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      "shutdown_instances",
      false
    );
  });

  it("handles execute click", () => {
    const { getByText } = render(<ReplicaExecutionOptions {...defaultProps} />);
    fireEvent.click(getByText(defaultProps.executionLabel));
    expect(defaultProps.onExecuteClick).toHaveBeenCalled();
  });
});
