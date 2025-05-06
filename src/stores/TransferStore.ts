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

import { observable, action, runInAction } from "mobx";

import TransferSource from "@src/sources/TransferSource";
import type {
  UpdateData,
  TransferItem,
  TransferItemDetails,
} from "@src/@types/MainItem";
import type { Execution, ExecutionTasks } from "@src/@types/Execution";
import type { Endpoint } from "@src/@types/Endpoint";
import type { Field } from "@src/@types/Field";
import apiCaller from "@src/utils/ApiCaller";
import notificationStore from "./NotificationStore";

class TransferStoreUtils {
  static getNewTransfer(
    transferDetails: TransferItemDetails,
    execution: Execution,
  ): TransferItemDetails {
    if (transferDetails.executions) {
      return {
        ...transferDetails,
        executions: [
          ...transferDetails.executions.filter(e => e.id !== execution.id),
          execution,
        ],
      };
    }

    return {
      ...transferDetails,
      executions: [execution],
    };
  }
}

class TransferStore {
  @observable transfers: TransferItem[] = [];

  @observable loading = false;

  @observable transferDetails: TransferItemDetails | null = null;

  @observable transferDetailsLoading = false;

  @observable executionsTasks: ExecutionTasks[] = [];

  @observable executionsTasksLoading = false;

  @observable backgroundLoading = false;

  @observable startingExecution = false;

  @observable transfersWithDisks: TransferItemDetails[] = [];

  @observable transfersWithDisksLoading = false;

  transfersLoaded = false;

  addExecution: { transferId: string; execution: Execution } | null = null;

  @action async getTransfers(options?: {
    showLoading?: boolean;
    skipLog?: boolean;
    quietError?: boolean;
  }): Promise<void> {
    this.backgroundLoading = true;

    if ((options && options.showLoading) || !this.transfersLoaded) {
      this.loading = true;
    }

    try {
      const transfers = await TransferSource.getTransfers(
        options && options.skipLog,
        options && options.quietError,
      );
      this.getTransfersSuccess(transfers);
    } finally {
      this.getTransfersDone();
    }
  }

  @action cancelTransferDetails() {
    if (this.transferDetails?.id) {
      apiCaller.cancelRequests(this.transferDetails?.id);
    }
    this.transferDetailsLoading = false;
  }

  @action async getTransferDetails(options: {
    transferId: string;
    showLoading?: boolean;
    polling?: boolean;
  }) {
    const { transferId: transferId, showLoading, polling } = options;

    if (showLoading) {
      this.transferDetailsLoading = true;
    }

    try {
      const transfer = await TransferSource.getTransferDetails({
        transferId: transferId,
        polling,
      });

      runInAction(() => {
        this.transferDetails = transfer;
      });
    } finally {
      runInAction(() => {
        this.transferDetailsLoading = false;
      });
    }
  }

  @action clearDetails() {
    this.transferDetails = null;
    this.currentlyLoadingExecution = "";
  }

  @action getTransfersSuccess(transfers: TransferItem[]) {
    this.transfersLoaded = true;
    this.transfers = transfers;
  }

  @action getTransfersDone() {
    this.loading = false;
    this.backgroundLoading = false;
  }

  private currentlyLoadingExecution = "";

  @action async getExecutionTasks(options: {
    transferId: string;
    executionId?: string;
    polling?: boolean;
  }) {
    const { transferId: transferId, executionId, polling } = options;

    if (!polling && this.currentlyLoadingExecution === executionId) {
      return;
    }
    this.currentlyLoadingExecution = polling
      ? this.currentlyLoadingExecution
      : executionId || "";
    if (!this.currentlyLoadingExecution) {
      return;
    }

    if (
      !this.executionsTasks.find(e => e.id === this.currentlyLoadingExecution)
    ) {
      this.executionsTasksLoading = true;
    }

    try {
      const executionTasks = await TransferSource.getExecutionTasks({
        transferId: transferId,
        executionId: this.currentlyLoadingExecution,
        polling,
      });
      runInAction(() => {
        this.executionsTasks = [
          ...this.executionsTasks.filter(
            e => e.id !== this.currentlyLoadingExecution,
          ),
          executionTasks,
        ];
      });
    } catch (err) {
      console.error(err);
    } finally {
      runInAction(() => {
        this.executionsTasksLoading = false;
      });
    }
  }

  @action async execute(transferId: string, fields?: Field[]): Promise<void> {
    this.startingExecution = true;

    const execution = await TransferSource.execute(transferId, fields);
    this.executeSuccess(transferId, execution);
  }

  @action executeSuccess(transferId: string, execution: Execution) {
    if (this.transferDetails?.id === transferId) {
      const updatedTransfer = TransferStoreUtils.getNewTransfer(
        this.transferDetails,
        execution,
      );
      this.transferDetails = updatedTransfer;
    }
    this.getExecutionTasks({
      transferId: transferId,
      executionId: execution.id,
    });

    this.startingExecution = false;
  }

  async cancelExecution(options: {
    transferId: string;
    executionId?: string;
    force?: boolean;
  }): Promise<void> {
    await TransferSource.cancelExecution(options);
    if (options.force) {
      notificationStore.alert("Force cancelled", "success");
    } else {
      notificationStore.alert("Cancelled", "success");
    }
  }

  async deleteExecution(
    transferId: string,
    executionId: string,
  ): Promise<void> {
    await TransferSource.deleteExecution(transferId, executionId);
    this.deleteExecutionSuccess(transferId, executionId);
  }

  @action deleteExecutionSuccess(transferId: string, executionId: string) {
    let executions = [];

    if (this.transferDetails?.id === transferId) {
      executions = [
        ...this.transferDetails.executions.filter(e => e.id !== executionId),
      ];
      this.transferDetails.executions = executions;
    }
    if (executionId === this.currentlyLoadingExecution) {
      this.currentlyLoadingExecution = "";
    }
  }

  async delete(transferId: string) {
    await TransferSource.delete(transferId);
    runInAction(() => {
      this.transfers = this.transfers.filter(r => r.id !== transferId);
    });
  }

  async deleteDisks(transferId: string) {
    const execution = await TransferSource.deleteDisks(transferId);
    this.deleteDisksSuccess(transferId, execution);
  }

  @action deleteDisksSuccess(transferId: string, execution: Execution) {
    if (this.transferDetails?.id === transferId) {
      const updatedTransfer = TransferStoreUtils.getNewTransfer(
        this.transferDetails,
        execution,
      );
      this.transferDetails = updatedTransfer;
    }
  }

  async update(options: {
    transfer: TransferItemDetails;
    sourceEndpoint: Endpoint;
    destinationEndpoint: Endpoint;
    updateData: UpdateData;
    defaultStorage: { value: string | null; busType?: string | null };
    storageConfigDefault: string;
  }) {
    await TransferSource.update(options);
  }

  testTransferHasDisks(transfer: TransferItemDetails | null) {
    if (!transfer || !transfer.executions || transfer.executions.length === 0) {
      return false;
    }
    if (!transfer.executions.find(e => e.type === "transfer_execution")) {
      return false;
    }
    const lastExecution = transfer.executions[transfer.executions.length - 1];
    if (
      lastExecution.type === "transfer_disks_delete" &&
      lastExecution.status === "COMPLETED"
    ) {
      return false;
    }
    return true;
  }

  @action
  async loadHaveTransfersDisks(transfers: TransferItem[]) {
    this.transfersWithDisksLoading = true;

    try {
      const transferDetails = await Promise.all(
        transfers.map(transfer =>
          TransferSource.getTransferDetails({ transferId: transfer.id }),
        ),
      );

      runInAction(() => {
        this.transfersWithDisks = transferDetails.filter(r =>
          this.testTransferHasDisks(r),
        );
      });
    } finally {
      runInAction(() => {
        this.transfersWithDisksLoading = false;
      });
    }
  }
}

export default new TransferStore();
