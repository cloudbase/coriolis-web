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

import type { InstanceScript } from "@src/@types/Instance";
import { OptionsSchemaPlugin } from "@src/plugins";

describe("OptionsSchemaPlugin.getUserScripts", () => {
  let parser: ReturnType<typeof OptionsSchemaPlugin.for>;

  beforeEach(() => {
    parser = OptionsSchemaPlugin.for("default" as any);
  });

  it("defaults to osmorphing_post_os_mount when no phase is provided", () => {
    const uploaded: InstanceScript[] = [
      { global: "linux", scriptContent: "echo hi", fileName: "s.sh" },
    ];
    const payload = parser.getUserScripts(uploaded, [], null);
    expect(payload.global.linux).toEqual([
      { phase: "osmorphing_post_os_mount", payload: "echo hi" },
    ]);
  });

  it.each([
    "osmorphing_pre_os_mount",
    "osmorphing_post_os_mount",
    "replica_first_boot",
  ] as const)("serializes the explicit %s phase", phase => {
    const uploaded: InstanceScript[] = [
      {
        global: "windows",
        scriptContent: "Write-Host hi",
        fileName: "s.ps1",
        phase,
      },
    ];
    const payload = parser.getUserScripts(uploaded, [], null);
    expect(payload.global.windows).toEqual([
      { phase, payload: "Write-Host hi" },
    ]);
  });

  it("serializes global linux and windows scripts with their phases", () => {
    const uploaded: InstanceScript[] = [
      {
        global: "linux",
        scriptContent: "echo linux",
        fileName: "l.sh",
        phase: "osmorphing_pre_os_mount",
      },
      {
        global: "windows",
        scriptContent: "Write-Host win",
        fileName: "w.ps1",
        phase: "replica_first_boot",
      },
    ];
    const payload = parser.getUserScripts(uploaded, [], null);
    expect(payload.global).toEqual({
      linux: [{ phase: "osmorphing_pre_os_mount", payload: "echo linux" }],
      windows: [{ phase: "replica_first_boot", payload: "Write-Host win" }],
    });
  });

  it("serializes an instance script with its phase", () => {
    const uploaded: InstanceScript[] = [
      {
        instanceId: "instance-1",
        scriptContent: "echo instance",
        fileName: "i.sh",
        phase: "replica_first_boot",
      },
    ];
    const payload = parser.getUserScripts(uploaded, [], null);
    expect(payload.instances["instance-1"]).toEqual([
      { phase: "replica_first_boot", payload: "echo instance" },
    ]);
  });

  it("emits null for removed scripts to unregister them", () => {
    const removed: InstanceScript[] = [
      { global: "linux", scriptContent: null, fileName: null },
    ];
    const payload = parser.getUserScripts([], removed, null);
    expect(payload.global.linux).toBeNull();
  });

  it("preserves pre-existing (e.g. legacy string) scripts in userScriptData", () => {
    const existing = {
      global: { windows: "legacy string script" },
    };
    const uploaded: InstanceScript[] = [
      {
        global: "linux",
        scriptContent: "echo new",
        fileName: "n.sh",
        phase: "osmorphing_post_os_mount",
      },
    ];
    const payload = parser.getUserScripts(uploaded, [], existing as any);
    expect(payload.global.windows).toBe("legacy string script");
    expect(payload.global.linux).toEqual([
      { phase: "osmorphing_post_os_mount", payload: "echo new" },
    ]);
  });

  it("groups multiple scripts for one target into a single phase list", () => {
    const uploaded: InstanceScript[] = [
      {
        global: "linux",
        scriptContent: "echo pre",
        fileName: null,
        phase: "osmorphing_pre_os_mount",
      },
      {
        global: "linux",
        scriptContent: "echo post",
        fileName: null,
        phase: "osmorphing_post_os_mount",
      },
      {
        global: "linux",
        scriptContent: "echo boot",
        fileName: null,
        phase: "replica_first_boot",
      },
    ];
    const payload = parser.getUserScripts(uploaded, [], null);
    expect(payload.global.linux).toEqual([
      { phase: "osmorphing_pre_os_mount", payload: "echo pre" },
      { phase: "osmorphing_post_os_mount", payload: "echo post" },
      { phase: "replica_first_boot", payload: "echo boot" },
    ]);
  });

  it("groups multiple scripts for one instance with different phases", () => {
    const uploaded: InstanceScript[] = [
      {
        instanceId: "instance-1",
        scriptContent: "echo pre",
        fileName: null,
        phase: "osmorphing_pre_os_mount",
      },
      {
        instanceId: "instance-1",
        scriptContent: "echo boot",
        fileName: null,
        phase: "replica_first_boot",
      },
    ];
    const payload = parser.getUserScripts(uploaded, [], null);
    expect(payload.instances["instance-1"]).toEqual([
      { phase: "osmorphing_pre_os_mount", payload: "echo pre" },
      { phase: "replica_first_boot", payload: "echo boot" },
    ]);
  });

  it("never emits empty-string payloads and nulls an empty target", () => {
    const uploaded: InstanceScript[] = [
      {
        global: "linux",
        scriptContent: "",
        fileName: null,
        phase: "osmorphing_pre_os_mount",
      },
      {
        global: "linux",
        scriptContent: "   ",
        fileName: null,
        phase: "osmorphing_post_os_mount",
      },
      {
        global: "windows",
        scriptContent: "Write-Host hi",
        fileName: null,
        phase: "osmorphing_post_os_mount",
      },
    ];
    const payload = parser.getUserScripts(uploaded, [], null);
    expect(payload.global.linux).toBeNull();
    expect(payload.global.windows).toEqual([
      { phase: "osmorphing_post_os_mount", payload: "Write-Host hi" },
    ]);
  });
});
