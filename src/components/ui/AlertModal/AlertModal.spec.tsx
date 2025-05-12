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
import { render, fireEvent } from "@testing-library/react";
import AlertModal from "./AlertModal";
import KeyboardManager from "@src/utils/KeyboardManager";

jest.mock("@src/utils/KeyboardManager", () => ({
  onEnter: jest.fn(),
  removeKeyDown: jest.fn(),
}));

describe("AlertModal", () => {
  it("renders with default props", () => {
    const { getByText } = render(<AlertModal isOpen />);
    expect(getByText("Yes")).toBeTruthy();
    expect(getByText("No")).toBeTruthy();
  });

  it("adds and removes a keyboard listener on mount and unmount", () => {
    const { unmount } = render(<AlertModal isOpen />);

    expect(KeyboardManager.onEnter).toHaveBeenCalled();
    unmount();
    expect(KeyboardManager.removeKeyDown).toHaveBeenCalled();
  });

  it("calls onConfirmation when Enter is pressed", () => {
    const onConfirmationMock = jest.fn();
    render(<AlertModal isOpen onConfirmation={onConfirmationMock} />);

    // @ts-ignore
    const mockCallback = KeyboardManager.onEnter.mock.calls[0][1];
    mockCallback();

    expect(onConfirmationMock).toHaveBeenCalled();
  });

  it("renders error type correctly", () => {
    const { queryByText, getByText } = render(
      <AlertModal isOpen type="error" onRequestClose={jest.fn()} />,
    );

    expect(getByText("Dismiss")).toBeTruthy();
    expect(queryByText("Yes")).not.toBeTruthy();
    expect(queryByText("No")).not.toBeTruthy();
  });

  it("renders confirmation type correctly", () => {
    const { getByText } = render(<AlertModal isOpen type="confirmation" />);

    expect(getByText("Yes")).toBeTruthy();
    expect(getByText("No")).toBeTruthy();
  });

  it("renders loading type correctly", () => {
    const { queryByText } = render(<AlertModal isOpen type="loading" />);

    expect(queryByText("Yes")).not.toBeTruthy();
    expect(queryByText("No")).not.toBeTruthy();
    expect(queryByText("Dismiss")).not.toBeTruthy();
  });

  it("calls onRequestClose when No or Dismiss is clicked", () => {
    const onRequestCloseMock = jest.fn();

    const { getByText } = render(
      <AlertModal isOpen type="error" onRequestClose={onRequestCloseMock} />,
    );

    fireEvent.click(getByText("Dismiss"));
    expect(onRequestCloseMock).toHaveBeenCalled();

    const { getByText: getByTextConfirmation } = render(
      <AlertModal
        isOpen
        type="confirmation"
        onRequestClose={onRequestCloseMock}
      />,
    );

    fireEvent.click(getByTextConfirmation("No"));
    expect(onRequestCloseMock).toHaveBeenCalledTimes(2);
  });

  it("calls onConfirmation when Yes is clicked", () => {
    const onConfirmationMock = jest.fn();

    const { getByText } = render(
      <AlertModal
        isOpen
        type="confirmation"
        onConfirmation={onConfirmationMock}
      />,
    );

    fireEvent.click(getByText("Yes"));
    expect(onConfirmationMock).toHaveBeenCalled();
  });

  it("renders the message when provided", () => {
    const customMessage = "This is a custom message";
    const { getByText } = render(<AlertModal isOpen message={customMessage} />);
    expect(getByText(customMessage)).toBeTruthy();
  });

  it("does not render the message when not provided", () => {
    const { queryByText } = render(<AlertModal isOpen />);
    expect(queryByText(/This is a custom message/i)).not.toBeTruthy();
  });

  it("renders the extraMessage when provided", () => {
    const customExtraMessage = "This is an extra message";
    const { getByText } = render(
      <AlertModal isOpen extraMessage={customExtraMessage} />,
    );
    expect(getByText(customExtraMessage)).toBeTruthy();
  });

  it("does not render the extraMessage when not provided", () => {
    const { queryByText } = render(<AlertModal isOpen />);
    expect(queryByText(/This is an extra message/i)).not.toBeTruthy();
  });

  it("renders confirmation buttons when type is confirmation", () => {
    const { getByText } = render(<AlertModal isOpen type="confirmation" />);

    expect(getByText("Yes")).toBeTruthy();
    expect(getByText("No")).toBeTruthy();
  });

  it("renders message and extraMessage for confirmation", () => {
    const customMessage = "Confirm this action?";
    const customExtraMessage = "This will perform a special task.";
    const { getByText } = render(
      <AlertModal
        isOpen
        type="confirmation"
        message={customMessage}
        extraMessage={customExtraMessage}
      />,
    );

    expect(getByText(customMessage)).toBeTruthy();
    expect(getByText(customExtraMessage)).toBeTruthy();
  });

  it("calls onConfirmation when Yes is clicked", () => {
    const onConfirmationMock = jest.fn();
    const { getByText } = render(
      <AlertModal
        isOpen
        type="confirmation"
        onConfirmation={onConfirmationMock}
      />,
    );

    fireEvent.click(getByText("Yes"));
    expect(onConfirmationMock).toHaveBeenCalled();
  });

  it("calls onRequestClose when No is clicked", () => {
    const onRequestCloseMock = jest.fn();
    const { getByText } = render(
      <AlertModal
        isOpen
        type="confirmation"
        onRequestClose={onRequestCloseMock}
      />,
    );

    fireEvent.click(getByText("No"));
    expect(onRequestCloseMock).toHaveBeenCalled();
  });
});
