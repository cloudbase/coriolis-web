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

import type { Execution } from './Execution'
import type { Task } from './Task'

export type MainItemInfo = {
  export_info: {
    devices: {
      nics: {
        network_name: string,
      }[],
    },
  },
}

export type DestinationEnvInfo = {
  network_map: {
    [string]: {
      source_network: string,
      destination_network: string,
    } | 'string'
  },
  description: string,
  [string]: mixed,
}

export type MainItem = {
  id: string,
  executions: Execution[],
  name: string,
  status: string,
  tasks: Task[],
  created_at: Date,
  updated_at: Date,
  origin_endpoint_id: string,
  destination_endpoint_id: string,
  instances: string[],
  type: string,
  info: { [string]: MainItemInfo },
  destination_environment: DestinationEnvInfo,
}
