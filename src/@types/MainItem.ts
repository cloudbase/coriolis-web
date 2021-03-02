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
import type { Instance, InstanceScript } from './Instance'
import type { NetworkMap } from './Network'
import type { StorageMap } from './Endpoint'
import { Task } from './Task'

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
  uploadedScripts: InstanceScript[],
  removedScripts: InstanceScript[],
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

type BaseItem = {
  id: string,
  name: string,
  description?: string
  notes: string,
  created_at: string,
  updated_at: string,
  origin_endpoint_id: string,
  destination_endpoint_id: string,
  origin_minion_pool_id: string | null,
  destination_minion_pool_id: string | null,
  instances: string[],
  info: { [prop: string]: MainItemInfo },
  destination_environment: { [prop: string]: any },
  source_environment: { [prop: string]: any },
  transfer_result: { [prop: string]: Instance } | null,
  replication_count?: number,
  storage_mappings?: StorageMapping | null,
  network_map?: TransferNetworkMap,
  last_execution_status: string
  user_id: string
  instance_osmorphing_minion_pool_mappings?: { [instanceName: string]: string }
  user_scripts?: UserScriptData
}

export type ReplicaItem = BaseItem & {
  type: 'replica',
}

export type UserScriptData = {
  global?: {
    linux?: string | null
    windows?: string | null
  }
  instances?: {
    [instanceName: string]: string | null
  }
}

export type MigrationItem = BaseItem & {
  type: 'migration',
  replica_id?: string,
}

export type MigrationItemOptions = MigrationItem & {
  skip_os_morphing: boolean,
  shutdown_instances: boolean,
}

export type TransferItem = ReplicaItem | MigrationItem

export type ReplicaItemDetails = ReplicaItem & {
  executions: Execution[],
}

export type MigrationItemDetails = MigrationItem & {
  tasks: Task[]
}

export type TransferItemDetails = ReplicaItemDetails | MigrationItemDetails

export const getTransferItemTitle = (item: TransferItem | null) => {
  if (!item) {
    return null
  }
  const { instances, notes } = item
  let title = notes
  if (!notes) {
    title = instances[0]
    if (instances.length > 1) {
      title += ` (+${instances.length - 1} more)`
    }
  }
  return title
}
