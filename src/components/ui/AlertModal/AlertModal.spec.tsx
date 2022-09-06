/*
Copyright (C) 2017  Cloudbase Solutions SRL
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
import { render } from "@testing-library/react";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";
import TestUtils from "@tests/TestUtils";
import AlertModal from "./AlertModal";

jest.mock("../StatusComponents/StatusImage/StatusImage", () =>
  jest.fn(() => null)
);

describe("AlertModal", () => {
  it("renders confirmation as default with message and extra message", () => {
    const message = "message";
    const extraMessage = "extra message";
    const { queryByText } = render(
      <AlertModal isOpen message={message} extraMessage={extraMessage} />
    );
    expect(TestUtils.select("AlertModal__Message")?.innerHTML).toBe(message);
    expect(TestUtils.select("AlertModal__ExtraMessage")?.textContent).toBe(
      extraMessage
    );

    expect(queryByText("No")).toBeTruthy();
    expect(queryByText("Yes")).toBeTruthy();
    expect(queryByText("Dismiss")).toBeNull();
    expect(StatusImage).toHaveBeenCalledWith({ status: "confirmation" }, {});
  });

  it("has correct buttons for errors", () => {
    const { queryByText } = render(
      <AlertModal
        isOpen
        message="message"
        extraMessage="extra message"
        type="error"
      />
    );
    expect(queryByText("Dismiss")).toBeTruthy();
    expect(queryByText("No")).toBeNull();
    expect(queryByText("Yes")).toBeNull();
  });

  it("renders loading", () => {
    const { queryByText } = render(
      <AlertModal
        isOpen
        message="message"
        extraMessage="extra message"
        type="loading"
      />
    );
    expect(queryByText("Dismiss")).toBeNull();
    expect(queryByText("No")).toBeNull();
    expect(queryByText("Yes")).toBeNull();
    expect(StatusImage).toHaveBeenCalledWith({ status: "RUNNING" }, {});
  });
});
