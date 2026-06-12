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

import { applyUserScriptsChange } from "./UserScriptUtils";

import type { InstanceScript } from "@src/@types/Instance";

const script = (over: Partial<InstanceScript>): InstanceScript => ({
  global: null,
  instanceId: null,
  scriptContent: "echo hi",
  fileName: null,
  ...over,
});

const empty = { uploadedScripts: [], removedScripts: [] };

describe("applyUserScriptsChange", () => {
  it("adds new scripts for a target to uploadedScripts", () => {
    const win = script({ global: "windows", phase: "replica_first_boot" });

    const next = applyUserScriptsChange(
      empty,
      { global: "windows", instanceId: null },
      [win],
      false,
    );

    expect(next.uploadedScripts).toEqual([win]);
    expect(next.removedScripts).toEqual([]);
  });

  it("replaces a target's scripts without touching other targets", () => {
    const linux = script({ global: "linux" });
    const oldWin = script({ global: "windows", scriptContent: "old" });
    const newWin = script({ global: "windows", scriptContent: "new" });

    const next = applyUserScriptsChange(
      { uploadedScripts: [linux, oldWin], removedScripts: [] },
      { global: "windows", instanceId: null },
      [newWin],
      false,
    );

    expect(next.uploadedScripts).toEqual([linux, newWin]);
    expect(next.removedScripts).toEqual([]);
  });

  it("records a null removed entry when clearing a previously-saved target", () => {
    const win = script({ global: "windows" });

    const next = applyUserScriptsChange(
      { uploadedScripts: [win], removedScripts: [] },
      { global: "windows", instanceId: null },
      [],
      true,
    );

    expect(next.uploadedScripts).toEqual([]);
    expect(next.removedScripts).toEqual([
      {
        global: "windows",
        instanceId: null,
        scriptContent: null,
        fileName: null,
      },
    ]);
  });

  it("does not record a removed entry when clearing a never-saved target", () => {
    const win = script({ global: "windows" });

    const next = applyUserScriptsChange(
      { uploadedScripts: [win], removedScripts: [] },
      { global: "windows", instanceId: null },
      [],
      false,
    );

    expect(next.uploadedScripts).toEqual([]);
    expect(next.removedScripts).toEqual([]);
  });

  it("does not duplicate the removed entry when clearing twice", () => {
    const removedWin = script({
      global: "windows",
      scriptContent: null,
    });

    const next = applyUserScriptsChange(
      { uploadedScripts: [], removedScripts: [removedWin] },
      { global: "windows", instanceId: null },
      [],
      true,
    );

    expect(next.removedScripts).toHaveLength(1);
    expect(next.removedScripts[0].global).toBe("windows");
    expect(next.removedScripts[0].scriptContent).toBeNull();
  });

  it("matches instance targets by instanceId, independently of globals", () => {
    const win = script({ global: "windows" });
    const inst = script({ instanceId: "i-1", scriptContent: "old" });
    const newInst = script({ instanceId: "i-1", scriptContent: "new" });

    const next = applyUserScriptsChange(
      { uploadedScripts: [win, inst], removedScripts: [] },
      { global: null, instanceId: "i-1" },
      [newInst],
      false,
    );

    expect(next.uploadedScripts).toEqual([win, newInst]);
    expect(next.removedScripts).toEqual([]);
  });
});
