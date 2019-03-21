/*
Copyright (C) 2018  Cloudbase Solutions SRL
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

export default {
  nodeServer: 'http://localhost:3000/',
  coriolisUrl: '',
  username: 'cypress',
  password: 'cypress',
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
      userDomainName: '',
      authUrl: '',
      projectName: '',
      projectDomainName: '',
      password: '',
      username: '',
      glanceApiVersion: 2,
      identityVersion: 3,
      allowUntrusted: true,
      allowUntrustedSwift: true,
    },
    oci: {
      privateKeyData: '',
      region: '',
      tenancy: '',
      user: '',
      privateKeyPassphrase: '',
    },
  },
  wizard: {
    azure: {
      resourceGroup: { label: 'Coriolis', value: 'coriolis' },
    },
    oci: {
      compartment: '',
      migrSubnetId: '',
      availabilityDomain: '',
    },
    instancesSearch: {
      vmwareSearchText: '',
      vmwareItemIndex: 0,
      openstackSearchText: '',
      openstackItemIndex: 0,
    },
  },
}
