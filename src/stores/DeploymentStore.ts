/*
Copyright (C) 2024 Cloudbase Solutions SRL
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

import { observable, action, runInAction } from "mobx";

import type {
  UpdateData,
  DeploymentItem,
  DeploymentItemDetails,
  DeploymentItemOptions,
  UserScriptData,
} from "@src/@types/MainItem";
import type { Field } from "@src/@types/Field";
import type { Endpoint } from "@src/@types/Endpoint";
import type { InstanceScript } from "@src/@types/Instance";
import DeploymentSource from "@src/sources/DeploymentSource";
import apiCaller from "@src/utils/ApiCaller";

class DeploymentStore {
  @observable deployments: DeploymentItem[] = [];

  @observable deploymentDetails: DeploymentItemDetails | null = null;

  @observable loading = true;

  @observable detailsLoading = true;

  @observable deploymentsPage = 1;

  @observable deploymentsHasNextPage = false;

  @observable deploymentsItemsPerPage = 25;

  deploymentsLoaded = false;

  private deploymentPageMarkers: (string | null)[] = [null];

  @action resetDeploymentPagination(): void {
    this.deploymentsPage = 1;
    this.deploymentsHasNextPage = false;
    this.deploymentPageMarkers = [null];
  }

  @action async setDeploymentsPage(page: number): Promise<void> {
    this.deploymentsPage = page;
    await this.getDeployments({ showLoading: true });
  }

  @action async setDeploymentsItemsPerPage(
    itemsPerPage: number,
  ): Promise<void> {
    this.deploymentsItemsPerPage = itemsPerPage;
    this.deploymentsPage = 1;
    this.deploymentPageMarkers = [null];
    this.deploymentsHasNextPage = false;
    await this.getDeployments({ showLoading: true });
  }

  @action async getDeployments(options?: {
    showLoading?: boolean;
    skipLog?: boolean;
  }) {
    if ((options && options.showLoading) || !this.deploymentsLoaded) {
      this.loading = true;
    }

    try {
      const marker =
        this.deploymentPageMarkers[this.deploymentsPage - 1] ?? null;
      const raw = await DeploymentSource.getDeployments({
        skipLog: options?.skipLog,
        limit: this.deploymentsItemsPerPage + 1,
        marker,
      });
      const hasNextPage = raw.length > this.deploymentsItemsPerPage;
      const deployments = hasNextPage
        ? raw.slice(0, this.deploymentsItemsPerPage)
        : raw;
      const nextMarker =
        deployments.length > 0 ? deployments[deployments.length - 1].id : null;
      runInAction(() => {
        this.deployments = deployments;
        this.deploymentsHasNextPage = hasNextPage;
        if (nextMarker !== null) {
          this.deploymentPageMarkers[this.deploymentsPage] = nextMarker;
        }
        this.loading = false;
        this.deploymentsLoaded = true;
      });
    } catch (ex) {
      runInAction(() => {
        this.loading = false;
      });
      throw ex;
    }
  }

  getDefaultSkipOsMorphing(deployment: DeploymentItemDetails | null) {
    const tasks = deployment && deployment.tasks;
    if (tasks && !tasks.find(t => t.task_type === "OS_MORPHING")) {
      return true;
    }
    return null;
  }

  @action async recreateFullCopy(deployment: DeploymentItemOptions) {
    return DeploymentSource.recreateFullCopy(deployment);
  }

  @action async recreate(opts: {
    deployment: DeploymentItemDetails;
    sourceEndpoint: Endpoint;
    destEndpoint: Endpoint;
    updateData: UpdateData;
    defaultStorage: { value: string | null; busType?: string | null };
    updatedDefaultStorage:
      | { value: string | null; busType?: string | null }
      | undefined;
    // replicationCount: number | null | undefined;
  }): Promise<DeploymentItemDetails> {
    const {
      deployment,
      sourceEndpoint,
      destEndpoint,
      updateData,
      defaultStorage,
      updatedDefaultStorage,
      // replicationCount,
    } = opts;
    const deploymentResult = await DeploymentSource.recreate({
      sourceEndpoint,
      destEndpoint,
      deployment,
      instanceNames: deployment.instances,
      sourceEnv: deployment.source_environment,
      updatedSourceEnv: updateData.source,
      destEnv: deployment.destination_environment,
      updatedDestEnv: updateData.destination,
      storageMappings: deployment.storage_mappings,
      updatedStorageMappings: updateData.storage,
      defaultStorage,
      updatedDefaultStorage,
      networkMappings: deployment.network_map,
      updatedNetworkMappings: updateData.network,
      defaultSkipOsMorphing: this.getDefaultSkipOsMorphing(deployment),
      // replicationCount,
      uploadedScripts: updateData.uploadedScripts,
      removedScripts: updateData.removedScripts,
    });
    return deploymentResult;
  }

  @action async getDeployment(
    deploymentId: string,
    options?: {
      showLoading?: boolean;
      skipLog?: boolean;
      includeTaskInfo?: boolean;
    },
  ) {
    if (options && options.showLoading) {
      this.detailsLoading = true;
    }

    try {
      const deployment = await DeploymentSource.getDeployment(
        deploymentId,
        options && options.skipLog,
        options && options.includeTaskInfo,
      );
      runInAction(() => {
        this.deploymentDetails = deployment;
        this.deployments = this.deployments.map(m =>
          m.id === deployment.id ? deployment : m,
        );
      });
    } finally {
      runInAction(() => {
        this.detailsLoading = false;
      });
    }
  }

  @action async cancel(deploymentId: string, force?: boolean | null) {
    await DeploymentSource.cancel(deploymentId, force);
  }

  @action async delete(deploymentId: string) {
    await DeploymentSource.delete(deploymentId);
    runInAction(() => {
      this.deployments = this.deployments.filter(r => r.id !== deploymentId);
    });
  }

  @action async deployTransfer(opts: {
    transferId: string;
    fields: Field[];
    uploadedUserScripts: InstanceScript[];
    removedUserScripts: InstanceScript[];
    userScriptData: UserScriptData | null | undefined;
    minionPoolMappings: { [instance: string]: string };
  }) {
    const {
      transferId: transferId,
      fields: options,
      uploadedUserScripts,
      removedUserScripts,
      userScriptData,
      minionPoolMappings,
    } = opts;
    const deployment = await DeploymentSource.deployTransfer({
      transferId: transferId,
      options,
      uploadedUserScripts,
      removedUserScripts,
      userScriptData,
      minionPoolMappings,
    });
    return deployment;
  }

  @action cancelDeploymentDetails() {
    if (this.deploymentDetails) {
      apiCaller.cancelRequests(this.deploymentDetails.id);
    }
    this.detailsLoading = false;
  }

  @action clearDetails() {
    this.detailsLoading = true;
    this.deploymentDetails = null;
  }
}

export default new DeploymentStore();
