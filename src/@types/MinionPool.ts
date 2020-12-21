/*
Copyright (C) 2020  Cloudbase Solutions SRL
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

export type MinionMachine = {
  id: string
  created_at: string
  updated_at: string
  allocation_status: string
  connection_info?: any
  power_status: string
  provider_properties: any
  last_used_at?: string
  allocated_action: string | null
}
export type MinionPoolEvent = {
  id: string
  index: number
  level: 'INFO' | 'DEBUG' | 'ERROR'
  message: string
  created_at: string
}
export type MinionPoolProgressUpdate = {
  id: string
  current_step: number
  message: string
  created_at: string
}
export type MinionPoolEventProgressUpdate = MinionPoolEvent | MinionPoolProgressUpdate
export type MinionPool = {
  id: string
  created_at: string
  updated_at: string | null
  name: string
  os_type: 'linux' | 'windows'
  status: string
  minimum_minions: number
  maximum_minions: number
  environment_options: { [prop: string]: any }
  endpoint_id: string
  notes?: string
  platform: 'source' | 'destination',
  minion_machines: MinionMachine[],
  minion_retention_strategy: 'poweroff' | 'delete'
  minion_max_idle_time: number,
}

export type MinionPoolDetails = MinionPool & {
  events: MinionPoolEvent[],
  progress_updates: MinionPoolProgressUpdate[]
}
