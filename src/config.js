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

// @flow

export const coriolisUrl = (window.env && window.env.CORIOLIS_URL) || '/'

export const servicesUrl = {
  identity: `${coriolisUrl}identity/auth/tokens`,
  projects: `${coriolisUrl}identity/auth/projects`,
  users: `${coriolisUrl}identity/users`,
  endpoints: `${coriolisUrl}coriolis/endpoints`,
  coriolis: `${coriolisUrl}coriolis`,
  migrations: `${coriolisUrl}coriolis/migrations`,
  barbican: `${coriolisUrl}barbican`,
  openId: `${coriolisUrl}identity/OS-FEDERATION/identity_providers/google/protocols/openid/auth`,
}

export const useSecret = true // use secret_ref when creating and endpoint

export const navigationMenu = [
  { label: 'Replicas', value: 'replicas' },
  { label: 'Migrations', value: 'migrations' },
  { label: 'Cloud Endpoints', value: 'endpoints' },
  { label: 'Planning', value: 'planning', disabled: true },
]

export const requestPollTimeout = 5000

export const providerTypes = {
  TARGET_MIGRATION: 1,
  SOURCE_MIGRATION: 2,
  TARGET_REPLICA: 4,
  SOURCE_REPLICA: 8,
  CONNECTION: 16,
}

export const loginButtons = [
  // {
  //   name: 'Google',
  //   id: 'google',
  //   url: '',
  // },
]

export const env = {
  name: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  isBrowser: typeof window !== 'undefined',
}

export const executionOptions = [
  {
    name: 'shutdown_instances',
    type: 'strict-boolean',
  },
]

export const wizardConfig = {
  pages: [
    { id: 'type', title: 'New', breadcrumb: 'Type' },
    { id: 'source', title: 'Select your source cloud', breadcrumb: 'Source Cloud' },
    { id: 'target', title: 'Select your target cloud', breadcrumb: 'Target Cloud' },
    { id: 'vms', title: 'Select instances', breadcrumb: 'Select VMs' },
    { id: 'options', title: 'Options', breadcrumb: 'Options' },
    { id: 'networks', title: 'Networks', breadcrumb: 'Networks' },
    { id: 'schedule', title: 'Schedule', breadcrumb: 'Schedule', excludeFrom: 'migration' },
    { id: 'summary', title: 'Summary', breadcrumb: 'Summary' },
  ],
  instancesItemsPerPage: 6,
}

// A list of providers for which `destination-options` API call(s) will be made in the Wizard
// If the item is just a string with the provider name, only one API call will be made
// If the item has `envRequiredFields`, an additional API call will be made once the specified fields are filled
export const providersWithExtraOptions = [
  'openstack',
  {
    name: 'azure',
    envRequiredFields: ['location', 'resource_group'],
  },
  {
    name: 'oci',
    envRequiredFields: ['compartment', 'availability_domain'],
  },
]

export const basename = process.env.PUBLIC_PATH
