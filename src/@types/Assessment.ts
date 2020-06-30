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

import type { Endpoint } from './Endpoint'
import type { Instance } from './Instance'
import type { NetworkMap } from './Network'

export type VmSize = {
  name: string,
  size?: string,
}

export type AzureLocation = {
  id: string,
  name: string,
}

export type Group = {
  id: string,
  name: string,
}

export type VmItem = {
  id: string,
  properties: {
    recommendedSize: string,
    disks: {
      [diskName: string]: {
        recommendedDiskType: string,
      },
    },
    datacenterManagementServerName: string,
    datacenterMachineArmId: string,
    displayName: string,
    operatingSystemName: string,
  },
}

export type Assessment = {
  name: string,
  id: string,
  projectName: string,
  resourceGroupName: string,
  groupName: string,
  assessmentName: string,
  location: string,
  project: {
    name: string,
  },
  group: Group,
  properties: {
    status: string,
    updatedTimestamp: string,
    azureLocation: string,
    numberOfMachines: string,
  },
  connectionInfo: { subscription_id: string } & Endpoint['connection_info'],
}

export type MigrationInfo = {
  source: Endpoint | null,
  target: Endpoint,
  selectedInstances: Instance[],
  fieldValues: { [fieldValue: string]: any },
  networks: NetworkMap[],
  vmSizes: { [vmSize: string]: VmSize },
}
