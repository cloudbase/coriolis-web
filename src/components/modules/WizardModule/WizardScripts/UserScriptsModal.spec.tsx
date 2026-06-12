/*
Copyright (C) 2026  Cloudbase Solutions SRL
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

import DomUtils from "@src/utils/DomUtils";

import UserScriptsModal from "./UserScriptsModal";

describe("UserScriptsModal", () => {
  const baseProps = {
    title: "Linux Script File",
    global: "linux" as const,
    instanceId: null,
    onRequestClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a file picker per phase with the three phase labels", () => {
    const { getByText, getAllByText } = render(
      <UserScriptsModal {...baseProps} scriptsByPhase={{}} />,
    );
    expect(getByText("OS morphing: before mount")).toBeTruthy();
    expect(getByText("OS morphing: after mount")).toBeTruthy();
    expect(getByText("VM first boot script")).toBeTruthy();
    expect(getAllByText("Choose File...").length).toBe(3);
  });

  it("saves one script per configured phase and skips empty ones", () => {
    const onSave = jest.fn();
    const { getByText } = render(
      <UserScriptsModal
        {...baseProps}
        onSave={onSave}
        scriptsByPhase={{
          osmorphing_pre_os_mount: { content: "echo pre", fileName: "pre.sh" },
          replica_first_boot: { content: "echo boot", fileName: null },
        }}
      />,
    );
    fireEvent.click(getByText("Save"));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith([
      {
        global: "linux",
        instanceId: null,
        phase: "osmorphing_pre_os_mount",
        scriptContent: "echo pre",
        fileName: "pre.sh",
      },
      {
        global: "linux",
        instanceId: null,
        phase: "replica_first_boot",
        scriptContent: "echo boot",
        fileName: null,
      },
    ]);
  });

  it("shows the file name + Remove for a configured phase, and Remove clears it", () => {
    const onSave = jest.fn();
    const { getByText, getAllByText } = render(
      <UserScriptsModal
        {...baseProps}
        onSave={onSave}
        scriptsByPhase={{
          osmorphing_post_os_mount: {
            content: "echo saved",
            fileName: "saved.sh",
          },
        }}
      />,
    );
    expect(getByText("saved.sh")).toBeTruthy();
    expect(getAllByText("Choose File...").length).toBe(2);

    const downloadSpy = jest
      .spyOn(DomUtils, "download")
      .mockImplementation(() => {});
    fireEvent.click(getByText("Download"));
    expect(downloadSpy).toHaveBeenCalledWith("echo saved", "saved.sh");
    downloadSpy.mockRestore();

    fireEvent.click(getByText("Remove"));
    expect(getAllByText("Choose File...").length).toBe(3);

    fireEvent.click(getByText("Save"));
    expect(onSave).toHaveBeenCalledWith([]);
  });
});
