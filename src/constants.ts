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

import { Field } from "@src/@types/Field";
import { WizardPage } from "./@types/WizardData";

export type NavigationMenuType = {
  label: string;
  value: string;
  hidden?: boolean;
  requiresAdmin?: boolean;
};
export const navigationMenu: NavigationMenuType[] = [
  { label: "Dashboard", value: "dashboard" },
  { label: "Transfers", value: "transfers" },
  // { label: "Migrations", value: "migrations" },
  { label: "Deployments", value: "deployments" },
  { label: "Cloud Endpoints", value: "endpoints" },
  { label: "Minion Pools", value: "minion-pools" },
  { label: "Bare Metal Servers", value: "bare-metal-servers" },

  // Optional pages
  { label: "Planning", value: "planning" },

  // User management pages
  { label: "Projects", value: "projects", requiresAdmin: true },
  { label: "Users", value: "users", requiresAdmin: true },
  { label: "Logs", value: "logging", requiresAdmin: true },
];

// https://github.com/cloudbase/coriolis/blob/master/coriolis/constants.py
export const providerTypes = {
  TARGET_REPLICA: 4,
  SOURCE_REPLICA: 8,
  CONNECTION: 16,
  DESTINATION_OPTIONS: 512,
  SOURCE_OPTIONS: 131072,
  STORAGE: 32768,
  SOURCE_UPDATE: 65536,
  TARGET_UPDATE: 262144,
  SOURCE_MINION_POOL: 524288,
  DESTINATION_MINION_POOL: 1048576,
};

export const loginButtons = [
  // {
  //   name: 'Google',
  //   id: 'google',
  //   url: '',
  // },
];

export const executionOptions = [
  {
    name: "shutdown_instances",
    type: "boolean",
    defaultValue: false,
    nullableBoolean: false,
  },
];

export const migrationFields: Field[] = [
  {
    name: "shutdown_instances",
    type: "boolean",
    default: false,
    nullableBoolean: false,
    description:
      "Whether or not Coriolis should power off the source VM before performing the final incremental sync. This guarantees consistency of the exported VM's filesystems, but implies downtime for the source VM during the final sync.",
  },
  {
    name: "replication_count",
    type: "integer",
    minimum: 1,
    maximum: 10,
    default: 2,
    description:
      'The number of times to incrementally sync the disks of the source VM. This can be paired with "Shutdown Instances" to allow for the live syncing of the source VM, and shutting it off before the final incremental sync.',
  },
];

export const wizardPages: WizardPage[] = [
  { id: "type", title: "New", breadcrumb: "Type" },
  {
    id: "source",
    title: "Select your source cloud",
    breadcrumb: "Source Cloud",
  },
  {
    id: "source-options",
    title: "Source options",
    breadcrumb: "Source Options",
  },
  { id: "vms", title: "Select instances", breadcrumb: "Select VMs" },
  {
    id: "target",
    title: "Select your target cloud",
    breadcrumb: "Target Cloud",
  },
  { id: "dest-options", title: "Target options", breadcrumb: "Target Options" },
  { id: "networks", title: "Networks", breadcrumb: "Networks" },
  { id: "storage", title: "Storage Mapping", breadcrumb: "Storage" },
  {
    id: "scripts",
    title: "User Scripts",
    breadcrumb: "Scripts",
  },
  {
    id: "schedule",
    title: "Schedule",
    breadcrumb: "Schedule",
    // excludeFrom: "migration",
  },
  { id: "summary", title: "Summary", breadcrumb: "Summary" },
];

export const basename = process.env.PUBLIC_PATH;

export const LEGAL_URLS = {
  eula: "https://cloudbase.it/coriolis-eula/",
  privacy: " https://cloudbase.it/privacy/",
};
