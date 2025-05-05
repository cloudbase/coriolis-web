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

import EndpointDuplicateOptions from "./EndpointDuplicateOptions";

jest.mock("@src/components/ui/FieldInput", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="FieldInput__Wrapper"
      onClick={() => {
        props.onChange && props.onChange("1");
      }}
    >
      {props.label} - {props.value}
    </div>
  ),
}));

describe("EndpointDuplicateOptions", () => {
  let defaultProps: EndpointDuplicateOptions["props"];

  beforeEach(() => {
    defaultProps = {
      projects: [
        { id: "1", name: "admin" },
        { id: "2", name: "admin2" },
      ],
      selectedProjectId: "2",
      duplicating: false,
      onCancelClick: jest.fn(),
      onDuplicateClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(
      <EndpointDuplicateOptions {...defaultProps} />,
    );
    expect(getByText("Duplicate To Project - 2")).toBeTruthy();
  });

  it("handles submit on Enter key press", () => {
    render(<EndpointDuplicateOptions {...defaultProps} />);

    fireEvent.keyDown(document, { key: "Enter" });

    expect(defaultProps.onDuplicateClick).toHaveBeenCalledWith("2");
  });

  it("shows duplicating status", () => {
    const { getByText } = render(
      <EndpointDuplicateOptions {...defaultProps} duplicating />,
    );

    expect(getByText("Duplicating Endpoint")).toBeTruthy();
  });

  it("changes project", () => {
    const { getByTestId } = render(
      <EndpointDuplicateOptions {...defaultProps} />,
    );

    fireEvent.click(getByTestId("FieldInput__Wrapper"));
    expect(getByTestId("FieldInput__Wrapper").textContent).toBe(
      "Duplicate To Project - 1",
    );
  });

  it("handles duplicate click", () => {
    const { getByText } = render(
      <EndpointDuplicateOptions {...defaultProps} />,
    );

    fireEvent.click(getByText("Duplicate"));
    expect(defaultProps.onDuplicateClick).toHaveBeenCalledWith("2");
  });
});
