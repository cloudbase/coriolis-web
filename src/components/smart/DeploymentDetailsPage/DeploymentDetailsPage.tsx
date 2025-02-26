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

import { observer } from "mobx-react";
import React from "react";
import styled from "styled-components";

import {
  getTransferItemTitle,
  DeploymentItemDetails,
} from "@src/@types/MainItem";
import DetailsContentHeader from "@src/components/modules/DetailsModule/DetailsContentHeader";
import DetailsPageHeader from "@src/components/modules/DetailsModule/DetailsPageHeader";
import DetailsTemplate from "@src/components/modules/TemplateModule/DetailsTemplate";
import DeploymentDetailsContent from "@src/components/modules/TransferModule/DeploymentDetailsContent";
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
import notificationStore from "@src/stores/NotificationStore";
import providerStore from "@src/stores/ProviderStore";
import userStore from "@src/stores/UserStore";
import configLoader from "@src/utils/Config";

import replicaDeploymentImage from "./images/replica-deployment.svg";
import liveMigrationDeploymentImage from "./images/live-migration-deployment.svg";

import type { Field } from "@src/@types/Field";
import type { InstanceScript } from "@src/@types/Instance";
const Wrapper = styled.div<any>``;

type Props = {
  match: any;
  history: any;
};
type State = {
  showDeleteDeploymentConfirmation: boolean;
  showCancelConfirmation: boolean;
  showForceCancelConfirmation: boolean;
  showEditModal: boolean;
  showFromTransferModal: boolean;
  pausePolling: boolean;
  initialLoading: boolean;
  deploying: boolean;
};
@observer
class DeploymentDetailsPage extends React.Component<Props, State> {
  state: State = {
    showDeleteDeploymentConfirmation: false,
    showCancelConfirmation: false,
    showForceCancelConfirmation: false,
    showEditModal: false,
    showFromTransferModal: false,
    pausePolling: false,
    initialLoading: true,
    deploying: false,
  };

  stopPolling: boolean | null = null;

  timeoutRef: any = null;

  componentDidMount() {
    document.title = "Deployment Details";

    this.loadDeploymentAndPollData();
  }

  UNSAFE_componentWillReceiveProps(newProps: any) {
    if (newProps.match.params.id === this.props.match.params.id) {
      return;
    }
    this.timeoutRef && clearTimeout(this.timeoutRef);
    deploymentStore.cancelDeploymentDetails();
    deploymentStore.clearDetails();
    endpointStore.getEndpoints();
    this.loadDeploymentAndPollData();
  }

  componentWillUnmount() {
    deploymentStore.cancelDeploymentDetails();
    deploymentStore.clearDetails();
    this.stopPolling = true;
  }

  getStatus() {
    return deploymentStore.deploymentDetails?.last_execution_status;
  }

  getDeploymentScenarioItemType(details: DeploymentItemDetails | null): string {
    let item_type = "replica";
    const scenario = details?.transfer_scenario_type;
    if (scenario && scenario === "live_migration") {
      item_type = "migration";
    }
    return item_type;
  }

  getTransferTypePillShouldRed(details: DeploymentItemDetails | null): boolean {
    let should_red = true;
    const scenario = details?.transfer_scenario_type;
    if (scenario && scenario === "live_migration") {
      should_red = false;
    }
    return should_red;
  }

  getDeploymentScenarioTypeImage(
    details: DeploymentItemDetails | null
  ): string {
    let image = replicaDeploymentImage;
    const scenario = details?.transfer_scenario_type;
    if (scenario && scenario === "live_migration") {
      image = liveMigrationDeploymentImage;
    }
    return image;
  }

  async loadDeploymentAndPollData() {
    const loadDeployment = async () => {
      await endpointStore.getEndpoints({ showLoading: true });
      this.setState({ initialLoading: false });
      await this.loadDeploymentWithInstances({
        deploymentId: this.props.match.params.id,
        cache: true,
        onDetailsLoaded: async () => {
          const details = deploymentStore.deploymentDetails;
          if (!details) {
            return;
          }
          const sourceEndpoint = endpointStore.endpoints.find(
            e => e.id === details.origin_endpoint_id
          );
          const destinationEndpoint = endpointStore.endpoints.find(
            e => e.id === details.destination_endpoint_id
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
                  ? details.origin_endpoint_id
                  : details.destination_endpoint_id,
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
                  ? details.source_environment
                  : details.destination_environment,
            });
          };

          await Promise.all([
            loadOptions("source"),
            loadOptions("destination"),
          ]);
        },
      });
    };
    await loadDeployment();
    this.pollData();
  }

  async loadDeploymentWithInstances(options: {
    deploymentId: string;
    cache: boolean;
    onDetailsLoaded?: () => void;
  }) {
    await deploymentStore.getDeployment(options.deploymentId, {
      showLoading: true,
    });
    const details = deploymentStore.deploymentDetails;
    if (!details) {
      return;
    }
    if (options.onDetailsLoaded) {
      options.onDetailsLoaded();
    }
    if (details.origin_minion_pool_id || details.destination_minion_pool_id) {
      minionPoolStore.loadMinionPools();
    }

    await providerStore.loadProviders();

    const targetEndpoint = endpointStore.endpoints.find(
      e => e.id === details.destination_endpoint_id
    );
    const hasStorageMap = targetEndpoint
      ? providerStore.providers && providerStore.providers[targetEndpoint.type]
        ? !!providerStore.providers[targetEndpoint.type].types.find(
            t => t === providerTypes.STORAGE
          )
        : false
      : false;
    if (hasStorageMap) {
      endpointStore.loadStorage(
        details.destination_endpoint_id,
        details.destination_environment
      );
    }

    networkStore.loadNetworks(
      details.destination_endpoint_id,
      details.destination_environment,
      {
        quietError: true,
        cache: options.cache,
      }
    );

    instanceStore.loadInstancesDetails({
      endpointId: details.origin_endpoint_id,
      instances: details.instances.map(n => ({ id: n })),
      cache: options.cache,
      quietError: false,
      env: details.source_environment,
      targetProvider: targetEndpoint?.type,
    });
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case "signout":
        userStore.logout();
        break;
      default:
    }
  }

  handleDeleteDeploymentClick() {
    this.setState({ showDeleteDeploymentConfirmation: true });
  }

  handleDeleteDeploymentConfirmation() {
    this.setState({ showDeleteDeploymentConfirmation: false });
    this.props.history.push("/deployments");
    if (deploymentStore.deploymentDetails) {
      deploymentStore.delete(deploymentStore.deploymentDetails.id);
    }
  }

  handleCloseDeleteDeploymentConfirmation() {
    this.setState({ showDeleteDeploymentConfirmation: false });
  }

  handleCancelDeploymentClick(force?: boolean) {
    if (force) {
      this.setState({ showForceCancelConfirmation: true });
    } else {
      this.setState({ showCancelConfirmation: true });
    }
  }

  handleShowExecutionClick() {
    if (!deploymentStore.deploymentDetails?.deployer_id) {
      return;
    }
    this.props.history.push(
      `/transfers/${deploymentStore.deploymentDetails.transfer_id}/executions`
    );
  }

  handleRecreateClick() {
    if (!deploymentStore.deploymentDetails?.transfer_id) {
      this.setState({ showEditModal: true, pausePolling: true });
      return;
    }
    this.setState({ showFromTransferModal: true, pausePolling: true });
  }

  handleCloseFromTransferModal() {
    this.setState({ showFromTransferModal: false, pausePolling: false });
  }

  handleCloseCancelConfirmation() {
    this.setState({
      showCancelConfirmation: false,
      showForceCancelConfirmation: false,
    });
  }

  async handleCancelConfirmation(force?: boolean) {
    this.setState({
      showCancelConfirmation: false,
      showForceCancelConfirmation: false,
    });
    if (!deploymentStore.deploymentDetails) {
      return;
    }
    await deploymentStore.cancel(deploymentStore.deploymentDetails.id, force);
    if (force) {
      notificationStore.alert("Force Canceled", "success");
    } else {
      notificationStore.alert("Canceled", "success");
    }
  }

  async recreateFromTransfer(opts: {
    fields: Field[];
    uploadedUserScripts: InstanceScript[];
    removedUserScripts: InstanceScript[];
    minionPoolMappings: { [instance: string]: string };
  }) {
    const {
      fields,
      uploadedUserScripts,
      removedUserScripts,
      minionPoolMappings,
    } = opts;
    const transferId = deploymentStore.deploymentDetails?.transfer_id;
    if (!transferId) {
      return;
    }

    this.setState({ deploying: true });
    try {
      const deployment = await this.deploy({
        transferId: transferId,
        fields,
        uploadedUserScripts,
        removedUserScripts,
        minionPoolMappings,
      });
      this.props.history.push(`/deployments/${deployment.id}/tasks`);
    } finally {
      this.setState({ deploying: false });
    }
    this.handleCloseFromTransferModal();
  }

  async deploy(opts: {
    transferId: string;
    fields: Field[];
    uploadedUserScripts: InstanceScript[];
    removedUserScripts: InstanceScript[];
    minionPoolMappings: { [instance: string]: string };
  }) {
    const {
      transferId: transferId,
      fields,
      uploadedUserScripts,
      removedUserScripts,
      minionPoolMappings,
    } = opts;
    const deployment = await deploymentStore.deployTransfer({
      transferId: transferId,
      fields,
      uploadedUserScripts,
      removedUserScripts,
      userScriptData: deploymentStore.deploymentDetails?.user_scripts,
      minionPoolMappings,
    });
    return deployment;
  }

  async pollData() {
    if (this.state.pausePolling || this.stopPolling) {
      return;
    }
    await deploymentStore.getDeployment(this.props.match.params.id, {
      showLoading: false,
      skipLog: true,
    });
    this.timeoutRef = setTimeout(() => {
      this.pollData();
    }, configLoader.config.requestPollTimeout);
  }

  closeEditModal() {
    this.setState({ showEditModal: false, pausePolling: false }, () => {
      this.pollData();
    });
  }

  handleEditTransferReload() {
    this.loadDeploymentWithInstances({
      deploymentId: this.props.match.params.id,
      cache: false,
    });
  }

  handleUpdateComplete(redirectTo: string) {
    this.props.history.push(redirectTo);
  }

  renderEditModal() {
    const sourceEndpoint = endpointStore.endpoints.find(
      e =>
        deploymentStore.deploymentDetails &&
        e.id === deploymentStore.deploymentDetails.origin_endpoint_id
    );
    const destinationEndpoint = endpointStore.endpoints.find(
      e =>
        deploymentStore.deploymentDetails &&
        e.id === deploymentStore.deploymentDetails.destination_endpoint_id
    );

    if (
      !this.state.showEditModal ||
      !deploymentStore.deploymentDetails ||
      !destinationEndpoint ||
      !sourceEndpoint
    ) {
      return null;
    }

    return (
      <TransferItemModal
        type="deployment"
        isOpen
        onRequestClose={() => {
          this.closeEditModal();
        }}
        onUpdateComplete={url => {
          this.handleUpdateComplete(url);
        }}
        sourceEndpoint={sourceEndpoint}
        transfer={deploymentStore.deploymentDetails}
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
    const dropdownActions = [
      {
        label: "Cancel",
        disabled:
          this.getStatus() !== "RUNNING" &&
          this.getStatus() !== "AWAITING_MINION_ALLOCATIONS",
        hidden: this.getStatus() === "CANCELLING",
        action: () => {
          this.handleCancelDeploymentClick();
        },
      },
      {
        label: "Force Cancel",
        hidden: this.getStatus() !== "CANCELLING",
        action: () => {
          this.handleCancelDeploymentClick(true);
        },
      },
      {
        label: "Recreate Deployment",
        color: ThemePalette.primary,
        action: () => {
          this.handleRecreateClick();
        },
      },
      {
        label: "Delete Deployment",
        color: ThemePalette.alert,
        action: () => {
          this.handleDeleteDeploymentClick();
        },
      },
    ];

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
              statusPill={
                deploymentStore.deploymentDetails?.last_execution_status
              }
              itemTitle={getTransferItemTitle(
                deploymentStore.deploymentDetails
              )}
              itemType={this.getDeploymentScenarioItemType(
                deploymentStore.deploymentDetails
              )}
              itemDescription={deploymentStore.deploymentDetails?.description}
              backLink="/deployments"
              typeImage={this.getDeploymentScenarioTypeImage(
                deploymentStore.deploymentDetails
              )}
              dropdownActions={dropdownActions}
              alertInfoPill={this.getTransferTypePillShouldRed(
                deploymentStore.deploymentDetails
              )}
              primaryInfoPill={
                !this.getTransferTypePillShouldRed(
                  deploymentStore.deploymentDetails
                )
              }
            />
          }
          contentComponent={
            <DeploymentDetailsContent
              item={deploymentStore.deploymentDetails}
              itemId={this.props.match.params.id}
              instancesDetails={instanceStore.instancesDetails}
              instancesDetailsLoading={
                instanceStore.loadingInstancesDetails ||
                endpointStore.storageLoading ||
                providerStore.providersLoading
              }
              storageBackends={endpointStore.storageBackends}
              networks={networkStore.networks}
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
              endpoints={endpointStore.endpoints}
              page={this.props.match.params.page || ""}
              minionPools={minionPoolStore.minionPools}
              detailsLoading={
                deploymentStore.detailsLoading ||
                endpointStore.loading ||
                minionPoolStore.loadingMinionPools ||
                this.state.initialLoading
              }
              onDeleteDeploymentClick={() => {
                this.handleDeleteDeploymentClick();
              }}
              onShowExecutionClick={() => {
                this.handleShowExecutionClick();
              }}
            />
          }
        />
        <AlertModal
          isOpen={this.state.showDeleteDeploymentConfirmation}
          title="Delete Deployment?"
          message="Are you sure you want to delete this Deployment?"
          extraMessage="Deleting a Coriolis Deployment is permanent!"
          onConfirmation={() => {
            this.handleDeleteDeploymentConfirmation();
          }}
          onRequestClose={() => {
            this.handleCloseDeleteDeploymentConfirmation();
          }}
        />
        <AlertModal
          isOpen={this.state.showCancelConfirmation}
          title="Cancel Deployment?"
          message="Are you sure you want to cancel the Deployment?"
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
          title="Force Cancel Deployment?"
          message="Are you sure you want to force cancel the deployment?"
          extraMessage={`
The deployment is currently being cancelled.
Would you like to force its cancellation?
Note that this may lead to scheduled cleanup tasks being forcibly skipped, and thus manual cleanup of temporary resources on the source/destination platforms may be required.`}
          onConfirmation={() => {
            this.handleCancelConfirmation(true);
          }}
          onRequestClose={() => {
            this.handleCloseCancelConfirmation();
          }}
        />
        {this.state.showFromTransferModal ? (
          <Modal
            isOpen
            title="Recreate Deployment"
            onRequestClose={() => {
              this.handleCloseFromTransferModal();
            }}
          >
            <DeploymentOptions
              transferItem={deploymentStore.deploymentDetails}
              minionPools={minionPoolStore.minionPools}
              onCancelClick={() => {
                this.handleCloseFromTransferModal();
              }}
              onDeployClick={opts => {
                this.recreateFromTransfer(opts);
              }}
              instances={instanceStore.instancesDetails}
              loadingInstances={instanceStore.loadingInstancesDetails}
              defaultSkipOsMorphing={deploymentStore.getDefaultSkipOsMorphing(
                deploymentStore.deploymentDetails
              )}
              deploying={this.state.deploying}
            />
          </Modal>
        ) : null}
        {this.renderEditModal()}
      </Wrapper>
    );
  }
}

export default DeploymentDetailsPage;
