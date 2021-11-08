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

import type { Nic } from './Instance'

export type SecurityGroup = string | {
  id: string,
  name: string,
}

export type Network = {
  name: string,
  id: string,
  // The `security_groups` field is currently used only by OCI
  security_groups?: SecurityGroup[],
  // The `port_keys` field is currenlty used only by VMWare
  port_keys?: string[],
}

export type NetworkMap = {
  sourceNic: Nic,
  targetNetwork: Network | null,
  targetSecurityGroups?: SecurityGroup[] | null,
  targetPortKey?: string | null
}

export const NetworkUtils = {
  getPortKeyNetworkId: (networks: Network[], id: string): { portKey: string | null, id: string } => {
    const idMatches = /(.*):(.*)/.exec(String(id))
    if (!idMatches) {
      return { portKey: null, id }
    }
    const actualId = idMatches[1]
    const portKey = idMatches[2]

    for (let i = 0; i < networks.length; i += 1) {
      if (networks[i].id === actualId) {
        if (networks[i].port_keys?.find(p => p === portKey)) {
          return { id: actualId, portKey }
        }
        return { id: actualId, portKey: null }
      }
    }

    return { id, portKey: null }
  },
}
