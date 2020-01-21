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

// @flow

import type { Instance } from '../../../types/Instance'

export default class InstanceInfoPlugin {
  static parseInstance(instance: Instance): Instance {
    let rootDisk = instance.devices.disks[0]
    if (rootDisk) {
      rootDisk.disabled = {
        message: 'Storage types cannot be selected for root disks on OCI',
        info: 'The storage type of the root disk on OCI depends on the launch mode of the new VM. Coriolis determines a launch mode depending on the source VM\'s firmware and the target environment configuration.',
      }
    }
    return instance
  }
}
