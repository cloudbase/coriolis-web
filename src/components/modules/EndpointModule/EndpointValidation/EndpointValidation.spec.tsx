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
import { render } from "@testing-library/react";

import EndpointValidation from "./EndpointValidation";

jest.mock("@src/components/ui/StatusComponents/StatusImage", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="StatusImage">
      Status: {props.status || "-"}, Loading: {String(props.loading || false)}
    </div>
  ),
}));

jest.mock("@src/utils/DomUtils", () => ({
  copyTextToClipboard: jest.fn(),
}));

describe("EndpointValidation", () => {
  let defaultProps: EndpointValidation["props"];

  beforeEach(() => {
    defaultProps = {
      loading: false,
      validation: {
        valid: true,
        message: "",
      },
      onCancelClick: jest.fn(),
      onRetryClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText, getByTestId } = render(
      <EndpointValidation {...defaultProps} />,
    );
    expect(getByText("Endpoint is Valid")).toBeTruthy();
    expect(getByTestId("StatusImage").textContent).toBe(
      "Status: COMPLETED, Loading: false",
    );
  });

  it("renders loading", () => {
    const { getByTestId, getByText } = render(
      <EndpointValidation {...defaultProps} loading />,
    );
    expect(getByTestId("StatusImage").textContent).toBe(
      "Status: -, Loading: true",
    );
    expect(getByText("Validating Endpoint")).toBeTruthy();
  });

  it("renders failed validation", () => {
    const { getByTestId, getByText } = render(
      <EndpointValidation
        {...defaultProps}
        validation={{
          valid: false,
          message: "connection error",
        }}
      />,
    );
    expect(getByTestId("StatusImage").textContent).toBe(
      "Status: ERROR, Loading: false",
    );
    expect(getByText("connection error")).toBeTruthy();
  });

  it("renders generic error message", () => {
    const { getByTestId, getByText } = render(
      <EndpointValidation
        {...defaultProps}
        validation={{
          valid: false,
          message: "",
        }}
      />,
    );
    expect(getByTestId("StatusImage").textContent).toBe(
      "Status: ERROR, Loading: false",
    );
    expect(getByText("An unexpected error occurred.")).toBeTruthy();
  });

  it("copies the error message to clipboard", () => {
    const { getByText } = render(
      <EndpointValidation
        {...defaultProps}
        validation={{
          valid: false,
          message: "connection error",
        }}
      />,
    );
    getByText("connection error").click();
    expect(DomUtils.copyTextToClipboard).toHaveBeenCalledWith(
      "connection error",
    );
  });
});
