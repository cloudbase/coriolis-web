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

  @observable transfersWithDisks: TransferItem[] = [];

  @observable transfersWithDisksLoading = false;

  @observable transfersPage = 1;

  @observable transfersHasNextPage = false;

  @observable transfersItemsPerPage = 25;

  transfersLoaded = false;

  private transferPageMarkers: (string | null)[] = [null];

  @observable executionsList: Execution[] = [];

  @observable executionsHasOlderPage = false;

  @observable executionsLoading = false;

  @observable executionsPaginationLoading = false;

  executionsPageSize = 10;

  private deletedExecutionIds: Set<string> = new Set();

  @action resetTransferPagination(): void {
    this.transfersPage = 1;
    this.transfersHasNextPage = false;
    this.transferPageMarkers = [null];
  }

  @action resetExecutionsPagination(): void {
    this.executionsList = [];
    this.executionsHasOlderPage = false;
    this.executionsLoading = false;
    this.executionsPaginationLoading = false;
  }

  @action async getTransferExecutions(options?: {
    showLoading?: boolean;
    polling?: boolean;
  }): Promise<void> {
    const transferId = this.transferDetails?.id;
    if (!transferId) {
      return;
    }

    if (options?.showLoading) {
      this.executionsLoading = true;
    }

    try {
      const raw = await TransferSource.getExecutions(transferId, {
        limit: this.executionsPageSize,
        sortKeys: ["number"],
        sortDirs: ["desc"],
      });
      const hasOlderPage = raw.length === this.executionsPageSize;
      raw.reverse();
      runInAction(() => {
        this.executionsList = raw;
        this.executionsHasOlderPage = hasOlderPage;
        this.executionsLoading = false;
      });
      this.prefetchExecutionsTasks(raw);
    } catch (err) {
      runInAction(() => {
        this.executionsLoading = false;
      });
      console.error(err);
    }
  }

  @action async loadOlderExecutions(): Promise<void> {
    const transferId = this.transferDetails?.id;
    if (
      !transferId ||
      !this.executionsHasOlderPage ||
      this.executionsLoading ||
      this.executionsPaginationLoading
    ) {
      return;
    }

    const marker = this.executionsList[0]?.id;
    if (!marker) {
      return;
    }

    this.executionsPaginationLoading = true;

    try {
      const raw = await TransferSource.getExecutions(transferId, {
        limit: this.executionsPageSize,
        marker,
        quietError: true,
        sortKeys: ["number"],
        sortDirs: ["desc"],
      });
      const hasOlderPage = raw.length === this.executionsPageSize;
      raw.reverse();
      runInAction(() => {
        this.executionsList = [...raw, ...this.executionsList];
        this.executionsHasOlderPage = hasOlderPage;
        this.executionsPaginationLoading = false;
      });
      this.prefetchExecutionsTasks(raw);
    } catch (err) {
      runInAction(() => {
        this.executionsHasOlderPage = false;
        this.executionsPaginationLoading = false;
      });
      console.error(err);
    }
  }

  @action async setTransfersPage(page: number): Promise<void> {
    this.transfersPage = page;
    await this.getTransfers({ showLoading: true });
  }

  @action async setTransfersItemsPerPage(itemsPerPage: number): Promise<void> {
    this.transfersItemsPerPage = itemsPerPage;
    this.transfersPage = 1;
    this.transferPageMarkers = [null];
    this.transfersHasNextPage = false;
    await this.getTransfers({ showLoading: true });
  }

  @action async getTransfers(options?: {
    showLoading?: boolean;
    skipLog?: boolean;
    quietError?: boolean;
  }): Promise<void> {
    this.backgroundLoading = true;

    if ((options && options.showLoading) || !this.transfersLoaded) {
      this.loading = true;
    }

    const marker = this.transferPageMarkers[this.transfersPage - 1] ?? null;
    const isPaginationRequest = marker !== null;

    try {
      const raw = await TransferSource.getTransfers({
        skipLog: options?.skipLog,
        quietError: options?.quietError || isPaginationRequest,
        limit: this.transfersItemsPerPage,
        marker,
      });
      if (isPaginationRequest && raw.length === 0) {
        runInAction(() => {
          this.transfersHasNextPage = false;
          this.transfersPage = Math.max(1, this.transfersPage - 1);
        });
        return;
      }
      const hasNextPage = raw.length === this.transfersItemsPerPage;
      const nextMarker = raw.length > 0 ? raw[raw.length - 1].id : null;
      this.getTransfersSuccess(raw, hasNextPage, nextMarker);
    } catch (err) {
      if (isPaginationRequest) {
        runInAction(() => {
          this.transfersHasNextPage = false;
          this.transfersPage = Math.max(1, this.transfersPage - 1);
        });
        return;
      }
      throw err;
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
    includeTaskInfo?: boolean;
  }) {
    const {
      transferId: transferId,
      showLoading,
      polling,
      includeTaskInfo,
    } = options;

    if (showLoading) {
      this.transferDetailsLoading = true;
    }

    try {
      const transfer = await TransferSource.getTransferDetails({
        transferId: transferId,
        polling,
        includeTaskInfo,
      });

      const activeStatuses = [
        "RUNNING",
        "PENDING",
        "CANCELLING",
        "AWAITING_MINION_ALLOCATIONS",
      ];
      const newestExecution =
        this.executionsList[this.executionsList.length - 1];
      const hasActiveExecution =
        activeStatuses.includes(transfer.last_execution_status) ||
        (newestExecution != null &&
          activeStatuses.includes(newestExecution.status));
      const shouldRefreshExecutions =
        this.executionsList.length > 0 && (!polling || hasActiveExecution);
      let freshExecutions: Execution[] | null = null;
      if (shouldRefreshExecutions) {
        try {
          freshExecutions = await TransferSource.getExecutions(transferId, {
            limit: this.executionsPageSize,
            quietError: polling,
            sortKeys: ["number"],
            sortDirs: ["desc"],
          });
          freshExecutions.reverse();
        } catch (err) {
          console.error(err);
        }
      }

      runInAction(() => {
        this.transferDetails = transfer;

        if (freshExecutions) {
          let statusChanged = false;
          const updatedList = this.executionsList.map(e => {
            const fresh = freshExecutions!.find(te => te.id === e.id);
            if (fresh && fresh.status !== e.status) {
              statusChanged = true;
              return { ...e, status: fresh.status };
            }
            return e;
          });
          if (statusChanged) {
            this.executionsList = updatedList;
          }

          if (this.executionsList.length > 0) {
            const newestNumber = Math.max(
              ...this.executionsList.map(e => e.number),
            );
            const incoming = freshExecutions.filter(
              e =>
                e.number > newestNumber &&
                !this.deletedExecutionIds.has(e.id) &&
                !this.executionsList.find(l => l.id === e.id),
            );
            if (incoming.length > 0) {
              this.executionsList = [...this.executionsList, ...incoming];
            }
          }
        }
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
    this.executionsTasks = [];
    this.deletedExecutionIds.clear();
  }

  @action getTransfersSuccess(
    transfers: TransferItem[],
    hasNextPage = false,
    nextMarker: string | null = null,
  ) {
    this.transfersLoaded = true;
    this.transfers = transfers;
    this.transfersHasNextPage = hasNextPage;
    if (nextMarker !== null) {
      this.transferPageMarkers[this.transfersPage] = nextMarker;
    }
  }

  @action getTransfersDone() {
    this.loading = false;
    this.backgroundLoading = false;
  }

  currentlyLoadingExecution = "";

  private loadingExecutionTaskIds: Set<string> = new Set();

  @action async getExecutionTasks(options: {
    transferId: string;
    executionId?: string;
    polling?: boolean;
  }) {
    const { transferId: transferId, executionId, polling } = options;
    const targetId = polling
      ? this.currentlyLoadingExecution
      : executionId || "";
    if (!targetId) {
      return;
    }

    if (!polling) {
      this.currentlyLoadingExecution = targetId;
      if (this.executionsTasks.find(e => e.id === targetId)) {
        this.executionsTasksLoading = false;
        return;
      }
      if (this.loadingExecutionTaskIds.has(targetId)) {
        this.executionsTasksLoading = true;
        return;
      }
      this.loadingExecutionTaskIds.add(targetId);
      this.executionsTasksLoading = true;
    }

    try {
      const executionTasks = await TransferSource.getExecutionTasks({
        transferId: transferId,
        executionId: targetId,
        polling,
      });
      runInAction(() => {
        this.executionsTasks = [
          ...this.executionsTasks.filter(e => e.id !== targetId),
          executionTasks,
        ];
      });
    } catch (err) {
      console.error(err);
    } finally {
      if (!polling) {
        runInAction(() => {
          this.loadingExecutionTaskIds.delete(targetId);
          if (this.currentlyLoadingExecution === targetId) {
            this.executionsTasksLoading = false;
          }
        });
      }
    }
  }

  @action async prefetchExecutionsTasks(
    executions: Execution[],
  ): Promise<void> {
    const transferId = this.transferDetails?.id;
    if (!transferId) {
      return;
    }
    await Promise.all(
      executions.map(async execution => {
        if (
          this.executionsTasks.find(e => e.id === execution.id) ||
          this.loadingExecutionTaskIds.has(execution.id)
        ) {
          return;
        }
        this.loadingExecutionTaskIds.add(execution.id);
        try {
          const executionTasks = await TransferSource.getExecutionTasks({
            transferId,
            executionId: execution.id,
            polling: true,
          });
          runInAction(() => {
            if (!this.executionsTasks.find(e => e.id === execution.id)) {
              this.executionsTasks = [...this.executionsTasks, executionTasks];
            }
            if (this.currentlyLoadingExecution === execution.id) {
              this.executionsTasksLoading = false;
            }
          });
        } catch (err) {
          console.error(err);
        } finally {
          runInAction(() => {
            this.loadingExecutionTaskIds.delete(execution.id);
          });
        }
      }),
    );
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

      if (!this.executionsList.find(e => e.id === execution.id)) {
        this.executionsList = [...this.executionsList, execution];
      }

      const withTasks = execution as ExecutionTasks;
      if (Array.isArray(withTasks.tasks)) {
        this.executionsTasks = [
          ...this.executionsTasks.filter(e => e.id !== execution.id),
          withTasks,
        ];
      }
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
    runInAction(() => {
      if (options.executionId) {
        this.executionsList = this.executionsList.map(e =>
          e.id === options.executionId ? { ...e, status: "CANCELLING" } : e,
        );
      }
    });
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
    if (
      this.executionsList.length === 0 &&
      this.transferDetails?.id === transferId
    ) {
      this.resetExecutionsPagination();
      await this.getTransferExecutions({ showLoading: true });
    }
  }

  @action deleteExecutionSuccess(transferId: string, executionId: string) {
    this.deletedExecutionIds.add(executionId);
    let executions = [];

    if (this.transferDetails?.id === transferId) {
      executions = [
        ...this.transferDetails.executions.filter(e => e.id !== executionId),
      ];
      this.transferDetails.executions = executions;
    }
    this.executionsList = this.executionsList.filter(e => e.id !== executionId);
    this.executionsTasks = this.executionsTasks.filter(
      e => e.id !== executionId,
    );
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

      if (!this.executionsList.find(e => e.id === execution.id)) {
        this.executionsList = [...this.executionsList, execution];
      }

      const withTasks = execution as ExecutionTasks;
      if (Array.isArray(withTasks.tasks)) {
        this.executionsTasks = [
          ...this.executionsTasks.filter(e => e.id !== execution.id),
          withTasks,
        ];
      }
    }
    this.getExecutionTasks({
      transferId,
      executionId: execution.id,
    });
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

  testTransferHasDisks(executions: Execution[]) {
    if (!executions || executions.length === 0) {
      return false;
    }
    if (!executions.find(e => e.type === "transfer_execution")) {
      return false;
    }
    const lastExecution = executions[executions.length - 1];
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
      const results = await Promise.all(
        transfers.map(async transfer => {
          const executions = await TransferSource.getExecutions(transfer.id, {
            limit: this.executionsPageSize,
            quietError: true,
            sortKeys: ["number"],
            sortDirs: ["desc"],
          });
          executions.reverse();
          return { transfer, hasDisks: this.testTransferHasDisks(executions) };
        }),
      );

      runInAction(() => {
        this.transfersWithDisks = results
          .filter(r => r.hasDisks)
          .map(r => r.transfer);
      });
    } finally {
      runInAction(() => {
        this.transfersWithDisksLoading = false;
      });
    }
  }
}

export default new TransferStore();
