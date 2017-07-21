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

/* eslint-disable max-len */
/* jscs:disable maximumLineLength */

export const port = process.env.PORT || 3000;
export const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;
export const coriolisUrl = CORIOLIS_URL || "/"
export const defaultDomain = "default";

// Number of instances in wizard Migrate VMs step
export const itemsPerPage = 6;
/*
-- Network mocked data
 id - random
 name - source network
 migrateNetwork - target network, null if new network
 selected - true
*/
export const networkMock = [
  {id: "net1", name: "VM Network", migrateNetwork: "management", selected: true},
]
// Target networks to show in dropdown
export const targetNetworkMock = ["internal-coriolis-2", "coriolis-twenty", "management"]
export const securityGroups = ["testgroup"]

export const servicesUrl = {
  identity: coriolisUrl + "identity/auth/tokens",
  projects: coriolisUrl + "identity/auth/projects",
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
    name: "Network Mapping",
    title: "Network Mapping",
    component: "WizardNetworks"
  },
  {
    name: "Options",
    title: "Options",
    component: "WizardOptions"
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

export const auth = {

  jwt: { secret: process.env.JWT_SECRET || 'Coriolis' },

  // https://developers.facebook.com/
  facebook: {
    id: process.env.FACEBOOK_APP_ID || '186244551745631',
    secret: process.env.FACEBOOK_APP_SECRET || 'a970ae3240ab4b9b8aae0f9f0661c6fc',
  },

  // https://cloud.google.com/console/project
  google: {
    id: process.env.GOOGLE_CLIENT_ID || '251410730550-ahcg0ou5mgfhl8hlui1urru7jn5s12km.apps.googleusercontent.com',
    secret: process.env.GOOGLE_CLIENT_SECRET || 'Y8yR9yZAhm9jQ8FKAL8QIEcd',
  },

  // https://apps.twitter.com/
  twitter: {
    key: process.env.TWITTER_CONSUMER_KEY || 'Ie20AZvLJI2lQD5Dsgxgjauns',
    secret: process.env.TWITTER_CONSUMER_SECRET || 'KTZ6cxoKnEakQCeSpZlaUCJWGAlTEBJj0y2EMkUBujA7zWSvaQ',
  },
};

export const defaultLabels = {
  username: "Username",
  password: "Password",
  host: "Host",
  port: "Port",
  allow_untrusted: "Allow untrusted",
  identity_api_version: "Identity Version",
  auth_url: "Auth URL",
  user_domain_name: "User Domain Name",
  project_name: "Project Name",
  project_domain_name: "Project Domain Name",
  flavor_name: "Flavor Name",
  hypervisor_type: "Hypervisor Type",
  container_format: "Container Format",
  disk_format: "Disk Format",
  glance_upload: "Glance Upload",
  keypair_name: "Keypair name",
  fip_pool_name: "Floating IP Pool",
  migr_fip_pool_name: "Migration Floating IP Pool",
  migr_flavor_name: "Migration Flavor Name",
  migr_image_name: "Migration Image Name",
  migr_image_name_map: "Migration Image Name Map",
  delete_disks_on_vm_termination: "Delete disks on VM termination",
  set_dhcp: "Set DHCP",
}
