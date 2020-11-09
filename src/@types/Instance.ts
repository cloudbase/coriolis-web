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

export type Nic = {
  id: string,
  network_name: string,
  ip_addresses?: string[],
  mac_address: string,
  network_id: string,
}

export type Disk = {
  id: string,
  name?: string,
  storage_backend_identifier?: string,
  format?: string,
  guest_device?: string,
  size_bytes?: number,
  disabled?: {
    message: string,
    info?: string,
  },
}

export type Instance = {
  id: string,
  name: string,
  flavor_name: string,
  instance_name?: string | null,
  num_cpu: number,
  memory_mb: number,
  os_type: string,
  devices: {
    nics: Nic[],
    disks: Disk[],
  },
}

export type InstanceBase = {
  id: string
} & Partial<Instance>

export type InstanceScript = {
  global?: string | null,
  instanceId?: string | null,
  scriptContent: string,
  fileName: string,
}

export const shortenId = (id: string) => id.replace(/(^.*?)-.*-(.*$)/, '$1-...-$2')
