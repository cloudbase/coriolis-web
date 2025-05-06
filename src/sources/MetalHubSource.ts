/*
Copyright (C) 202  Cloudbase Solutions SRL
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

import { Endpoint } from "@src/@types/Endpoint";
import { MetalHubServer } from "@src/@types/MetalHub";
import EndpointSource from "@src/sources/EndpointSource";
import apiCaller from "@src/utils/ApiCaller";
import configLoader from "@src/utils/Config";

class MetalHubSource {
  private _endpoint: Endpoint | null = null;

  async getMetalHubEndpoint(): Promise<Endpoint> {
    if (this._endpoint) {
      return this._endpoint;
    }

    const endpoints = await EndpointSource.getEndpoints(true);
    const metalHubEndpointName = configLoader.config.bareMetalEndpointName;
    const metalHubEndpoint = endpoints.find(
      endpoint => endpoint.name === metalHubEndpointName,
    );
    if (!metalHubEndpoint) {
      throw new Error(
        `Could not find endpoint '${metalHubEndpointName}'. The endpoint name was configured in the config file and is needed in order to communicate with the Coriolis Metal Hub service.`,
      );
    }

    return metalHubEndpoint;
  }

  async getServers(skipLog?: boolean): Promise<MetalHubServer[]> {
    const response = await apiCaller.send({
      url: `${configLoader.config.servicesUrls.metalhub}/servers`,
      skipLog,
      quietError: true,
    });
    const servers: MetalHubServer[] = response.data;
    servers.sort((a, b) => {
      if (new Date(a.updated_at) > new Date(b.updated_at)) {
        return -1;
      }
      if (new Date(a.updated_at) < new Date(b.updated_at)) {
        return 1;
      }
      return 0;
    });
    return servers;
  }

  async getServerDetails(serverId: number): Promise<MetalHubServer> {
    const response = await apiCaller.send({
      url: `${configLoader.config.servicesUrls.metalhub}/servers/${serverId}`,
    });
    return response.data;
  }

  async loadFingerprint(): Promise<string> {
    return (
      await apiCaller.send({
        url: "/proxy/metal-hub/fingerprint",
        quietError: true,
      })
    ).data;
  }

  async addServer(apiEndpoint: string): Promise<MetalHubServer> {
    const response = await apiCaller.send({
      url: `${configLoader.config.servicesUrls.metalhub}/servers`,
      method: "POST",
      data: { api_endpoint: apiEndpoint },
    });
    return response.data;
  }

  async deleteServer(serverId: number): Promise<void> {
    const response = await apiCaller.send({
      url: `${configLoader.config.servicesUrls.metalhub}/servers/${serverId}`,
      method: "DELETE",
    });
    return response.data;
  }

  async patchServer(
    serverId: number,
    apiEndpoint: string,
  ): Promise<MetalHubServer> {
    const response = await apiCaller.send({
      url: `${configLoader.config.servicesUrls.metalhub}/servers/${serverId}`,
      method: "PUT",
      data: { api_endpoint: apiEndpoint },
    });
    return response.data;
  }

  async refreshServer(serverId: number): Promise<MetalHubServer> {
    const response = await apiCaller.send({
      url: `${configLoader.config.servicesUrls.metalhub}/servers/${serverId}/refresh`,
      method: "GET",
    });
    return response.data;
  }
}

export default new MetalHubSource();
