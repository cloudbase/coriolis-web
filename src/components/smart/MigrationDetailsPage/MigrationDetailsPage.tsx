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

import { getTransferItemTitle } from "@src/@types/MainItem";
import DetailsContentHeader from "@src/components/modules/DetailsModule/DetailsContentHeader";
import DetailsPageHeader from "@src/components/modules/DetailsModule/DetailsPageHeader";
import DetailsTemplate from "@src/components/modules/TemplateModule/DetailsTemplate";
import MigrationDetailsContent from "@src/components/modules/TransferModule/MigrationDetailsContent";
import ReplicaMigrationOptions from "@src/components/modules/TransferModule/ReplicaMigrationOptions";
import TransferItemModal from "@src/components/modules/TransferModule/TransferItemModal";
import { ThemePalette } from "@src/components/Theme";
import AlertModal from "@src/components/ui/AlertModal";
import Modal from "@src/components/ui/Modal";
import { providerTypes } from "@src/constants";
import endpointStore from "@src/stores/EndpointStore";
import instanceStore from "@src/stores/InstanceStore";
import migrationStore from "@src/stores/MigrationStore";
import minionPoolStore from "@src/stores/MinionPoolStore";
import networkStore from "@src/stores/NetworkStore";
import notificationStore from "@src/stores/NotificationStore";
import providerStore from "@src/stores/ProviderStore";
import userStore from "@src/stores/UserStore";
import configLoader from "@src/utils/Config";

import migrationImage from "./images/migration.svg";

import type { Field } from "@src/@types/Field";
import type { InstanceScript } from "@src/@types/Instance";
const Wrapper = styled.div<any>``;

type Props = {
  match: any;
  history: any;
};
type State = {
  showDeleteMigrationConfirmation: boolean;
  showCancelConfirmation: boolean;
  showForceCancelConfirmation: boolean;
  showEditModal: boolean;
  showFromReplicaModal: boolean;
  pausePolling: boolean;
  initialLoading: boolean;
  migrating: boolean;
};
@observer
class MigrationDetailsPage extends React.Component<Props, State> {
  state: State = {
    showDeleteMigrationConfirmation: false,
    showCancelConfirmation: false,
    showForceCancelConfirmation: false,
    showEditModal: false,
    showFromReplicaModal: false,
    pausePolling: false,
    initialLoading: true,
    migrating: false,
  };

  stopPolling: boolean | null = null;

  timeoutRef: any = null;

  componentDidMount() {
    document.title = "Migration Details";

    this.loadMigrationAndPollData();
  }

  UNSAFE_componentWillReceiveProps(newProps: any) {
    if (newProps.match.params.id === this.props.match.params.id) {
      return;
    }
    this.timeoutRef && clearTimeout(this.timeoutRef);
    migrationStore.cancelMigrationDetails();
    migrationStore.clearDetails();
    endpointStore.getEndpoints();
    this.loadMigrationAndPollData();
  }

  componentWillUnmount() {
    migrationStore.cancelMigrationDetails();
    migrationStore.clearDetails();
    this.stopPolling = true;
  }

  getStatus() {
    return migrationStore.migrationDetails?.last_execution_status;
  }

  async loadMigrationAndPollData() {
    const loadMigration = async () => {
      await endpointStore.getEndpoints({ showLoading: true });
      this.setState({ initialLoading: false });
      await this.loadMigrationWithInstances({
        migrationId: this.props.match.params.id,
        cache: true,
        onDetailsLoaded: async () => {
          const details = migrationStore.migrationDetails;
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
    await loadMigration();
    this.pollData();
  }

  async loadMigrationWithInstances(options: {
    migrationId: string;
    cache: boolean;
    onDetailsLoaded?: () => void;
  }) {
    await migrationStore.getMigration(options.migrationId, {
      showLoading: true,
    });
    const details = migrationStore.migrationDetails;
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

  handleDeleteMigrationClick() {
    this.setState({ showDeleteMigrationConfirmation: true });
  }

  handleDeleteMigrationConfirmation() {
    this.setState({ showDeleteMigrationConfirmation: false });
    this.props.history.push("/migrations");
    if (migrationStore.migrationDetails) {
      migrationStore.delete(migrationStore.migrationDetails.id);
    }
  }

  handleCloseDeleteMigrationConfirmation() {
    this.setState({ showDeleteMigrationConfirmation: false });
  }

  handleCancelMigrationClick(force?: boolean) {
    if (force) {
      this.setState({ showForceCancelConfirmation: true });
    } else {
      this.setState({ showCancelConfirmation: true });
    }
  }

  handleRecreateClick() {
    if (!migrationStore.migrationDetails?.replica_id) {
      this.setState({ showEditModal: true, pausePolling: true });
      return;
    }
    this.setState({ showFromReplicaModal: true, pausePolling: true });
  }

  handleCloseFromReplicaModal() {
    this.setState({ showFromReplicaModal: false, pausePolling: false });
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
    if (!migrationStore.migrationDetails) {
      return;
    }
    await migrationStore.cancel(migrationStore.migrationDetails.id, force);
    if (force) {
      notificationStore.alert("Force Canceled", "success");
    } else {
      notificationStore.alert("Canceled", "success");
    }
  }

  async recreateFromReplica(opts: {
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
    const replicaId = migrationStore.migrationDetails?.replica_id;
    if (!replicaId) {
      return;
    }

    this.setState({ migrating: true });
    try {
      const migration = await this.migrate({
        replicaId,
        fields,
        uploadedUserScripts,
        removedUserScripts,
        minionPoolMappings,
      });
      this.props.history.push(`/migrations/${migration.id}/tasks`);
    } finally {
      this.setState({ migrating: false });
    }
    this.handleCloseFromReplicaModal();
  }

  async migrate(opts: {
    replicaId: string;
    fields: Field[];
    uploadedUserScripts: InstanceScript[];
    removedUserScripts: InstanceScript[];
    minionPoolMappings: { [instance: string]: string };
  }) {
    const {
      replicaId,
      fields,
      uploadedUserScripts,
      removedUserScripts,
      minionPoolMappings,
    } = opts;
    const migration = await migrationStore.migrateReplica({
      replicaId,
      fields,
      uploadedUserScripts,
      removedUserScripts,
      userScriptData: migrationStore.migrationDetails?.user_scripts,
      minionPoolMappings,
    });
    return migration;
  }

  async pollData() {
    if (this.state.pausePolling || this.stopPolling) {
      return;
    }
    await migrationStore.getMigration(this.props.match.params.id, {
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

  handleEditReplicaReload() {
    this.loadMigrationWithInstances({
      migrationId: this.props.match.params.id,
      cache: false,
    });
  }

  handleUpdateComplete(redirectTo: string) {
    this.props.history.push(redirectTo);
  }

  renderEditModal() {
    const sourceEndpoint = endpointStore.endpoints.find(
      e =>
        migrationStore.migrationDetails &&
        e.id === migrationStore.migrationDetails.origin_endpoint_id
    );
    const destinationEndpoint = endpointStore.endpoints.find(
      e =>
        migrationStore.migrationDetails &&
        e.id === migrationStore.migrationDetails.destination_endpoint_id
    );

    if (
      !this.state.showEditModal ||
      !migrationStore.migrationDetails ||
      !destinationEndpoint ||
      !sourceEndpoint
    ) {
      return null;
    }

    return (
      <TransferItemModal
        type="migration"
        isOpen
        onRequestClose={() => {
          this.closeEditModal();
        }}
        onUpdateComplete={url => {
          this.handleUpdateComplete(url);
        }}
        sourceEndpoint={sourceEndpoint}
        replica={migrationStore.migrationDetails}
        destinationEndpoint={destinationEndpoint}
        instancesDetails={instanceStore.instancesDetails}
        instancesDetailsLoading={instanceStore.loadingInstancesDetails}
        networks={networkStore.networks}
        networksLoading={networkStore.loading}
        onReloadClick={() => {
          this.handleEditReplicaReload();
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
          this.handleCancelMigrationClick();
        },
      },
      {
        label: "Force Cancel",
        hidden: this.getStatus() !== "CANCELLING",
        action: () => {
          this.handleCancelMigrationClick(true);
        },
      },
      {
        label: "Recreate Migration",
        color: ThemePalette.primary,
        action: () => {
          this.handleRecreateClick();
        },
      },
      {
        label: "Delete Migration",
        color: ThemePalette.alert,
        action: () => {
          this.handleDeleteMigrationClick();
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
                migrationStore.migrationDetails?.last_execution_status
              }
              itemTitle={getTransferItemTitle(migrationStore.migrationDetails)}
              itemType="migration"
              itemDescription={migrationStore.migrationDetails?.description}
              backLink="/migrations"
              typeImage={migrationImage}
              dropdownActions={dropdownActions}
              primaryInfoPill
            />
          }
          contentComponent={
            <MigrationDetailsContent
              item={migrationStore.migrationDetails}
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
                migrationStore.detailsLoading ||
                endpointStore.loading ||
                minionPoolStore.loadingMinionPools ||
                this.state.initialLoading
              }
              onDeleteMigrationClick={() => {
                this.handleDeleteMigrationClick();
              }}
            />
          }
        />
        <AlertModal
          isOpen={this.state.showDeleteMigrationConfirmation}
          title="Delete Migration?"
          message="Are you sure you want to delete this migration?"
          extraMessage="Deleting a Coriolis Migration is permanent!"
          onConfirmation={() => {
            this.handleDeleteMigrationConfirmation();
          }}
          onRequestClose={() => {
            this.handleCloseDeleteMigrationConfirmation();
          }}
        />
        <AlertModal
          isOpen={this.state.showCancelConfirmation}
          title="Cancel Migration?"
          message="Are you sure you want to cancel the migration?"
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
          title="Force Cancel Migration?"
          message="Are you sure you want to force cancel the migration?"
          extraMessage={`
The migration is currently being cancelled.
Would you like to force its cancellation?
Note that this may lead to scheduled cleanup tasks being forcibly skipped, and thus manual cleanup of temporary resources on the source/destination platforms may be required.`}
          onConfirmation={() => {
            this.handleCancelConfirmation(true);
          }}
          onRequestClose={() => {
            this.handleCloseCancelConfirmation();
          }}
        />
        {this.state.showFromReplicaModal ? (
          <Modal
            isOpen
            title="Recreate Migration from Replica"
            onRequestClose={() => {
              this.handleCloseFromReplicaModal();
            }}
          >
            <ReplicaMigrationOptions
              transferItem={migrationStore.migrationDetails}
              minionPools={minionPoolStore.minionPools}
              onCancelClick={() => {
                this.handleCloseFromReplicaModal();
              }}
              onMigrateClick={opts => {
                this.recreateFromReplica(opts);
              }}
              instances={instanceStore.instancesDetails}
              loadingInstances={instanceStore.loadingInstancesDetails}
              defaultSkipOsMorphing={migrationStore.getDefaultSkipOsMorphing(
                migrationStore.migrationDetails
              )}
              migrating={this.state.migrating}
            />
          </Modal>
        ) : null}
        {this.renderEditModal()}
      </Wrapper>
    );
  }
}

export default MigrationDetailsPage;
