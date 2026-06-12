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

export type Nic = {
  id: string;
  network_name: string;
  ip_addresses?: string[];
  mac_address: string;
  network_id: string;
};

export type Disk = {
  id: string;
  name?: string;
  storage_backend_identifier?: string;
  format?: string;
  guest_device?: string;
  size_bytes?: number;
  disabled?: {
    message: string;
    info?: string;
  };
};

export type Instance = {
  id: string;
  name: string;
  flavor_name: string;
  instance_name?: string | null;
  num_cpu: number;
  memory_mb: number;
  os_type: string;
  devices: {
    nics: Nic[];
    disks: Disk[];
  };
};

export type InstanceBase = {
  id: string;
} & Partial<Instance>;

export type UserScriptPhase =
  | "osmorphing_pre_os_mount"
  | "osmorphing_post_os_mount"
  | "replica_first_boot";

export const USER_SCRIPT_PHASES: UserScriptPhase[] = [
  "osmorphing_pre_os_mount",
  "osmorphing_post_os_mount",
  "replica_first_boot",
];

export const DEFAULT_USER_SCRIPT_PHASE: UserScriptPhase =
  "osmorphing_post_os_mount";

export const USER_SCRIPT_PHASE_OPTIONS: {
  label: string;
  value: UserScriptPhase;
}[] = [
  { label: "OS morphing: before mount", value: "osmorphing_pre_os_mount" },
  { label: "OS morphing: after mount", value: "osmorphing_post_os_mount" },
  { label: "VM first boot script", value: "replica_first_boot" },
];

export const USER_SCRIPT_PHASE_DESCRIPTIONS: Record<UserScriptPhase, string> = {
  osmorphing_pre_os_mount:
    "Runs before the OS partition is mounted during OS morphing, e.g. to unlock encrypted disks.",
  osmorphing_post_os_mount:
    "Runs after the OS partition is mounted during OS morphing (the default).",
  replica_first_boot:
    "Injected during OS morphing and executed when the VM boots for the first time.",
};

export type InstanceScript = {
  global?: "windows" | "linux" | null;
  instanceId?: string | null;
  scriptContent: string | null;
  fileName: string | null;
  phase?: UserScriptPhase;
};

export type UserScriptTarget = {
  global: "windows" | "linux" | null;
  instanceId: string | null;
};

export const InstanceUtils = {
  shortenId: (id: string) => id.replace(/(^.*?)-.*-(.*$)/, "$1-...-$2"),
};
