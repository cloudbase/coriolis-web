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

import type { Disk } from "./Instance";
import type { ProviderTypes } from "./Providers";

export type Validation = {
  valid: boolean;
  message: string;
};

export type Endpoint = {
  id: string;
  name: string;
  description: string;
  type: ProviderTypes;
  created_at: string;
  mapped_regions: string[];
  connection_info: {
    secret_ref?: string;
    host?: string;
    [prop: string]: any;
  };
  [prop: string]: any;
};

export type MultiValidationItem = {
  endpoint: Endpoint;
  validation?: Validation;
  validating: boolean;
};

export type OptionValues = {
  name: string;
  values: string[] | { name: string; id: string; [prop: string]: any }[];
  config_default: string | { name: string; id: string };
};

export type StorageBackend = {
  id: string | null;
  name: string;
  additional_provider_properties?: {
    supported_bus_types?: string[];
  };
};

export type Storage = {
  storage_backends: StorageBackend[];
  config_default?: string;
};

export type StorageMap = {
  type: "backend" | "disk";
  source: Disk;
  target: StorageBackend;
  targetBusType?: string | null;
};

export const EndpointUtils = {
  getBusTypeStorageId: (
    storageBackends: StorageBackend[],
    id: string | null
  ): { busType: string | null; id: string | null } => {
    const idMatches = /(.*):(.*)/.exec(String(id));
    if (!idMatches) {
      return { busType: null, id };
    }
    const actualId = idMatches[1];
    const busType = idMatches[2];

    for (let i = 0; i < storageBackends.length; i += 1) {
      if (storageBackends[i].id === actualId) {
        if (
          storageBackends[
            i
          ].additional_provider_properties?.supported_bus_types?.find(
            p => p === busType
          )
        ) {
          return { id: actualId, busType };
        }
        return { id: actualId, busType: null };
      }
    }

    return { id, busType: null };
  },
};
