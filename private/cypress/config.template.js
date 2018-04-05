// @flow

export default {
  nodeServer: 'http://localhost:3000/',
  coriolisUrl: '',
  username: 'admin',
  password: '',
  endpoints: {
    azure: {
      username: '',
      password: '',
      subscriptionId: '',
    },
    vmware: {
      username: '',
      password: '',
      host: '',
    },
    openstack: {
      userDomainName: 'Default',
      authUrl: '',
      projectName: 'admin',
      projectDomainName: '',
      password: '',
      username: 'admin',
      glanceApiVersion: 2,
      identityVersion: 3,
    },
  },
  wizard: {
    azure: {
      location: { label: 'West US', value: 'westus' },
      resourceGroup: { label: 'Coriolis', value: 'coriolis' },
    },
    openstack: {
      network: 'private',
    },
    instancesSearch: 'ubuntu',
    instancesSelectItem: 2,
  },
}
