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
import { OptionsSchemaPlugin } from "@src/plugins";
import DefaultOptionsSchemaPlugin from "@src/plugins/default/OptionsSchemaPlugin";

import configLoader from "@src/utils/Config";
import type {
  UpdateData,
  TransferItem,
  TransferItemDetails,
} from "@src/@types/MainItem";
import type { Execution, ExecutionTasks } from "@src/@types/Execution";
import type { Endpoint } from "@src/@types/Endpoint";
import type { Task, ProgressUpdate } from "@src/@types/Task";
import type { Field } from "@src/@types/Field";
import { INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS } from "@src/components/modules/WizardModule/WizardOptions";

export const sortTasks = (
  tasks?: Task[],
  taskUpdatesSortFunction?: (updates: ProgressUpdate[]) => void
) => {
  if (!tasks) {
    return;
  }
  let sortedTasks: any[] = [];
  let buffer: Task[] = [];
  let runningBuffer: Task[] = [];
  let completedBuffer: Task[] = [];
  if (!taskUpdatesSortFunction) {
    return;
  }
  tasks.forEach(task => {
    taskUpdatesSortFunction(task.progress_updates);
    buffer.push(task);
    if (task.status === "RUNNING") {
      runningBuffer.push(task);
    } else if (task.status === "COMPLETED" || task.status === "ERROR") {
      completedBuffer.push(task);
    } else {
      if (runningBuffer.length >= 2) {
        sortedTasks = sortedTasks.concat([
          ...completedBuffer,
          ...runningBuffer,
          task,
        ]);
      } else {
        sortedTasks = sortedTasks.concat([...buffer]);
      }
      buffer = [];
      runningBuffer = [];
      completedBuffer = [];
    }
  });
  if (buffer.length) {
    if (runningBuffer.length >= 2) {
      sortedTasks = sortedTasks.concat([...completedBuffer, ...runningBuffer]);
    } else {
      sortedTasks = sortedTasks.concat([...buffer]);
    }
  }
  tasks.splice(0, tasks.length, ...sortedTasks);
};

export class TransferSourceUtils {
  static filterDeletedExecutions(executions?: Execution[]) {
    if (!executions || !executions.length) {
      return [];
    }

    return executions.filter(execution => execution.deleted_at == null);
  }

  static sortTransfers(transfers: TransferItem[]) {
    transfers.sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at).getTime() -
        new Date(a.updated_at || a.created_at).getTime()
    );
  }

  static sortExecutions(executions: Execution[]) {
    executions.sort((a, b) => a.number - b.number);
  }

  static sortTaskUpdates(updates: ProgressUpdate[]) {
    if (!updates) {
      return;
    }
    updates.sort((a, b) => a.index - b.index);
  }
}

class TransferSource {
  async getTransfers(
    skipLog?: boolean,
    quietError?: boolean
  ): Promise<TransferItem[]> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/transfers`,
      skipLog,
      quietError,
    });
    const transfers: TransferItem[] = response.data.transfers;
    TransferSourceUtils.sortTransfers(transfers);
    return transfers;
  }

  async getTransferDetails(options: {
    transferId: string;
    polling?: boolean;
  }): Promise<TransferItemDetails> {
    const { transferId: transferId, polling } = options;

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/transfers/${transferId}`,
      skipLog: polling,
      cancelId: transferId,
    });
    const transfer: TransferItemDetails = response.data.transfer;
    transfer.executions = TransferSourceUtils.filterDeletedExecutions(
      transfer.executions
    );
    TransferSourceUtils.sortExecutions(transfer.executions);
    return transfer;
  }

  async getExecutionTasks(options: {
    transferId: string;
    executionId?: string;
    polling?: boolean;
  }): Promise<ExecutionTasks> {
    const { transferId: transferId, executionId, polling } = options;

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/transfers/${transferId}/executions/${executionId}`,
      skipLog: polling,
      quietError: true,
    });
    const execution: ExecutionTasks = response.data.execution;
    sortTasks(execution.tasks, TransferSourceUtils.sortTaskUpdates);
    return execution;
  }

  async execute(transferId: string, fields?: Field[]): Promise<ExecutionTasks> {
    const payload: any = { execution: { shutdown_instances: false, auto_deploy: false } };
    if (fields) {
      fields.forEach(f => {
        payload.execution[f.name] = f.value || false;
      });
    }
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/transfers/${transferId}/executions`,
      method: "POST",
      data: payload,
    });
    const execution: ExecutionTasks = response.data.execution;
    sortTasks(execution.tasks, TransferSourceUtils.sortTaskUpdates);
    return execution;
  }

  async cancelExecution(options: {
    transferId: string;
    executionId?: string;
    force?: boolean;
  }): Promise<string> {
    const data: any = { cancel: null };
    if (options.force) {
      data.cancel = { force: true };
    }

    let lastExecutionId = options.executionId;

    if (!lastExecutionId) {
      const transferDetails = await this.getTransferDetails({
        transferId: options.transferId,
      });
      const lastExecution =
        transferDetails.executions[transferDetails.executions.length - 1];
      if (lastExecution.status !== "RUNNING") {
        return options.transferId;
      }
      lastExecutionId = lastExecution.id;
    }

    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/transfers/${options.transferId}/executions/${lastExecutionId}/actions`,
      method: "POST",
      data,
    });
    return options.transferId;
  }

  async deleteExecution(
    transferId: string,
    executionId: string
  ): Promise<string> {
    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/transfers/${transferId}/executions/${executionId}`,
      method: "DELETE",
    });
    return transferId;
  }

  async delete(transferId: string): Promise<string> {
    await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/transfers/${transferId}`,
      method: "DELETE",
    });
    return transferId;
  }

  async deleteDisks(transferId: string): Promise<Execution> {
    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/transfers/${transferId}/actions`,
      method: "POST",
      data: { "delete-disks": null },
    });
    return response.data.execution;
  }

  async update(options: {
    transfer: TransferItemDetails;
    sourceEndpoint: Endpoint;
    destinationEndpoint: Endpoint;
    updateData: UpdateData;
    defaultStorage: { value: string | null; busType?: string | null };
    storageConfigDefault: string;
  }): Promise<Execution> {
    const {
      transfer: transfer,
      destinationEndpoint,
      updateData,
      defaultStorage,
      storageConfigDefault,
      sourceEndpoint,
    } = options;

    const sourceParser = OptionsSchemaPlugin.for(sourceEndpoint.type);
    const destinationParser = OptionsSchemaPlugin.for(destinationEndpoint.type);
    const payload: any = { transfer: {} };

    if (updateData.destination.title) {
      payload.transfer.notes = updateData.destination.title;
    }

    if (updateData.network.length > 0) {
      payload.transfer.network_map = destinationParser.getNetworkMap(
        updateData.network
      );
    }
    if (Object.keys(updateData.source).length > 0) {
      const sourceEnv = sourceParser.getDestinationEnv(
        updateData.source,
        transfer.source_environment
      );
      if (updateData.source.minion_pool_id !== undefined) {
        payload.transfer.origin_minion_pool_id =
          updateData.source.minion_pool_id;
      }
      if (Object.keys(sourceEnv).length) {
        payload.transfer.source_environment = sourceEnv;
      }
    }

    if (Object.keys(updateData.destination).length > 0) {
      const destEnv = destinationParser.getDestinationEnv(
        updateData.destination,
        { ...transfer, ...transfer.destination_environment }
      );

      const newMinionMappings =
        destEnv[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS];
      if (newMinionMappings) {
        payload.transfer[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS] =
          newMinionMappings;
      }
      delete destEnv[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS];

      if (updateData.destination.minion_pool_id !== undefined) {
        payload.transfer.destination_minion_pool_id =
          updateData.destination.minion_pool_id;
      }
      if (Object.keys(destEnv).length) {
        payload.transfer.destination_environment = destEnv;
      }
    }

    if (defaultStorage || updateData.storage.length > 0) {
      payload.transfer.storage_mappings = destinationParser.getStorageMap(
        defaultStorage,
        updateData.storage,
        storageConfigDefault
      );
    }

    if (
      updateData.uploadedScripts?.length ||
      updateData.removedScripts?.length
    ) {
      payload.transfer.user_scripts =
        new DefaultOptionsSchemaPlugin().getUserScripts(
          updateData.uploadedScripts || [],
          updateData.removedScripts || [],
          transfer.user_scripts
        );
    }

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/transfers/${transfer.id}`,
      method: "PUT",
      data: payload,
    });
    return response.data;
  }
}

export default new TransferSource();
