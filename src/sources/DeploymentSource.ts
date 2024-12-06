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

import {
  DeploymentItem,
  DeploymentItemDetails,
  DeploymentItemOptions,
  UserScriptData,
} from "@src/@types/MainItem";
import { ProgressUpdate, Task } from "@src/@types/Task";
import { INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS } from "@src/components/modules/WizardModule/WizardOptions";
import { OptionsSchemaPlugin } from "@src/plugins";
import DefaultOptionsSchemaPlugin from "@src/plugins/default/OptionsSchemaPlugin";
import Api from "@src/utils/ApiCaller";
import configLoader from "@src/utils/Config";

import { sortTasks } from "./TransferSource";

import type { InstanceScript } from "@src/@types/Instance";
import type { Field } from "@src/@types/Field";
import type { NetworkMap } from "@src/@types/Network";
import type { Endpoint, StorageMap } from "@src/@types/Endpoint";

class DeploymentSourceUtils {
  static sortTaskUpdates(updates: ProgressUpdate[]) {
    if (!updates) {
      return;
    }
    updates.sort((a, b) => {
      const sortNull = !a && b ? 1 : a && !b ? -1 : !a && !b ? 0 : false;
      if (sortNull !== false) {
        return sortNull;
      }
      return a.index - b.index;
    });
  }

  static sortDeployments(deployments: any[]) {
    deployments.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    deployments.forEach((deployment: { tasks: Task[] }) => {
      sortTasks(deployment.tasks, DeploymentSourceUtils.sortTaskUpdates);
    });
  }
}

class DeploymentSource {
  async getDeployments(skipLog?: boolean): Promise<DeploymentItem[]> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/deployments`,
      skipLog,
    });
    const deployments = response.data.deployments;
    DeploymentSourceUtils.sortDeployments(deployments);
    return deployments;
  }

  async getDeployment(
    deploymentId: string,
    skipLog?: boolean
  ): Promise<DeploymentItemDetails> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/deployments/${deploymentId}`,
      skipLog,
      cancelId: deploymentId,
    });
    const deployment = response.data.deployment;
    sortTasks(deployment.tasks, DeploymentSourceUtils.sortTaskUpdates);
    return deployment;
  }

  async recreateFullCopy(
    deployment: DeploymentItemOptions
  ): Promise<DeploymentItem> {
    const {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      origin_endpoint_id,
      destination_endpoint_id,
      destination_environment,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      network_map,
      instances,
      storage_mappings,
      notes,
      destination_minion_pool_id,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      origin_minion_pool_id,
      instance_osmorphing_minion_pool_mappings,
    } = deployment;

    const payload: any = {
      deployment: {
        origin_endpoint_id,
        destination_endpoint_id,
        destination_environment,
        network_map,
        instances,
        storage_mappings,
        notes,
        destination_minion_pool_id,
        origin_minion_pool_id,
        instance_osmorphing_minion_pool_mappings,
      },
    };

    if (deployment.skip_os_morphing != null) {
      payload.deployment.skip_os_morphing = deployment.skip_os_morphing;
    }

    if (deployment.source_environment) {
      payload.deployment.source_environment = deployment.source_environment;
    }

    payload.deployment.shutdown_instances = Boolean(
      deployment.shutdown_instances
    );
    // payload.deployment.replication_count = deployment.replication_count || 2;

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/deployments`,
      method: "POST",
      data: payload,
    });
    return response.data.deployment;
  }

  async recreate(opts: {
    sourceEndpoint: Endpoint;
    destEndpoint: Endpoint;
    instanceNames: string[];
    destEnv: { [prop: string]: any } | null;
    updatedDestEnv: { [prop: string]: any } | null;
    sourceEnv?: { [prop: string]: any } | null;
    updatedSourceEnv?: { [prop: string]: any } | null;
    storageMappings?: { [prop: string]: any } | null;
    updatedStorageMappings: StorageMap[] | null;
    defaultStorage?: { value: string | null; busType?: string | null };
    updatedDefaultStorage?: { value: string | null; busType?: string | null };
    networkMappings?: any;
    updatedNetworkMappings: NetworkMap[] | null;
    defaultSkipOsMorphing: boolean | null;
    // replicationCount?: number | null;
    deployment: DeploymentItemDetails;
    uploadedScripts: InstanceScript[];
    removedScripts: InstanceScript[];
  }): Promise<DeploymentItemDetails> {
    const getValue = (fieldName: string): string | null => {
      const updatedDestEnv =
        opts.updatedDestEnv && opts.updatedDestEnv[fieldName];
      return updatedDestEnv != null
        ? updatedDestEnv
        : opts.destEnv && opts.destEnv[fieldName];
    };

    const sourceParser = OptionsSchemaPlugin.for(opts.sourceEndpoint.type);
    const destParser = OptionsSchemaPlugin.for(opts.destEndpoint.type);
    const payload: any = {};

    payload.deployment = {
      origin_endpoint_id: opts.sourceEndpoint.id,
      destination_endpoint_id: opts.destEndpoint.id,
      shutdown_instances: Boolean(
        opts.updatedDestEnv && opts.updatedDestEnv.shutdown_instances
      ),
      // replication_count:
      //   (opts.updatedDestEnv && opts.updatedDestEnv.replication_count) ||
      //   opts.replicationCount ||
      //   2,
      instances: opts.instanceNames,
      notes: opts.updatedDestEnv?.title || opts.deployment.notes || "",
    };

    const skipOsMorphingValue = getValue("skip_os_morphing");
    if (skipOsMorphingValue != null) {
      payload.deployment.skip_os_morphing = skipOsMorphingValue;
    } else if (opts.defaultSkipOsMorphing != null) {
      payload.deployment.skip_os_morphing = opts.defaultSkipOsMorphing;
    }

    if (
      opts.networkMappings ||
      (opts.updatedNetworkMappings && opts.updatedNetworkMappings.length)
    ) {
      payload.deployment.network_map = {
        ...opts.networkMappings,
        ...destParser.getNetworkMap(opts.updatedNetworkMappings),
      };
    }

    if (
      (opts.storageMappings && Object.keys(opts.storageMappings).length) ||
      (opts.updatedStorageMappings && opts.updatedStorageMappings.length)
    ) {
      payload.deployment.storage_mappings = {
        ...opts.storageMappings,
        ...destParser.getStorageMap(
          opts.updatedDefaultStorage || opts.defaultStorage,
          opts.updatedStorageMappings
        ),
      };
    }
    const { deployment } = opts;
    const sourceEnv: any = {
      ...opts.sourceEnv,
    };
    const updatedSourceEnv = opts.updatedSourceEnv
      ? sourceParser.getDestinationEnv(opts.updatedSourceEnv)
      : {};
    const sourceMinionPoolId =
      opts?.updatedSourceEnv?.minion_pool_id ||
      deployment.origin_minion_pool_id;
    if (sourceMinionPoolId) {
      payload.deployment.origin_minion_pool_id = sourceMinionPoolId;
    }
    payload.deployment.source_environment = {
      ...sourceEnv,
      ...updatedSourceEnv,
    };

    const destEnv: any = {
      ...opts.destEnv,
    };
    const updatedDestEnv = opts.updatedDestEnv
      ? sourceParser.getDestinationEnv(opts.updatedDestEnv)
      : {};
    const destMinionPoolId =
      opts?.updatedDestEnv?.minion_pool_id ||
      deployment.destination_minion_pool_id;
    if (destMinionPoolId) {
      payload.deployment.destination_minion_pool_id = destMinionPoolId;
    }

    const updatedDestEnvMappings =
      updatedDestEnv[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS] || {};
    const oldMappings =
      deployment[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS] || {};
    const mergedMappings = { ...oldMappings, ...updatedDestEnvMappings };
    if (Object.keys(mergedMappings).length) {
      const newMappings: any = {};
      Object.keys(mergedMappings).forEach(k => {
        if (mergedMappings[k] !== null) {
          newMappings[k] = mergedMappings[k];
        }
      });
      payload.deployment[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS] =
        newMappings;
    }

    delete updatedDestEnv[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS];

    payload.deployment.destination_environment = {
      ...destEnv,
      ...updatedDestEnv,
    };

    if (
      opts.uploadedScripts?.length ||
      opts.removedScripts?.length ||
      deployment.user_scripts
    ) {
      payload.deployment.user_scripts =
        new DefaultOptionsSchemaPlugin().getUserScripts(
          opts.uploadedScripts || [],
          opts.removedScripts || [],
          deployment.user_scripts
        );
    }

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/deployments`,
      method: "POST",
      data: payload,
    });
    return response.data.deployment;
  }

  async cancel(deploymentId: string, force?: boolean | null): Promise<string> {
    const data: any = { cancel: null };
    if (force) {
      data.cancel = { force: true };
    }
    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/deployments/${deploymentId}/actions`,
      method: "POST",
      data,
    });
    return deploymentId;
  }

  async delete(deploymentId: string): Promise<string> {
    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/deployments/${deploymentId}`,
      method: "DELETE",
    });
    return deploymentId;
  }

  async deployTransfer(opts: {
    transferId: string;
    options: Field[];
    uploadedUserScripts: InstanceScript[];
    removedUserScripts: InstanceScript[];
    userScriptData: UserScriptData | null | undefined;
    minionPoolMappings: { [instance: string]: string };
  }): Promise<DeploymentItem> {
    const {
      transferId: transferId,
      options,
      uploadedUserScripts,
      removedUserScripts,
      userScriptData,
      minionPoolMappings,
    } = opts;
    const payload: any = {
      deployment: {
        transfer_id: transferId,
      },
    };
    options.forEach(o => {
      payload.deployment[o.name] = o.value || o.default || false;
    });

    if (
      uploadedUserScripts.length ||
      removedUserScripts.length ||
      userScriptData
    ) {
      payload.deployment.user_scripts =
        new DefaultOptionsSchemaPlugin().getUserScripts(
          uploadedUserScripts,
          removedUserScripts,
          userScriptData
        );
    }

    if (Object.keys(minionPoolMappings).length) {
      const newMappings: any = {};
      Object.keys(minionPoolMappings).forEach(k => {
        if (minionPoolMappings[k] !== null) {
          newMappings[k] = minionPoolMappings[k];
        }
      });
      payload.deployment[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS] =
        newMappings;
    } else {
      payload.deployment[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS] = null;
    }

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/deployments`,
      method: "POST",
      data: payload,
    });
    return response.data.deployment;
  }
}

export default new DeploymentSource();
