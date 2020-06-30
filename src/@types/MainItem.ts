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

import type { Execution } from './Execution'
import type { Task } from './Task'
import type { Instance } from './Instance'
import type { NetworkMap } from './Network'
import type { StorageMap } from './Endpoint'

export type MainItemInfo = {
  export_info: {
    devices: {
      nics: {
        network_name: string,
      }[],
    },
  },
}

export type UpdateData = {
  destination: any,
  source: any,
  network: NetworkMap[],
  storage: StorageMap[],
}
type NetworkMapSecurityGroups = { id: string, security_groups?: string[] }
type NetworkMapSourceDest = {
  [prop: string]: {
    source_network: string,
    destination_network: string,
  }
}
export const isNetworkMapSecurityGroups = (n: any): n is NetworkMapSecurityGroups => (typeof n !== 'string' && n && n.security_groups)
export const isNetworkMapSourceDest = (n: any): n is NetworkMapSourceDest => (typeof n !== 'string' && (!n || !n.security_groups))
export type TransferNetworkMap = NetworkMapSourceDest | string | NetworkMapSecurityGroups
export type StorageMapping = {
  backend_mappings: {
    destination: string,
    source: string,
  }[],
  default: string | null,
  disk_mappings: {
    destination: string,
    disk_id: string,
  }[] | null,
}
export type MainItem = {
  id: string,
  executions: Execution[],
  name: string,
  notes: string,
  status: string,
  tasks: Task[],
  created_at: Date,
  updated_at: Date,
  replica_id?: string,
  origin_endpoint_id: string,
  destination_endpoint_id: string,
  instances: string[],
  type: 'replica' | 'migration',
  info: { [prop: string]: MainItemInfo },
  destination_environment: { [prop: string]: any },
  source_environment: { [prop: string]: any },
  transfer_result: { [prop: string]: Instance } | null,
  replication_count?: number,
  storage_mappings?: StorageMapping | null,
  network_map?: TransferNetworkMap
  [prop: string]: any
}
