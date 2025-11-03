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

import { observable, runInAction, computed, action } from "mobx";

import type { Instance, InstanceBase } from "@src/@types/Instance";
import type { Endpoint } from "@src/@types/Endpoint";
import InstanceSource from "@src/sources/InstanceSource";
import ApiCaller from "@src/utils/ApiCaller";
import configLoader from "@src/utils/Config";
import { ProviderTypes } from "@src/@types/Providers";
import notificationStore from "./NotificationStore";

class InstanceStore {
  @observable instancesLoading = false;

  @observable instancesPerPage = 6;

  @observable currentPage = 1;

  @observable searchChunksLoading = false;

  @observable searchedInstances: Instance[] = [];

  @observable backgroundInstances: Instance[] = [];

  @observable backgroundChunksLoading = false;

  @observable searching = false;

  @observable searchNotFound = false;

  @observable reloading = false;

  @observable instancesDetails: Instance[] = [];

  @observable loadingInstancesDetails = false;

  @observable instancesDetailsCount = 0;

  @observable instancesDetailsRemaining = 0;

  @observable searchText = "";

  @computed get instances(): Instance[] {
    if (this.searchText && this.searchedInstances.length > 0) {
      return this.searchedInstances;
    }
    return this.backgroundInstances;
  }

  @computed get chunksLoading(): boolean {
    if (this.searchText) {
      return this.searchChunksLoading;
    }
    return this.backgroundChunksLoading;
  }

  lastEndpointId?: string;

  reqId!: number;

  @action async loadInstancesInChunks(options: {
    endpoint: Endpoint;
    vmsPerPage?: number;
    reload?: boolean;
    env?: any;
    useCache?: boolean;
    refresh?: boolean;
  }) {
    const { endpoint, vmsPerPage, reload, env, useCache, refresh } = options;
    const usableVmsPerPage = vmsPerPage || 6;

    ApiCaller.cancelRequests(`${endpoint.id}-chunk`);

    this.backgroundInstances = [];
    if (reload) {
      this.reloading = true;
    } else {
      this.instancesLoading = true;
    }
    this.backgroundChunksLoading = true;
    this.lastEndpointId = endpoint.id;
    const chunkSize = configLoader.config.instancesListBackgroundLoading;
    const chunkCount = Math.max(
      chunkSize[endpoint.type] || chunkSize.default,
      usableVmsPerPage,
    );

    const loadNextChunk = async (lastEndpointId?: string) => {
      const currentEndpointId = endpoint.id;
      const [instances, invalidInstances] =
        await InstanceSource.loadInstancesChunk({
          endpointId: currentEndpointId,
          chunkSize: chunkCount,
          lastInstanceId: lastEndpointId,
          cancelId: `${endpoint.id}-chunk`,
          env,
          cache: useCache,
          refresh: refresh && !lastEndpointId,
        });
      if (currentEndpointId !== this.lastEndpointId) {
        return;
      }
      if (invalidInstances.length) {
        notificationStore.alert(
          `There are one or more instances with invalid data (i.e. missing ID): ${invalidInstances
            .map(i => i.name || i.instance_name)
            .join(", ")}`,
          "error",
        );
      }

      const shouldContinue = this.loadInstancesInChunksSuccess({
        instances,
        instancesCount: instances.length + invalidInstances.length,
        chunkCount,
        reload,
      });
      if (shouldContinue) {
        await loadNextChunk(instances[instances.length - 1].id);
      }
    };
    await loadNextChunk();
  }

  @action loadInstancesInChunksSuccess(opts: {
    instances: Instance[];
    instancesCount: number;
    chunkCount: number;
    reload?: boolean;
  }): boolean {
    const { instances, instancesCount, chunkCount, reload } = opts;

    this.backgroundInstances = [...this.backgroundInstances, ...instances];
    if (reload) {
      this.reloading = false;
    }
    this.instancesLoading = false;

    if (instancesCount < chunkCount) {
      this.backgroundChunksLoading = false;
      return false;
    }
    return true;
  }

  @action async loadInstances(endpointId: string): Promise<void> {
    this.instancesLoading = true;
    this.lastEndpointId = endpointId;

    try {
      const instances = await InstanceSource.loadInstances(endpointId, true);
      if (endpointId !== this.lastEndpointId) {
        return;
      }
      this.loadInstancesSuccess(instances);
    } catch (ex) {
      if (endpointId !== this.lastEndpointId) {
        return;
      }
      runInAction(() => {
        this.instancesLoading = false;
      });
      throw ex;
    }
  }

  @action loadInstancesSuccess(instances: Instance[]) {
    this.backgroundInstances = instances;
    this.instancesLoading = false;
  }

  @action async searchInstances(endpoint: Endpoint, searchText: string) {
    ApiCaller.cancelRequests(`${endpoint.id}-chunk-search`);

    this.searchText = searchText;
    this.searchNotFound = false;

    if (!searchText) {
      this.currentPage = 1;
      this.searchedInstances = [];
      return;
    }

    if (!this.backgroundChunksLoading) {
      this.searchedInstances = this.backgroundInstances.filter(
        i =>
          (i.instance_name || i.name)
            .toLowerCase()
            .indexOf(searchText.toLowerCase()) > -1,
      );
      this.searchNotFound = Boolean(this.searchedInstances.length === 0);
      this.currentPage = 1;
      return;
    }

    this.searching = true;
    this.searchChunksLoading = true;

    const chunkSize = configLoader.config.instancesListBackgroundLoading;
    const chunkCount = Math.max(
      chunkSize[endpoint.type] || chunkSize.default,
      this.instancesPerPage,
    );

    const loadNextChunk = async (lastEndpointId?: string) => {
      const [instances, invalidInstances] =
        await InstanceSource.loadInstancesChunk({
          endpointId: endpoint.id,
          chunkSize: chunkCount,
          lastInstanceId: lastEndpointId,
          cancelId: `${endpoint.id}-chunk-search`,
          searchText,
        });
      if (this.searching) {
        runInAction(() => {
          this.currentPage = 1;
          this.searchedInstances = [];
        });
      }
      if (invalidInstances.length) {
        notificationStore.alert(
          `There are one or more instances with invalid data (i.e. missing ID): ${invalidInstances
            .map(i => i.name || i.instance_name)
            .join(", ")}`,
          "error",
        );
      }
      const shouldContinue = this.searchInstancesSuccess(
        instances,
        instances.length + invalidInstances.length,
        chunkCount,
      );
      if (shouldContinue) {
        loadNextChunk(instances[instances.length - 1].id);
      }
    };
    loadNextChunk();
  }

  @action searchInstancesSuccess(
    instances: Instance[],
    instancesCount: number,
    chunkCount: number,
  ): boolean {
    this.searchedInstances = [...this.searchedInstances, ...instances];
    this.searching = false;
    this.searchNotFound = Boolean(this.searchedInstances.length === 0);
    if (instancesCount < chunkCount) {
      this.searchChunksLoading = false;
      return false;
    }
    return true;
  }

  @action reloadInstances(endpoint: Endpoint, chunkSize?: number, env?: any) {
    this.searchNotFound = false;
    this.searchText = "";
    this.currentPage = 1;
    this.loadInstancesInChunks({
      endpoint,
      vmsPerPage: chunkSize,
      reload: true,
      env,
      refresh: true,
    });
  }

  @action cancelIntancesChunksLoading() {
    ApiCaller.cancelRequests(`${this.lastEndpointId}-chunk`);
    this.lastEndpointId = "";
    this.searchNotFound = false;
    this.searchText = "";
    this.currentPage = 1;
  }

  @action setPage(page: number) {
    this.currentPage = page;
  }

  @action updateInstancesPerPage(instancesPerPage: number) {
    this.currentPage = 1;
    this.instancesPerPage = instancesPerPage;
  }

  @action async loadInstancesDetailsBulk(
    instanceInfos: {
      endpointId: string;
      instanceIds: string[];
      env?: any;
    }[],
  ) {
    this.reqId = !this.reqId ? 1 : this.reqId + 1;
    this.instancesDetails = [];
    this.loadingInstancesDetails = true;
    InstanceSource.cancelInstancesDetailsRequests(this.reqId - 1);
    try {
      await Promise.all(
        instanceInfos.map(async i => {
          await Promise.all(
            i.instanceIds.map(async instanceId => {
              const instanceDetails = await InstanceSource.loadInstanceDetails({
                endpointId: i.endpointId,
                instanceId,
                reqId: this.reqId,
                quietError: false,
                env: i.env,
                cache: true,
              });
              const instance = instanceDetails.instance;
              if (!instance) {
                return;
              }
              runInAction(() => {
                this.instancesDetails = this.instancesDetails.filter(
                  id => (id.instance_name || id.id) !== instanceId,
                );
                this.instancesDetails.push(instance);
                this.instancesDetails = this.instancesDetails
                  .slice()
                  .sort(n => n.name.localeCompare(n.name));
              });
            }),
          );
        }),
      );
    } finally {
      this.loadingInstancesDetails = false;
    }
  }

  @action async addInstanceDetails(opts: {
    endpointId: string;
    instanceInfo: InstanceBase;
    cache?: boolean;
    quietError?: boolean;
    env?: any;
    targetProvider: ProviderTypes;
  }) {
    const { endpointId, instanceInfo, cache, quietError, env, targetProvider } =
      opts;
    this.loadingInstancesDetails = true;
    const resp = await InstanceSource.loadInstanceDetails({
      endpointId,
      instanceId: instanceInfo.instance_name || instanceInfo.id,
      targetProvider,
      reqId: this.reqId,
      quietError,
      env,
      cache,
    });
    const instance = resp.instance;
    if (!instance) {
      return;
    }

    runInAction(() => {
      this.loadingInstancesDetails = false;
      if (this.instancesDetails.find(i => i.id === instance.id)) {
        this.instancesDetails = this.instancesDetails.filter(
          i => i.id !== instance.id,
        );
      }
      this.instancesDetails = [...this.instancesDetails, instance];
      this.instancesDetails = this.instancesDetails
        .slice()
        .sort((a, b) =>
          (a.instance_name || a.name).localeCompare(b.instance_name || b.name),
        );
    });
  }

  @action removeInstanceDetails(instance: Instance) {
    this.instancesDetails = this.instancesDetails.filter(
      i => i.id !== instance.id,
    );
  }

  @action async loadInstancesDetails(opts: {
    endpointId: string;
    instances: InstanceBase[];
    cache?: boolean;
    quietError?: boolean;
    skipLog?: boolean;
    env?: any;
    targetProvider?: ProviderTypes | null;
  }): Promise<void> {
    const {
      endpointId,
      instances,
      cache,
      quietError,
      env,
      targetProvider,
      skipLog,
    } = opts;
    // Use reqId to be able to uniquely identify the request
    // so all but the latest request can be igonred and canceled
    this.reqId = !this.reqId ? 1 : this.reqId + 1;
    InstanceSource.cancelInstancesDetailsRequests(this.reqId - 1);

    instances.sort((a, b) =>
      (a.instance_name || a.name || a.id).localeCompare(
        b.instance_name || b.name || b.id,
      ),
    );

    const count = instances.length;
    if (count === 0) {
      return;
    }
    this.loadingInstancesDetails = true;
    this.instancesDetails = [];
    this.instancesDetailsCount = count;
    this.instancesDetailsRemaining = count;

    await new Promise<void>(resolve => {
      Promise.all(
        instances.map(async instanceInfo => {
          try {
            const resp = await InstanceSource.loadInstanceDetails({
              endpointId,
              instanceId: instanceInfo.instance_name || instanceInfo.id,
              targetProvider,
              reqId: this.reqId,
              quietError,
              env,
              cache,
              skipLog,
            });
            const instance = resp.instance;
            if (resp.reqId !== this.reqId || !instance) {
              return;
            }

            runInAction(() => {
              this.instancesDetailsRemaining -= 1;
              this.loadingInstancesDetails = this.instancesDetailsRemaining > 0;

              if (this.instancesDetails.find(i => i.id === instance.id)) {
                this.instancesDetails = this.instancesDetails.filter(
                  i => i.id !== instance.id,
                );
              }
              this.instancesDetails = [...this.instancesDetails, instance];
            });
            if (this.instancesDetailsRemaining === 0) {
              this.instancesDetails = this.instancesDetails
                .slice()
                .sort((a, b) =>
                  (a.instance_name || a.name).localeCompare(
                    b.instance_name || b.name,
                  ),
                );
              resolve();
            }
          } catch (err) {
            runInAction(() => {
              this.instancesDetailsRemaining -= 1;
              this.loadingInstancesDetails = this.instancesDetailsRemaining > 0;
            });
            if (!err || err.reqId !== this.reqId) {
              return;
            }
            if (count === 0) {
              resolve();
            }
          }
        }),
      );
    });
  }

  @action clearInstancesDetails() {
    this.instancesDetails = [];
    this.loadingInstancesDetails = false;
    this.instancesDetailsCount = 0;
    this.instancesDetailsRemaining = 0;
  }
}

export default new InstanceStore();
