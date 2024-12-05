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

import React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";

import MainTemplate from "@src/components/modules/TemplateModule/MainTemplate";
import Navigation from "@src/components/modules/NavigationModule/Navigation";
import FilterList from "@src/components/ui/Lists/FilterList";
import PageHeader from "@src/components/smart/PageHeader";
import AlertModal from "@src/components/ui/AlertModal";
import Modal from "@src/components/ui/Modal";
import TransferExecutionOptions from "@src/components/modules/TransferModule/TransferExecutionOptions";
import DeploymentOptions from "@src/components/modules/TransferModule/DeploymentOptions";
import DeleteTransferModal from "@src/components/modules/TransferModule/DeleteTransferModal/DeleteTransferModal";

import type { DropdownAction } from "@src/components/ui/Dropdowns/ActionDropdown";
import type { Field } from "@src/@types/Field";
import type { InstanceScript } from "@src/@types/Instance";

import projectStore from "@src/stores/ProjectStore";
import transferStore from "@src/stores/TransferStore";
import deploymentStore from "@src/stores/DeploymentStore";
import scheduleStore from "@src/stores/ScheduleStore";
import instanceStore from "@src/stores/InstanceStore";
import endpointStore from "@src/stores/EndpointStore";
import notificationStore from "@src/stores/NotificationStore";

import { ThemePalette } from "@src/components/Theme";
import configLoader from "@src/utils/Config";
import { TransferItem } from "@src/@types/MainItem";
import userStore from "@src/stores/UserStore";
import TransferListItem from "@src/components/modules/TransferModule/TransferListItem";
import replicaLargeImage from "./images/replica-large.svg";

const Wrapper = styled.div<any>``;

const SCHEDULE_POLL_TIMEOUT = 10000;

type State = {
  modalIsOpen: boolean;
  selectedTransfers: TransferItem[];
  showCancelExecutionModal: boolean;
  showExecutionOptionsModal: boolean;
  showCreateDeploymentsModal: boolean;
  showDeleteDisksModal: boolean;
  showDeleteTransfersModal: boolean;
};
@observer
class TransfersPage extends React.Component<{ history: any }, State> {
  state: State = {
    modalIsOpen: false,
    selectedTransfers: [],
    showCancelExecutionModal: false,
    showCreateDeploymentsModal: false,
    showExecutionOptionsModal: false,
    showDeleteDisksModal: false,
    showDeleteTransfersModal: false,
  };

  pollTimeout = 0;

  stopPolling = false;

  schedulePolling = false;

  schedulePollTimeout = 0;

  paginatedTransferIds: string[] = [];

  componentDidMount() {
    document.title = "Coriolis Transfers";

    projectStore.getProjects();
    endpointStore.getEndpoints({ showLoading: true });
    userStore.getAllUsers({
      showLoading: userStore.users.length === 0,
      quietError: true,
    });

    this.stopPolling = false;
    this.pollData();
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout);
    clearTimeout(this.schedulePollTimeout);
    this.stopPolling = true;
  }

  getEndpoint(endpointId: string) {
    return endpointStore.endpoints.find(endpoint => endpoint.id === endpointId);
  }

  getFilterItems() {
    return [
      { label: "All", value: "all" },
      { label: "Running", value: "RUNNING" },
      { label: "Error", value: "ERROR" },
      { label: "Completed", value: "COMPLETED" },
    ];
  }

  getStatus(transfer?: TransferItem | null): string {
    return transfer?.last_execution_status || "";
  }

  handleProjectChange() {
    transferStore.getTransfers();
    endpointStore.getEndpoints({ showLoading: true });
  }

  handleReloadButtonClick() {
    projectStore.getProjects();
    transferStore.getTransfers({ showLoading: true });
    endpointStore.getEndpoints({ showLoading: true });
    userStore.getAllUsers({ showLoading: true, quietError: true });
  }

  handleItemClick(item: TransferItem) {
    if (item.last_execution_status === "RUNNING") {
      this.props.history.push(`/transfers/${item.id}/executions`);
    } else {
      this.props.history.push(`/transfers/${item.id}`);
    }
  }

  handlePaginatedItemsChange(paginatedTransfers: TransferItem[]) {
    this.paginatedTransferIds = paginatedTransfers.map(r => r.id);
  }

  executeSelectedTransfers(fields: Field[]) {
    this.state.selectedTransfers.forEach(transfer => {
      const actualTransfer = transferStore.transfers.find(
        r => r.id === transfer.id
      );
      if (actualTransfer && this.isExecuteEnabled(actualTransfer)) {
        transferStore.execute(transfer.id, fields);
      }
    });
    notificationStore.alert("Executing selected transfers");
    this.setState({ showExecutionOptionsModal: false });
  }

  deploySelectedTransfers(fields: Field[], uploadedScripts: InstanceScript[]) {
    notificationStore.alert("Creating deployments from selected transfers");
    this.deploy(fields, uploadedScripts);
    this.setState({ showCreateDeploymentsModal: false, modalIsOpen: false });
  }

  async deploy(fields: Field[], uploadedScripts: InstanceScript[]) {
    await Promise.all(
      this.state.selectedTransfers.map(transfer =>
        deploymentStore.deployTransfer({
          transferId: transfer.id,
          fields,
          uploadedUserScripts: uploadedScripts.filter(
            s =>
              !s.instanceId || transfer.instances.find(i => i === s.instanceId)
          ),
          removedUserScripts: [],
          userScriptData: transfer.user_scripts,
          minionPoolMappings:
            transfer.instance_osmorphing_minion_pool_mappings || {},
        })
      )
    );
    notificationStore.alert(
      "Deployments successfully created from transfers.",
      "success"
    );
    this.props.history.push("/deployments");
  }

  handleShowDeleteTransfers() {
    transferStore.loadHaveTransfersDisks(this.state.selectedTransfers);
    this.setState({ showDeleteTransfersModal: true });
  }

  deleteTransfersDisks(transfers: TransferItem[]) {
    transfers.forEach(transfer => {
      transferStore.deleteDisks(transfer.id);
    });
    this.setState({
      showDeleteDisksModal: false,
      showDeleteTransfersModal: false,
    });
    notificationStore.alert("Deleting selected transfers' disks");
  }

  cancelExecutions() {
    this.state.selectedTransfers.forEach(transfer => {
      const actualTransfer = transferStore.transfers.find(
        r => r.id === transfer.id
      );
      if (
        actualTransfer?.last_execution_status === "RUNNING" ||
        actualTransfer?.last_execution_status === "AWAITING_MINION_ALLOCATIONS"
      ) {
        transferStore.cancelExecution({ transferId: transfer.id });
      }
    });
    this.setState({ showCancelExecutionModal: false });
  }

  isExecuteEnabled(transfer?: TransferItem | null): boolean {
    if (!transfer) {
      return false;
    }
    const usableTransfer = transfer;
    const originEndpoint = endpointStore.endpoints.find(
      e => e.id === usableTransfer.origin_endpoint_id
    );
    const targetEndpoint = endpointStore.endpoints.find(
      e => e.id === usableTransfer.destination_endpoint_id
    );
    const status = this.getStatus(usableTransfer);
    return Boolean(
      originEndpoint &&
        targetEndpoint &&
        status !== "RUNNING" &&
        status !== "AWAITING_MINION_ALLOCATIONS"
    );
  }

  deleteSelectedTransfers() {
    this.state.selectedTransfers.forEach(transfer => {
      transferStore.delete(transfer.id);
    });
    this.setState({ showDeleteTransfersModal: false });
  }

  handleEmptyListButtonClick() {
    this.props.history.push("/wizard/replica");
  }

  handleModalOpen() {
    this.setState({ modalIsOpen: true });
  }

  handleModalClose() {
    this.setState({ modalIsOpen: false }, () => {
      this.pollData();
    });
  }

  handleShowCreateDeploymentsModal() {
    instanceStore.loadInstancesDetailsBulk(
      transferStore.transfers.map(r => ({
        endpointId: r.origin_endpoint_id,
        instanceIds: r.instances,
        env: r.source_environment,
      }))
    );

    this.setState({ showCreateDeploymentsModal: true, modalIsOpen: true });
  }

  async pollData() {
    if (this.state.modalIsOpen || this.stopPolling) {
      return;
    }

    await Promise.all([
      transferStore.getTransfers({ skipLog: true }),
      endpointStore.getEndpoints({ skipLog: true }),
      userStore.getAllUsers({ skipLog: true, quietError: true }),
    ]);
    if (!this.schedulePolling) {
      this.pollSchedule();
    }
    this.pollTimeout = window.setTimeout(() => {
      this.pollData();
    }, configLoader.config.requestPollTimeout);
  }

  async pollSchedule() {
    if (
      this.state.modalIsOpen ||
      this.stopPolling ||
      transferStore.transfers.length === 0
    ) {
      return;
    }
    this.schedulePolling = true;
    await scheduleStore.getSchedulesBulk(this.paginatedTransferIds);
    this.schedulePollTimeout = window.setTimeout(() => {
      this.pollSchedule();
    }, SCHEDULE_POLL_TIMEOUT);
  }

  searchText(item: TransferItem, text: string) {
    let result = false;
    if (item.instances[0].toLowerCase().indexOf(text) > -1) {
      return true;
    }
    if (item.notes && item.notes.toLowerCase().indexOf(text) > -1) {
      return true;
    }
    if (item.destination_environment) {
      Object.keys(item.destination_environment).forEach(prop => {
        if (
          item.destination_environment[prop]?.toLowerCase &&
          item.destination_environment[prop].toLowerCase().indexOf(text) > -1
        ) {
          result = true;
        }
      });
    }
    return result;
  }

  itemFilterFunction(
    item: TransferItem,
    filterStatus?: string | null,
    filterText?: string
  ) {
    if (
      (filterStatus !== "all" && item.last_execution_status !== filterStatus) ||
      !this.searchText(
        item,
        (filterText?.toLowerCase && filterText.toLowerCase()) || ""
      )
    ) {
      return false;
    }

    return true;
  }

  isTransferScheduled(transferId: string): boolean {
    const bulkScheduleItem = scheduleStore.bulkSchedules.find(
      b => b.transferId === transferId
    );
    if (!bulkScheduleItem) {
      return false;
    }
    const result = Boolean(bulkScheduleItem.schedules.find(s => s.enabled));
    return result;
  }

  render() {
    let atLeastOneHasExecuteEnabled = false;
    let atLeaseOneIsRunning = false;
    this.state.selectedTransfers.forEach(transfer => {
      const storeTransfer = transferStore.transfers.find(r => r.id === transfer.id);
      atLeastOneHasExecuteEnabled =
        atLeastOneHasExecuteEnabled || this.isExecuteEnabled(storeTransfer);
      const status = this.getStatus(storeTransfer);
      atLeaseOneIsRunning =
        atLeaseOneIsRunning ||
        status === "RUNNING" ||
        status === "AWAITING_MINION_ALLOCATIONS";
    });

    const transfersWithDisabledExecutionOptions =
      this.state.selectedTransfers.filter(transfer =>
        configLoader.config.providersDisabledExecuteOptions.find(
          p =>
            p ===
            endpointStore.endpoints.find(
              e => e.id === transfer.origin_endpoint_id
            )?.type
        )
      );

    const BulkActions: DropdownAction[] = [
      {
        label: "Execute",
        action: () => {
          this.setState({ showExecutionOptionsModal: true });
        },
        disabled: !atLeastOneHasExecuteEnabled,
      },
      {
        label: "Cancel",
        disabled: !atLeaseOneIsRunning,
        action: () => {
          this.setState({ showCancelExecutionModal: true });
        },
      },
      {
        label: "Deploy Transfers",
        color: ThemePalette.primary,
        action: () => {
          this.handleShowCreateDeploymentsModal();
        },
      },
      {
        label: "Delete Disks",
        action: () => {
          this.setState({ showDeleteDisksModal: true });
        },
      },
      {
        label: "Delete Transfers",
        color: ThemePalette.alert,
        action: () => {
          this.handleShowDeleteTransfers();
        },
      },
    ];

    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="transfers" />}
          listComponent={
            <FilterList
              filterItems={this.getFilterItems()}
              selectionLabel="transfer"
              loading={transferStore.loading}
              items={transferStore.transfers}
              dropdownActions={BulkActions}
              onItemClick={item => {
                this.handleItemClick(item);
              }}
              onReloadButtonClick={() => {
                this.handleReloadButtonClick();
              }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              onSelectedItemsChange={selectedTransfers => {
                this.setState({ selectedTransfers: selectedTransfers });
              }}
              onPaginatedItemsChange={paginatedTransfers => {
                this.handlePaginatedItemsChange(paginatedTransfers);
              }}
              renderItemComponent={options => (
                <TransferListItem
                  {...options}
                  showScheduleIcon={this.isTransferScheduled(options.item.id)}
                  endpointType={id => {
                    const endpoint = this.getEndpoint(id);
                    if (endpoint) {
                      return endpoint.type;
                    }
                    if (endpointStore.loading) {
                      return "Loading...";
                    }
                    return "Not Found";
                  }}
                  getUserName={id =>
                    userStore.users.find(u => u.id === id)?.name
                  }
                  userNameLoading={userStore.allUsersLoading}
                />
              )}
              emptyListImage={replicaLargeImage}
              emptyListMessage="It seems like you don't have any Transfers in this project."
              emptyListExtraMessage="A Coriolis Transfer is performed by replicating incrementally the virtual machines data from the source cloud endpoint to the target."
              emptyListButtonLabel="Create a Transfer"
              onEmptyListButtonClick={() => {
                this.handleEmptyListButtonClick();
              }}
            />
          }
          headerComponent={
            <PageHeader
              title="Coriolis Transfers"
              onProjectChange={() => {
                this.handleProjectChange();
              }}
              onModalOpen={() => {
                this.handleModalOpen();
              }}
              onModalClose={() => {
                this.handleModalClose();
              }}
            />
          }
        />
        {this.state.showDeleteTransfersModal ? (
          <DeleteTransferModal
            isMultiTransferSelection
            hasDisks={transferStore.transfersWithDisks.length > 0}
            loading={transferStore.transfersWithDisksLoading}
            onRequestClose={() => {
              this.setState({ showDeleteTransfersModal: false });
            }}
            onDeleteTransfer={() => {
              this.deleteSelectedTransfers();
            }}
            onDeleteDisks={() => {
              this.deleteTransfersDisks(transferStore.transfersWithDisks);
            }}
          />
        ) : null}
        {this.state.showCancelExecutionModal ? (
          <AlertModal
            isOpen
            title="Cancel Executions?"
            message="Are you sure you want to cancel the selected transfers' executions?"
            extraMessage=" "
            onConfirmation={() => {
              this.cancelExecutions();
            }}
            onRequestClose={() => {
              this.setState({ showCancelExecutionModal: false });
            }}
          />
        ) : null}
        {this.state.showExecutionOptionsModal ? (
          <Modal
            isOpen
            title="New Executions for Selected Transfers"
            onRequestClose={() => {
              this.setState({ showExecutionOptionsModal: false });
            }}
          >
            <TransferExecutionOptions
              disableExecutionOptions={
                transfersWithDisabledExecutionOptions.length ===
                this.state.selectedTransfers.length
              }
              onCancelClick={() => {
                this.setState({ showExecutionOptionsModal: false });
              }}
              onExecuteClick={fields => {
                this.executeSelectedTransfers(fields);
              }}
            />
          </Modal>
        ) : null}
        {this.state.showCreateDeploymentsModal ? (
          <Modal
            isOpen
            title="Deploy Selected Transfers"
            onRequestClose={() => {
              this.setState({
                showCreateDeploymentsModal: false,
                modalIsOpen: false,
              });
            }}
          >
            <DeploymentOptions
              transferItem={null}
              minionPools={[]}
              instances={instanceStore.instancesDetails}
              loadingInstances={instanceStore.loadingInstancesDetails}
              onCancelClick={() => {
                this.setState({
                  showCreateDeploymentsModal: false,
                  modalIsOpen: false,
                });
              }}
              onDeployClick={options => {
                this.deploySelectedTransfers(
                  options.fields,
                  options.uploadedUserScripts
                );
              }}
            />
          </Modal>
        ) : null}
        {this.state.showDeleteDisksModal ? (
          <AlertModal
            isOpen
            title="Delete Selected Transfers' Disks?"
            message="Are you sure you want to delete the selected transfers' disks?"
            extraMessage="Deleting Coriolis Transfer Disks is permanent!"
            onConfirmation={() => {
              this.deleteTransfersDisks(this.state.selectedTransfers);
            }}
            onRequestClose={() => {
              this.setState({ showDeleteDisksModal: false });
            }}
          />
        ) : null}
      </Wrapper>
    );
  }
}

export default TransfersPage;
