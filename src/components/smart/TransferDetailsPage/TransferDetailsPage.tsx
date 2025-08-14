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

import { observer } from "mobx-react";
import React from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router";

import {
  getTransferItemTitle,
  TransferItemDetails,
} from "@src/@types/MainItem";
import DetailsContentHeader from "@src/components/modules/DetailsModule/DetailsContentHeader";
import DetailsPageHeader from "@src/components/modules/DetailsModule/DetailsPageHeader";
import DetailsTemplate from "@src/components/modules/TemplateModule/DetailsTemplate";
import DeleteTransferModal from "@src/components/modules/TransferModule/DeleteTransferModal";
import TransferDetailsContent from "@src/components/modules/TransferModule/TransferDetailsContent";
import TransferExecutionOptions from "@src/components/modules/TransferModule/TransferExecutionOptions";
import DeploymentOptions from "@src/components/modules/TransferModule/DeploymentOptions";
import TransferItemModal from "@src/components/modules/TransferModule/TransferItemModal";
import { ThemePalette } from "@src/components/Theme";
import AlertModal from "@src/components/ui/AlertModal";
import Modal from "@src/components/ui/Modal";
import { providerTypes } from "@src/constants";
import endpointStore from "@src/stores/EndpointStore";
import instanceStore from "@src/stores/InstanceStore";
import deploymentStore from "@src/stores/DeploymentStore";
import minionPoolStore from "@src/stores/MinionPoolStore";
import networkStore from "@src/stores/NetworkStore";
import providerStore from "@src/stores/ProviderStore";
import transferStore from "@src/stores/TransferStore";
import scheduleStore from "@src/stores/ScheduleStore";
import userStore from "@src/stores/UserStore";
import configLoader from "@src/utils/Config";
import ObjectUtils from "@src/utils/ObjectUtils";

import replicaImage from "./images/replica.svg";
import liveMigrationImage from "./images/live_migration.svg";

import type { InstanceScript } from "@src/@types/Instance";
import type { Execution } from "@src/@types/Execution";
import type { Schedule } from "@src/@types/Schedule";
import type { Field } from "@src/@types/Field";
import type { DropdownAction } from "@src/components/ui/Dropdowns/ActionDropdown";

const Wrapper = styled.div<any>``;

type Props = {
  match: { params: { id: string; page: string | null } };
  onNavigate: (path: string) => void;
};
type State = {
  showOptionsModal: boolean;
  showDeploymentModal: boolean;
  showEditModal: boolean;
  showDeleteExecutionConfirmation: boolean;
  showForceCancelConfirmation: boolean;
  showDeleteTransferConfirmation: boolean;
  showDeleteTransferDisksConfirmation: boolean;
  confirmationItem?: TransferItemDetails | null | Execution | null;
  showCancelConfirmation: boolean;
  isEditable: boolean;
  isEditableLoading: boolean;
  pausePolling: boolean;
  initialLoading: boolean;
  deploying: boolean;
  executing: boolean;
  dbInstancesDetails: any[];
};
@observer
class TransferDetailsPage extends React.Component<Props, State> {
  state: State = {
    showOptionsModal: false,
    showDeploymentModal: false,
    showEditModal: false,
    showDeleteExecutionConfirmation: false,
    showDeleteTransferConfirmation: false,
    showDeleteTransferDisksConfirmation: false,
    confirmationItem: null,
    showCancelConfirmation: false,
    showForceCancelConfirmation: false,
    isEditable: false,
    isEditableLoading: true,
    pausePolling: false,
    initialLoading: true,
    deploying: false,
    executing: false,
    dbInstancesDetails: [],
  };

  stopPolling: boolean | null = null;

  componentDidMount() {
    document.title = "Transfer Details";

    const loadTransfer = async () => {
      await endpointStore.getEndpoints({ showLoading: true });
      this.setState({ initialLoading: false });
      this.loadTransferWithInstances({
        cache: true,
        showLoading: true,
        onDetailsLoaded: async () => {
          if (!this.transfer) {
            return;
          }
          const sourceEndpoint = endpointStore.endpoints.find(
            e => e.id === this.transfer!.origin_endpoint_id,
          );
          const destinationEndpoint = endpointStore.endpoints.find(
            e => e.id === this.transfer!.destination_endpoint_id,
          );
          if (!sourceEndpoint || !destinationEndpoint) {
            return;
          }
          const loadOptions = async (optionsType: "source" | "destination") => {
            const providerName =
              optionsType === "source"
                ? sourceEndpoint.type
                : destinationEndpoint.type;
            // This allows the values to be displayed with their allocated names instead of their IDs
            await providerStore.loadOptionsSchema({
              providerName,
              optionsType,
              useCache: true,
              quietError: true,
            });
            const getOptionsValuesConfig = {
              optionsType,
              endpointId:
                optionsType === "source"
                  ? this.transfer!.origin_endpoint_id
                  : this.transfer!.destination_endpoint_id,
              providerName,
              useCache: true,
              quietError: true,
              allowMultiple: true,
            };
            // For some providers, the API doesn't return the required fields values
            // if those required fields are sent in env data,
            // so to retrieve those values a request without env data must be made
            await providerStore.getOptionsValues(getOptionsValuesConfig);
            await providerStore.getOptionsValues({
              ...getOptionsValuesConfig,
              envData:
                optionsType === "source"
                  ? this.transfer!.source_environment
                  : this.transfer!.destination_environment,
            });
          };

          await Promise.all([
            loadOptions("source"),
            loadOptions("destination"),
          ]);
        },
      });
    };

    const loadTransferAndPollData = async () => {
      await loadTransfer();
      this.pollData();
    };
    loadTransferAndPollData();
    scheduleStore.getSchedules(this.transferId);
  }

  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (newProps.match.params.id !== this.props.match.params.id) {
      this.loadTransferWithInstances({
        cache: true,
        transferId: newProps.match.params.id,
      });
      scheduleStore.getSchedules(newProps.match.params.id);
    }
  }

  componentWillUnmount() {
    transferStore.cancelTransferDetails();
    transferStore.clearDetails();
    scheduleStore.clearUnsavedSchedules();
    this.stopPolling = true;
  }

  get transferId() {
    if (!this.props.match?.params?.id) {
      throw new Error("Invalid transfer id");
    }
    return this.props.match.params.id;
  }

  get transfer() {
    return transferStore.transferDetails;
  }

  getLastExecution() {
    if (this.transfer?.executions?.length) {
      return this.transfer.executions[this.transfer.executions.length - 1];
    }
    return null;
  }

  getStatus() {
    return this.getLastExecution()?.status;
  }

  getTransferItemType(): string {
    let item_type = "replica";
    const scenario = this.transfer?.scenario;
    if (scenario && scenario === "live_migration") {
      item_type = "migration";
    }
    return item_type;
  }

  getTransferTypePillShouldRed(): boolean {
    let should_red = true;
    const scenario = this.transfer?.scenario;
    if (scenario && scenario === "live_migration") {
      should_red = false;
    }
    return should_red;
  }

  getTransferScenarioTypeImage(): string {
    let image = replicaImage;
    const scenario = this.transfer?.scenario;
    if (scenario && scenario === "live_migration") {
      image = liveMigrationImage;
    }
    return image;
  }

  hasStoredVmInfo(info: any): boolean {
    return (
      info &&
      Object.keys(info).length > 0 &&
      Object.values(info).some((vmData: any) => vmData.export_info)
    );
  }

  async loadIsEditable(transferDetails: TransferItemDetails) {
    const targetEndpointId = transferDetails.destination_endpoint_id;
    const sourceEndpointId = transferDetails.origin_endpoint_id;
    await ObjectUtils.waitFor(() => endpointStore.endpoints.length > 0);
    const sourceEndpoint = endpointStore.endpoints.find(
      e => e.id === sourceEndpointId,
    );
    const targetEndpoint = endpointStore.endpoints.find(
      e => e.id === targetEndpointId,
    );
    if (!sourceEndpoint || !targetEndpoint || !providerStore.providers) {
      return;
    }
    const sourceProviderTypes = providerStore.providers[sourceEndpoint.type];
    const targetProviderTypes = providerStore.providers[targetEndpoint.type];
    const isEditable =
      sourceProviderTypes && targetProviderTypes
        ? !!sourceProviderTypes.types.find(
            t => t === providerTypes.SOURCE_UPDATE,
          ) &&
          !!targetProviderTypes.types.find(
            t => t === providerTypes.TARGET_UPDATE,
          )
        : false;

    this.setState({ isEditable, isEditableLoading: false });
  }

  async loadTransferWithInstances(options: {
    cache: boolean;
    transferId?: string;
    showLoading?: boolean;
    onDetailsLoaded?: () => void;
  }) {
    await transferStore.getTransferDetails({
      transferId: options.transferId || this.transferId,
      showLoading: options.showLoading,
    });
    const transfer = this.transfer;
    if (!transfer) {
      return null;
    }
    if (options.onDetailsLoaded) {
      options.onDetailsLoaded();
    }
    minionPoolStore.loadMinionPools();

    await providerStore.loadProviders();

    this.loadIsEditable(transfer);

    networkStore.loadNetworks(
      transfer.destination_endpoint_id,
      transfer.destination_environment,
      {
        quietError: true,
        cache: options.cache,
      },
    );

    const targetEndpoint = endpointStore.endpoints.find(
      e => e.id === transfer.destination_endpoint_id,
    );

    const hasStorageMap = targetEndpoint
      ? providerStore.providers && providerStore.providers[targetEndpoint.type]
        ? !!providerStore.providers[targetEndpoint.type].types.find(
            t => t === providerTypes.STORAGE,
          )
        : false
      : false;
    if (hasStorageMap) {
      endpointStore.loadStorage(
        transfer.destination_endpoint_id,
        transfer.destination_environment,
      );
    }

    if (this.hasStoredVmInfo(transfer.info)) {
      this.populateInstanceStoreFromTransferInfo(transfer.info);
    } else {
      instanceStore.loadInstancesDetails({
        endpointId: transfer.origin_endpoint_id,
        instances: transfer.instances.map(n => ({ id: n })),
        cache: options.cache,
        quietError: false,
        env: transfer.source_environment,
        targetProvider: targetEndpoint?.type,
      });
    }

    return transfer;
  }

  populateInstanceStoreFromTransferInfo(transferInfo: any) {
    const instancesDetails = Object.keys(transferInfo).map(vmName => {
      const vmData = transferInfo[vmName];
      const exportInfo = vmData.export_info || {};

      return {
        id: exportInfo.id || vmName,
        name: exportInfo.name || vmName,
        instance_name: exportInfo.instance_name || vmName,
        firmware_type: exportInfo.firmware_type,
        num_cpu: exportInfo.num_cpu,
        memory_mb: exportInfo.memory_mb,
        os_type: exportInfo.os_type,
        flavor_name: exportInfo.flavor_name,
        devices: exportInfo.devices || {},
      };
    });

    this.setState({ dbInstancesDetails: instancesDetails });
  }

  isExecuteDisabled() {
    const transfer = this.transfer;
    if (!transfer) {
      return true;
    }
    const originEndpoint = endpointStore.endpoints.find(
      e => e.id === transfer.origin_endpoint_id,
    );
    const targetEndpoint = endpointStore.endpoints.find(
      e => e.id === transfer.destination_endpoint_id,
    );
    const status = this.getStatus();

    return Boolean(
      !originEndpoint ||
        !targetEndpoint ||
        status === "RUNNING" ||
        status === "CANCELLING" ||
        status === "AWAITING_MINION_ALLOCATIONS",
    );
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case "signout":
        userStore.logout();
        break;
      default:
    }
  }

  handleExecuteClick() {
    this.setState({ showOptionsModal: true });
  }

  handleCloseOptionsModal() {
    this.setState({ showOptionsModal: false });
  }

  handleDeleteExecutionConfirmation() {
    const transfer = this.transfer;
    if (!this.state.confirmationItem || !transfer) {
      return;
    }
    transferStore.deleteExecution(transfer.id, this.state.confirmationItem.id);
    this.handleCloseExecutionConfirmation();
  }

  handleDeleteExecutionClick(execution?: Execution | null) {
    this.setState({
      showDeleteExecutionConfirmation: true,
      confirmationItem: execution,
    });
  }

  handleCloseExecutionConfirmation() {
    this.setState({
      showDeleteExecutionConfirmation: false,
      confirmationItem: null,
    });
  }

  handleDeleteTransferClick() {
    this.setState({ showDeleteTransferConfirmation: true });
  }

  handleDeleteTransferDisksClick() {
    this.setState({ showDeleteTransferDisksConfirmation: true });
  }

  handleDeleteTransferConfirmation() {
    this.setState({ showDeleteTransferConfirmation: false });
    const transfer = this.transfer;
    if (!transfer) {
      return;
    }
    this.props.onNavigate("/transfers");
    transferStore.delete(transfer.id);
  }

  handleCloseDeleteTransferConfirmation() {
    this.setState({ showDeleteTransferConfirmation: false });
  }

  handleDeleteTransferDisksConfirmation() {
    this.setState({
      showDeleteTransferDisksConfirmation: false,
      showDeleteTransferConfirmation: false,
    });
    const transfer = this.transfer;
    if (!transfer) {
      return;
    }
    transferStore.deleteDisks(transfer.id);
    this.props.onNavigate(`/transfers/${transfer.id}/executions`);
  }

  handleCloseDeleteTransferDisksConfirmation() {
    this.setState({ showDeleteTransferDisksConfirmation: false });
  }

  handleCloseDeploymentModal() {
    this.setState({ showDeploymentModal: false, pausePolling: false });
  }

  handleCreateDeploymentClick() {
    this.setState({ showDeploymentModal: true, pausePolling: true });
  }

  handleTransferEditClick() {
    this.setState({ showEditModal: true, pausePolling: true });
  }

  handleAddScheduleClick(schedule: Schedule) {
    scheduleStore.addSchedule(this.transferId, schedule);
  }

  handleScheduleChange(
    scheduleId: string | null,
    data: Schedule,
    forceSave?: boolean,
  ) {
    const oldData = scheduleStore.schedules.find(s => s.id === scheduleId);
    const unsavedData = scheduleStore.unsavedSchedules.find(
      s => s.id === scheduleId,
    );

    if (scheduleId) {
      scheduleStore.updateSchedule({
        transferId: this.transferId,
        scheduleId,
        data,
        oldData,
        unsavedData,
        forceSave,
      });
    }
  }

  handleScheduleSave(schedule: Schedule) {
    if (schedule.id) {
      scheduleStore.updateSchedule({
        transferId: this.transferId,
        scheduleId: schedule.id,
        data: schedule,
        oldData: schedule,
        unsavedData: schedule,
        forceSave: true,
      });
    }
  }

  handleScheduleRemove(scheduleId: string | null) {
    if (scheduleId) {
      scheduleStore.removeSchedule(this.transferId, scheduleId);
    }
  }

  handleCancelLastExecutionClick(force?: boolean) {
    this.handleCancelExecution(this.getLastExecution(), force);
  }

  handleCancelExecution(
    confirmationItem?: Execution | null,
    force?: boolean | null,
  ) {
    if (force) {
      this.setState({ confirmationItem, showForceCancelConfirmation: true });
    } else {
      this.setState({ confirmationItem, showCancelConfirmation: true });
    }
  }

  handleCloseCancelConfirmation() {
    this.setState({
      showForceCancelConfirmation: false,
      showCancelConfirmation: false,
    });
  }

  handleCancelConfirmation(force?: boolean) {
    const transfer = this.transfer;
    if (!this.state.confirmationItem || !transfer) {
      return;
    }
    transferStore.cancelExecution({
      transferId: transfer.id,
      executionId: this.state.confirmationItem.id,
      force,
    });
    this.setState({
      showForceCancelConfirmation: false,
      showCancelConfirmation: false,
    });
  }
  async deploy(opts: {
    fields: Field[];
    uploadedUserScripts: InstanceScript[];
    removedUserScripts: InstanceScript[];
    minionPoolMappings: { [instance: string]: string };
  }) {
    const transfer = this.transfer;
    if (!transfer) {
      return;
    }
    this.setState({ deploying: true });
    const {
      fields,
      uploadedUserScripts,
      removedUserScripts,
      minionPoolMappings,
    } = opts;
    try {
      const deployment = await deploymentStore.deployTransfer({
        transferId: transfer.id,
        fields,
        uploadedUserScripts,
        removedUserScripts,
        userScriptData: transfer.user_scripts,
        minionPoolMappings,
      });
      this.props.onNavigate(`/deployments/${deployment.id}/tasks/`);
    } finally {
      this.setState({ deploying: false });
    }
  }

  async executeTransfer(fields: Field[]) {
    const transfer = this.transfer;
    if (!transfer) {
      return;
    }
    this.setState({ executing: true });
    try {
      await transferStore.execute(transfer.id, fields);

      this.handleCloseOptionsModal();
      this.props.onNavigate(`/transfers/${transfer.id}/executions`);
    } finally {
      this.setState({ executing: false });
    }
  }

  async pollData() {
    if (
      this.state.pausePolling ||
      this.stopPolling ||
      // Polling while on the schedule page is not needed and it can cause issues with the datetime pick component
      this.props.match.params.page === "schedule"
    ) {
      return;
    }

    await Promise.all([
      transferStore.getTransferDetails({
        transferId: this.transferId,
        polling: true,
      }),
      (async () => {
        if (window.location.pathname.indexOf("executions") > -1) {
          await transferStore.getExecutionTasks({
            transferId: this.transferId,
            polling: true,
          });
        }
      })(),
    ]);

    setTimeout(() => {
      this.pollData();
    }, configLoader.config.requestPollTimeout);
  }

  closeEditModal() {
    this.setState({ showEditModal: false, pausePolling: false }, () => {
      this.pollData();
    });
  }

  handleEditTransferReload() {
    this.loadTransferWithInstances({ cache: false });
  }

  handleUpdateComplete(redirectTo: string) {
    this.props.onNavigate(redirectTo);
    this.closeEditModal();
  }

  async handleExecutionChange(executionId: string) {
    await ObjectUtils.waitFor(() => Boolean(transferStore.transferDetails));
    if (!transferStore.transferDetails?.id) {
      return;
    }
    transferStore.getExecutionTasks({
      transferId: transferStore.transferDetails.id,
      executionId,
    });
  }

  renderEditTransfer() {
    const transfer = this.transfer;
    if (!transfer) {
      return null;
    }
    const sourceEndpoint = endpointStore.endpoints.find(
      e => e.id === transfer.origin_endpoint_id,
    );
    const destinationEndpoint = endpointStore.endpoints.find(
      e => e.id === transfer.destination_endpoint_id,
    );

    if (!this.state.showEditModal || !destinationEndpoint || !sourceEndpoint) {
      return null;
    }

    return (
      <TransferItemModal
        isOpen
        type="transfer"
        sourceEndpoint={sourceEndpoint}
        onUpdateComplete={url => {
          this.handleUpdateComplete(url);
        }}
        onRequestClose={() => {
          this.closeEditModal();
        }}
        transfer={transfer}
        destinationEndpoint={destinationEndpoint}
        instancesDetails={instanceStore.instancesDetails}
        instancesDetailsLoading={instanceStore.loadingInstancesDetails}
        networks={networkStore.networks}
        networksLoading={networkStore.loading}
        onReloadClick={() => {
          this.handleEditTransferReload();
        }}
      />
    );
  }

  render() {
    const editTitle = providerStore.providersLoading
      ? "Loading providers data"
      : !this.state.isEditable
        ? "One of the platform plugins doesn't support editing transfer option."
        : null;
    const dropdownActions: DropdownAction[] = [
      {
        label: "Execute",
        action: () => {
          this.handleExecuteClick();
        },
        hidden: this.isExecuteDisabled(),
      },
      {
        label: "Cancel",
        hidden:
          this.getStatus() !== "RUNNING" &&
          this.getStatus() !== "AWAITING_MINION_ALLOCATIONS",
        action: () => {
          this.handleCancelLastExecutionClick();
        },
      },
      {
        label: "Force Cancel",
        hidden: this.getStatus() !== "CANCELLING",
        action: () => {
          this.handleCancelLastExecutionClick(true);
        },
      },
      {
        label: "Create Deployment",
        color: ThemePalette.primary,
        action: () => {
          this.handleCreateDeploymentClick();
        },
      },
      {
        label: "Edit",
        title: editTitle,
        action: () => {
          this.handleTransferEditClick();
        },
        disabled: !this.state.isEditable,
        loading: this.state.isEditableLoading,
      },
      {
        label: "Delete Disks",
        action: () => {
          this.handleDeleteTransferDisksClick();
        },
      },
      {
        label: "Delete",
        color: ThemePalette.alert,
        action: () => {
          this.handleDeleteTransferClick();
        },
      },
    ];
    const transfer = this.transfer;

    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={
            <DetailsPageHeader
              user={userStore.loggedUser}
              onUserItemClick={item => {
                this.handleUserItemClick(item);
              }}
            />
          }
          contentHeaderComponent={
            <DetailsContentHeader
              statusPill={transfer?.last_execution_status}
              itemTitle={getTransferItemTitle(this.transfer)}
              itemType={this.getTransferItemType()}
              itemDescription={transfer?.description}
              dropdownActions={dropdownActions}
              backLink="/transfers"
              typeImage={this.getTransferScenarioTypeImage()}
              alertInfoPill={this.getTransferTypePillShouldRed()}
              primaryInfoPill={!this.getTransferTypePillShouldRed()}
            />
          }
          contentComponent={
            <TransferDetailsContent
              item={transfer}
              itemId={this.transferId}
              instancesDetails={
                this.state.dbInstancesDetails || instanceStore.instancesDetails
              }
              instancesDetailsLoading={
                instanceStore.loadingInstancesDetails ||
                endpointStore.storageLoading ||
                providerStore.providersLoading
              }
              endpoints={endpointStore.endpoints}
              storageBackends={endpointStore.storageBackends}
              scheduleStore={scheduleStore}
              networks={networkStore.networks}
              minionPools={minionPoolStore.minionPools}
              detailsLoading={
                transferStore.transferDetailsLoading ||
                endpointStore.loading ||
                minionPoolStore.loadingMinionPools ||
                this.state.initialLoading
              }
              sourceSchema={providerStore.sourceSchema}
              sourceSchemaLoading={
                providerStore.sourceSchemaLoading ||
                providerStore.sourceOptionsPrimaryLoading ||
                providerStore.sourceOptionsSecondaryLoading
              }
              destinationSchema={providerStore.destinationSchema}
              destinationSchemaLoading={
                providerStore.destinationSchemaLoading ||
                providerStore.destinationOptionsPrimaryLoading ||
                providerStore.destinationOptionsSecondaryLoading
              }
              executionsLoading={
                transferStore.startingExecution ||
                transferStore.transferDetailsLoading
              }
              onExecutionChange={id => {
                this.handleExecutionChange(id);
              }}
              executions={transferStore.transferDetails?.executions || []}
              executionsTasksLoading={
                transferStore.executionsTasksLoading ||
                transferStore.transferDetailsLoading ||
                transferStore.startingExecution
              }
              executionsTasks={transferStore.executionsTasks}
              page={this.props.match.params.page || ""}
              onCancelExecutionClick={(e, f) => {
                this.handleCancelExecution(e, f);
              }}
              onDeleteExecutionClick={execution => {
                this.handleDeleteExecutionClick(execution);
              }}
              onExecuteClick={() => {
                this.handleExecuteClick();
              }}
              onCreateDeploymentClick={() => {
                this.handleCreateDeploymentClick();
              }}
              onDeleteTransferClick={() => {
                this.handleDeleteTransferClick();
              }}
              onAddScheduleClick={schedule => {
                this.handleAddScheduleClick(schedule);
              }}
              onScheduleChange={(scheduleId, data, forceSave) => {
                this.handleScheduleChange(scheduleId, data, forceSave);
              }}
              onScheduleRemove={scheduleId => {
                this.handleScheduleRemove(scheduleId);
              }}
              onScheduleSave={s => {
                this.handleScheduleSave(s);
              }}
            />
          }
        />
        <Modal
          isOpen={this.state.showOptionsModal}
          title="New Execution"
          onRequestClose={() => {
            this.handleCloseOptionsModal();
          }}
        >
          <TransferExecutionOptions
            disableExecutionOptions={configLoader.config.providersDisabledExecuteOptions.some(
              p =>
                p ===
                endpointStore.endpoints.find(
                  e =>
                    e.id === transferStore.transferDetails?.origin_endpoint_id,
                )?.type,
            )}
            onCancelClick={() => {
              this.handleCloseOptionsModal();
            }}
            onExecuteClick={fields => {
              this.executeTransfer(fields);
            }}
            executing={this.state.executing}
          />
        </Modal>
        {this.state.showDeploymentModal ? (
          <Modal
            isOpen
            title="Deploy Transfer"
            onRequestClose={() => {
              this.handleCloseDeploymentModal();
            }}
          >
            <DeploymentOptions
              transferItem={this.transfer}
              minionPools={minionPoolStore.minionPools.filter(
                m =>
                  m.endpoint_id === this.transfer?.destination_endpoint_id &&
                  m.platform === "destination",
              )}
              loadingInstances={instanceStore.loadingInstancesDetails}
              instances={instanceStore.instancesDetails}
              onCancelClick={() => {
                this.handleCloseDeploymentModal();
              }}
              deploying={this.state.deploying}
              onDeployClick={opts => {
                this.deploy(opts);
              }}
            />
          </Modal>
        ) : null}
        <AlertModal
          isOpen={this.state.showDeleteExecutionConfirmation}
          title="Delete Execution?"
          message="Are you sure you want to delete this execution?"
          extraMessage="Deleting a Coriolis Execution is permanent!"
          onConfirmation={() => {
            this.handleDeleteExecutionConfirmation();
          }}
          onRequestClose={() => {
            this.handleCloseExecutionConfirmation();
          }}
        />
        {this.state.showDeleteTransferConfirmation ? (
          <DeleteTransferModal
            hasDisks={transferStore.testTransferHasDisks(this.transfer)}
            onRequestClose={() => this.handleCloseDeleteTransferConfirmation()}
            onDeleteTransfer={() => {
              this.handleDeleteTransferConfirmation();
            }}
            onDeleteDisks={() => {
              this.handleDeleteTransferDisksConfirmation();
            }}
          />
        ) : null}
        <AlertModal
          isOpen={this.state.showDeleteTransferDisksConfirmation}
          title="Delete Transferred Disks?"
          message="Are you sure you want to delete this tranfer's disks?"
          extraMessage="Deleting Coriolis Transfer Disks is permanent!"
          onConfirmation={() => {
            this.handleDeleteTransferDisksConfirmation();
          }}
          onRequestClose={() => {
            this.handleCloseDeleteTransferDisksConfirmation();
          }}
        />
        <AlertModal
          isOpen={this.state.showCancelConfirmation}
          title="Cancel Execution?"
          message="Are you sure you want to cancel the current execution?"
          extraMessage=" "
          onConfirmation={() => {
            this.handleCancelConfirmation();
          }}
          onRequestClose={() => {
            this.handleCloseCancelConfirmation();
          }}
        />
        <AlertModal
          isOpen={this.state.showForceCancelConfirmation}
          title="Force Cancel Execution?"
          message="Are you sure you want to force cancel the current execution?"
          extraMessage={`
The execution is currently being cancelled.
Would you like to force its cancellation?
Note that this may lead to scheduled cleanup tasks being forcibly skipped, and thus manual cleanup of temporary resources on the source/destination platforms may be required.`}
          onConfirmation={() => {
            this.handleCancelConfirmation(true);
          }}
          onRequestClose={() => {
            this.handleCloseCancelConfirmation();
          }}
        />
        {this.renderEditTransfer()}
      </Wrapper>
    );
  }
}

function TransferDetailsPageWithNavigate() {
  const navigate = useNavigate();
  const { id, page } = useParams();

  if (!id) {
    throw new Error("The 'id' parameter is required but was not provided.");
  }

  return (
    <TransferDetailsPage
      onNavigate={navigate}
      match={{ params: { id, page: page || null } }}
    />
  );
}

export default TransferDetailsPageWithNavigate;
