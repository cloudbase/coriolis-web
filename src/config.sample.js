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

/* eslint-disable */
/* jscs:disable maximumLineLength */

export const port = process.env.PORT || 3000;
export const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;
export const coriolisUrl = CORIOLIS_URL || "/"
export const defaultDomain = "default";

// Number of instances in wizard Migrate VMs step
export const itemsPerPage = 6;
export const securityGroups = ["testgroup"]

export const servicesUrl = {
  identity: coriolisUrl + "identity/auth/tokens",
  projects: coriolisUrl + "identity/auth/projects",
  users: coriolisUrl + "identity/users",
  endpoints: coriolisUrl + "coriolis/endpoints",
  coriolis: coriolisUrl + "coriolis",
  migrations: coriolisUrl + "coriolis/migrations",
  barbican: coriolisUrl + "barbican",
  openId: coriolisUrl + "identity/OS-FEDERATION/identity_providers/google/protocols/openid/auth"
}

export const providerType = {
  import_migration: 1,
  export_migration: 2,
  import_replica: 4,
  export_replica: 8,
  endpoint: 16
}

export const useSecret = true; // flag to use secret_ref for endpoints

export const tasksPollTimeout = 5000 // milliseconds

export const migrationSteps = [
  {
    name: "Migration Type",
    title: "Migration Options",
    component: "WizardMigrationType"
  },
  {
    name: "Source Cloud",
    title: "Select your source cloud",
    component: "WizardSource"
  },
  {
    name: "Target Cloud",
    title: "Select your target cloud",
    component: "WizardTarget"
  },
  {
    name: "Migrate instances",
    title: "Select instances",
    component: "WizardVms"
  },
  {
    name: "Options",
    title: "Options",
    component: "WizardOptions"
  },
  {
    name: "Network Mapping",
    title: "Network Mapping",
    component: "WizardNetworks"
  },
  {
    name: "Schedule",
    title: "Schedule",
    component: "WizardSchedule"
  },
  {
    name: "Summary",
    title: "Summary",
    component: "WizardSummary"
  }
]