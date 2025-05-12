/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import Modal from "@src/components/ui/Modal";
import TestUtils from "@tests/TestUtils";

describe("Modal", () => {
  it("renders content", () => {
    render(
      <Modal isOpen title="Test Title">
        <div className="content">Test Content</div>
      </Modal>,
    );
    expect(
      TestUtils.select("ReactModal__Content")!.querySelector(".content")!
        .textContent,
    ).toBe("Test Content");
    expect(TestUtils.select("Modal__Title")!.textContent).toBe("Test Title");
  });

  it("requests close on overlay click", () => {
    const onRequestClose = jest.fn();
    render(
      <Modal isOpen onRequestClose={onRequestClose}>
        <div>Test Content</div>
      </Modal>,
    );
    TestUtils.select("ReactModal__Overlay")!.click();
    expect(onRequestClose).toHaveBeenCalled();
  });
});
