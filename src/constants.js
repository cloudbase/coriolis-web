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

let licenceUrl = (window.env && window.env.CORIOLIS_LICENSING_BASE_URL) || '/licensing'

export const servicesUrl = {
  identity: `${coriolisUrl}identity/auth/tokens`,
  projects: `${coriolisUrl}identity/auth/projects`,
  users: `${coriolisUrl}identity/users`,
  endpoints: `${coriolisUrl}coriolis/endpoints`,
  coriolis: `${coriolisUrl}coriolis`,
  migrations: `${coriolisUrl}coriolis/migrations`,
  barbican: `${coriolisUrl}barbican`,
  openId: `${coriolisUrl}identity/OS-FEDERATION/identity_providers/google/protocols/openid/auth`,
  licence: licenceUrl,
}

export const navigationMenu = [
  { label: 'Replicas', value: 'replicas' },
  { label: 'Migrations', value: 'migrations' },
  { label: 'Cloud Endpoints', value: 'endpoints' },

  // Optional pages
  { label: 'Planning', value: 'planning' },

  // User management pages
  { label: 'Projects', value: 'projects', requiresAdmin: true },
  { label: 'Users', value: 'users', requiresAdmin: true },
]

// https://github.com/cloudbase/coriolis/blob/master/coriolis/constants.py
export const providerTypes = {
  TARGET_MIGRATION: 1,
  SOURCE_MIGRATION: 2,
  TARGET_REPLICA: 4,
  SOURCE_REPLICA: 8,
  CONNECTION: 16,
  DESTINATION_OPTIONS: 512,
  SOURCE_OPTIONS: 131072,
  STORAGE: 32768,
  SOURCE_UPDATE: 65536,
  TARGET_UPDATE: 262144,
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
    type: 'boolean',
    defaultValue: false,
  },
]

export const wizardPages = [
  { id: 'type', title: 'New', breadcrumb: 'Type' },
  { id: 'source', title: 'Select your source cloud', breadcrumb: 'Source Cloud' },
  {
    id: 'source-options',
    title: 'Source options',
    breadcrumb: 'Source Options',
  },
  { id: 'vms', title: 'Select instances', breadcrumb: 'Select VMs' },
  { id: 'target', title: 'Select your target cloud', breadcrumb: 'Target Cloud' },
  { id: 'dest-options', title: 'Target options', breadcrumb: 'Target Options' },
  { id: 'networks', title: 'Networks', breadcrumb: 'Networks' },
  {
    id: 'storage',
    title: 'Storage Mapping',
    breadcrumb: 'Storage',
  },
  { id: 'schedule', title: 'Schedule', breadcrumb: 'Schedule', excludeFrom: 'migration' },
  { id: 'summary', title: 'Summary', breadcrumb: 'Summary' },
]

export const basename = process.env.PUBLIC_PATH
