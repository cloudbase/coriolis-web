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

import metalHubStore from "@src/stores/MetalHubStore";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { METALHUB_SERVER_MOCK } from "@tests/mocks/MetalHubServerMock";

import MetalHubModal from "./MetalHubModal";

describe("MetalHubModal", () => {
  let defaultProps: MetalHubModal["props"];
  let metalHubStoreSpies: {
    clearValidationError: jest.SpyInstance;
    patchServer: jest.SpyInstance;
    validateServer: jest.SpyInstance;
    addServer: jest.SpyInstance;
  };

  beforeEach(() => {
    metalHubStoreSpies = {
      clearValidationError: jest.spyOn(metalHubStore, "clearValidationError"),
      patchServer: jest.spyOn(metalHubStore, "patchServer").mockResolvedValue(),
      validateServer: jest
        .spyOn(metalHubStore, "validateServer")
        .mockResolvedValue(true),
      addServer: jest.spyOn(metalHubStore, "addServer").mockResolvedValue({
        ...METALHUB_SERVER_MOCK,
      }),
    };
    defaultProps = {
      onRequestClose: jest.fn(),
      onUpdateDone: jest.fn(),
    };
  });

  it("renders without crashing and clears validation error on unmount", () => {
    const { getByText, unmount } = render(<MetalHubModal {...defaultProps} />);
    expect(getByText("Add Coriolis Bare Metal Server")).toBeTruthy();
    unmount();
    expect(metalHubStoreSpies.clearValidationError).toHaveBeenCalledTimes(1);
  });

  it("shows the server for editing", () => {
    const { getByText } = render(
      <MetalHubModal {...defaultProps} server={{ ...METALHUB_SERVER_MOCK }} />
    );
    expect(getByText("Update Coriolis Bare Metal Server")).toBeTruthy();
    const testInput = (label: string, value: string) => {
      const input =
        getByText(label).parentElement!.parentElement!.querySelector("input");
      expect(input).toBeTruthy();
      expect(input!.value).toBe(value);
    };
    testInput(
      "Host",
      METALHUB_SERVER_MOCK.api_endpoint!.split(":")[1].replace("//", "")
    );
    testInput(
      "Port",
      METALHUB_SERVER_MOCK.api_endpoint!.split(":")[2].replace(/\/.*/, "")
    );
  });

  it("renders validation error", () => {
    metalHubStore.validationError = ["Validation error", "Validation error 2"];
    const { getByText } = render(
      <MetalHubModal {...defaultProps} server={{ ...METALHUB_SERVER_MOCK }} />
    );
    expect(getByText("Validation error")).toBeTruthy();
    expect(getByText("Validation error 2")).toBeTruthy();
    metalHubStore.validationError = [];
  });

  it("triggers submit on enter key", async () => {
    render(
      <MetalHubModal {...defaultProps} server={{ ...METALHUB_SERVER_MOCK }} />
    );
    const input = document.querySelector("input")!;
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    await waitFor(() => {
      expect(metalHubStoreSpies.patchServer).toHaveBeenCalledTimes(1);
    });
    expect(metalHubStoreSpies.validateServer).toHaveBeenCalledTimes(1);
  });

  it("highlights invalid fields", () => {
    const { getByText, getAllByText } = render(
      <MetalHubModal {...defaultProps} />
    );
    fireEvent.click(getByText("Validate and save"));
    expect(getAllByText("Required field").length).toBeGreaterThan(0);
  });

  it("adds new server", async () => {
    const { getByText } = render(<MetalHubModal {...defaultProps} />);
    const getInput = (label: string): HTMLInputElement =>
      getByText(label).parentElement!.parentElement!.querySelector("input")!;

    fireEvent.change(getInput("Host"), {
      target: { value: "api.example.com" },
    });
    fireEvent.change(getInput("Port"), { target: { value: "5566" } });
    fireEvent.click(getByText("Validate and save"));
    await waitFor(() => {
      expect(metalHubStoreSpies.addServer).toHaveBeenCalledWith(
        "https://api.example.com:5566/api/v1"
      );
    });
    expect(metalHubStoreSpies.validateServer).toHaveBeenCalledWith(
      METALHUB_SERVER_MOCK.id
    );
  });
});
