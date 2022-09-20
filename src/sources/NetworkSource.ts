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

import Api from "@src/utils/ApiCaller";
import type { Network } from "@src/@types/Network";

import configLoader from "@src/utils/Config";
import DomUtils from "@src/utils/DomUtils";

class NetworkSource {
  async loadNetworks(
    enpointId: string,
    environment: { [prop: string]: any } | null,
    options?: {
      quietError?: boolean;
      cache?: boolean;
    }
  ): Promise<Network[]> {
    let url = `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/endpoints/${enpointId}/networks`;
    if (environment) {
      url = `${url}?env=${DomUtils.encodeToBase64Url(environment)}`;
    }
    const response = await Api.send({
      url,
      quietError: options && options.quietError,
      cache: options && options.cache,
    });
    const networks: Network[] = response.data.networks.filter(
      (n: any) => n.name.indexOf("coriolis-migrnet") === -1
    );
    networks.sort((a, b) => a.name.localeCompare(b.name));
    return networks;
  }
}

export default new NetworkSource();
