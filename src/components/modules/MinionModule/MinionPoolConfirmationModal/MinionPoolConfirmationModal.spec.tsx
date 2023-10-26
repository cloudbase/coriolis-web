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

import MinionPoolConfirmationModal from "./MinionPoolConfirmationModal";

jest.mock("@src/components/ui/FieldInput", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="FieldInput"
      onClick={() => {
        props.onChange(true);
      }}
    >
      {props.label} - {String(props.value)}
    </div>
  ),
}));

describe("MinionPoolConfirmationModal", () => {
  let defaultProps: MinionPoolConfirmationModal["props"];

  beforeEach(() => {
    defaultProps = {
      onCancelClick: jest.fn(),
      onExecuteClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    render(<MinionPoolConfirmationModal {...defaultProps} />);
    let element: Element | null = null;
    document.querySelectorAll("*").forEach(el => {
      if (el.textContent && el.textContent.includes("Are you sure")) {
        element = el;
      }
    });
    if (!element) throw new Error(`Element not found`);
    expect(element).toBeTruthy();
  });

  it("handles submit on Enter key press", () => {
    render(<MinionPoolConfirmationModal {...defaultProps} />);

    fireEvent.keyDown(document, { key: "Enter" });

    expect(defaultProps.onExecuteClick).toHaveBeenCalledWith(false);
  });

  it("executes with force flag", () => {
    const { getByTestId } = render(
      <MinionPoolConfirmationModal {...defaultProps} />
    );

    fireEvent.click(getByTestId("FieldInput"));
    fireEvent.click(document.querySelectorAll("button")[1]);

    expect(defaultProps.onExecuteClick).toHaveBeenCalledWith(true);
  });
});
