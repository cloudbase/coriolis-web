// @flow

import type { Config } from './src/types/Config'

const conf: Config = {

  // The list of pages which will not appear in the navigation menu
  // Remove or comment to enable them
  disabledPages: [
    'planning',
    'users',
    'projects',
  ],

  // Whether to show the user domain name input when logging in
  showUserDomainInput: false,

  // The default user domain name used for logging in
  defaultUserDomain: 'default',

  // Shows the 'Use Current User/Project/Domain for Authentification' switch
  // when creating a new openstack endpoint
  showOpenstackCurrentUserSwitch: false,

  // Whether to use Barbican secrets when creating a new endpoint
  useBarbicanSecrets: true,

  // The timeout between polling requests
  requestPollTimeout: 5000,

  // The list of providers which offer source options
  sourceOptionsProviders: ['aws'],

  // - Specifies the `limit` for each provider when listing all its VMs for pagination.
  // - If the provider is not in this list, the 'default' value will be used.
  // - If the `default` value is lower than the number of instances that fit into a page, the latter number will be used.
  // - `Infinity` value means no `limit` will be used, i.e. all VMs will be listed.
  instancesListBackgroundLoading: { default: 10, ovm: Infinity },

  // A list of providers for which `source-options` API call(s) will be made
  // If the item is just a string with the provider name, only one API call will be made
  // If the item has `envRequiredFields`, an additional API call will be made once the specified fields are filled
  sourceProvidersWithExtraOptions: [
    'aws',
  ],

  // A list of providers for which `destination-options` API call(s) will be made
  // If the item is just a string with the provider name, only one API call will be made
  // If the item has `envRequiredFields`, an additional API call will be made once the specified fields are filled
  destinationProvidersWithExtraOptions: [
    'openstack',
    'oracle_vm',
    'aws',
    {
      name: 'azure',
      envRequiredFields: ['location', 'resource_group'],
    },
    {
      name: 'oci',
      envRequiredFields: ['compartment', 'availability_domain'],
    },
  ],

  // The list of the users to hide in the UI
  hiddenUsers: ['barbican', 'coriolis'],
}

export const config = conf
