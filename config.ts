import type { Config } from './src/@types/Config'

const conf: Config = {

  // The list of pages which will not appear in the navigation menu
  // Remove or comment to enable them
  disabledPages: [
    'planning',
    // Enabling users and projects page by default
    // 'users',
    // 'projects',
  ],

  // Whether to show the user domain name input when logging in
  showUserDomainInput: false,

  // The default user domain name used for logging in
  defaultUserDomain: 'default',

  // The name of the admin role, used for checking
  // if a user is allowed to do certain admin operations
  adminRoleName: 'admin',

  // Shows the 'Use Current User/Project/Domain for Authentification' switch
  // when creating a new openstack endpoint
  showOpenstackCurrentUserSwitch: false,

  // Whether to use Barbican secrets when creating a new endpoint
  useBarbicanSecrets: true,

  // The timeout between polling requests
  requestPollTimeout: 5000,

  // - Specifies the `limit` for each provider when listing all its VMs for pagination.
  // - If the provider is not in this list, the 'default' value will be used.
  // - If the `default` value is lower than the number of instances that
  // fit into a page, the latter number will be used.
  // - `Infinity` value means no `limit` will be used, i.e. all VMs will be listed.
  instancesListBackgroundLoading: { default: 10, ovm: Infinity, 'hyper-v': Infinity },

  /**
   * The list of providers for which and extra source or destination options API call will be made,
   * if the required fields have any value set.
   * If `requiredValues` is provided, the field specified there needs to have a
   * certain value (specified in values)
   * in order to make the options API call.
   * If `relistFields` is provided, the options call will be made if any of the relist fields are changed.
   */
  extraOptionsApiCalls: [
    {
      name: 'openstack',
      types: ['source'],
      requiredFields: ['replica_export_mechanism'],
      requiredValues: [
        {
          field: 'replica_export_mechanism',
          values: ['swift_backups', 'ceph_backups', 'coriolis_backups'],
        },
      ],
    },
    {
      name: 'openstack',
      types: ['destination'],
      requiredFields: ['list_all_destination_networks'],
    },
    {
      name: 'aws',
      types: ['source', 'destination'],
      requiredFields: ['region'],
    },
    {
      name: 'azure',
      types: ['source', 'destination'],
      requiredFields: ['location', 'resource_group'],
    },
    {
      name: 'oci',
      types: ['destination'],
      requiredFields: ['compartment', 'availability_domain', 'vcn_compartment'],
    },
    {
      name: 'vmware_vsphere',
      types: ['destination'],
      requiredFields: ['import_datacenter'],
      relistFields: ['import_cluster', 'migr_minion_cluster'],
    },
  ],

  /*
  Lower number means that the provider will appear sooner in the list.
  Equal number means alphabetical order within the same group number.
  If the provider is not in the list, it will appear later and alphabetically sorted
  with all the other providers not in the list.
  */
  providerSortPriority: {
    aws: 1,
    openstack: 1,
    vmware_vsphere: 1,
    azure: 2,
    'hyper-v': 2,
    kubevirt: 2,
    scvmm: 2,
    oci: 3,
    opc: 3,
    oracle_vm: 3,
  },

  // The list of the users to hide in the UI
  hiddenUsers: ['barbican', 'coriolis'],

  // By default, if a field name contains `password` in it (ex.: `user_password`),
  // it will be rendered as a password input
  // If the field doesn't contain `password` in its name, the following list will be used instead
  passwordFields: ['private_key_passphrase', 'secret_access_key'],

  // The number of items per page applicable to main lists:
  // replicas, migrations, endpoints, users etc.
  mainListItemsPerPage: 20,

  maxMinionPoolEventsPerPage: 50,

  servicesUrls: {
    keystone: '{BASE_URL}/identity',
    barbican: '{BASE_URL}/barbican',
    coriolis: '{BASE_URL}/coriolis',
    coriolisLogs: '{BASE_URL}/logs',
    coriolisLogStreamBaseUrl: '{BASE_URL}',
    coriolisLicensing: '{BASE_URL}/licensing',
  },
}

export const config = conf
