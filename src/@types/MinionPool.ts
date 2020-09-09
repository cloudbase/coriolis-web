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

import { Execution } from './Execution'

export type MinionPool = {
  id: string
  created_at: string
  updated_at: string | null
  pool_name: string
  pool_os_type: string
  pool_status: string
  minimum_minions: number
  environment_options: { [prop: string]: any }
  endpoint_id: string
  last_execution_status: string
  notes?: string
  pool_platform: 'source' | 'destination'
}

export type MinionPoolDetails = MinionPool & {
  executions: Execution[]
}
