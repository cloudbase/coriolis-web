/*
Copyright (C) 2022  Cloudbase Solutions SRL
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

import DetailsTemplate from "@src/components/modules/TemplateModule/DetailsTemplate";
import DetailsPageHeader from "@src/components/modules/DetailsModule/DetailsPageHeader";
import DetailsContentHeader from "@src/components/modules/DetailsModule/DetailsContentHeader";
import AlertModal from "@src/components/ui/AlertModal";

import { ThemePalette } from "@src/components/Theme";
import type { WizardData } from "@src/@types/WizardData";

import metalHubStore from "@src/stores/MetalHubStore";
import userStore from "@src/stores/UserStore";
import MetalHubServerDetailsContent from "@src/components/modules/MetalHubModule/MetalHubServerDetailsContent";
import instanceSource from "@src/sources/InstanceSource";
import notificationStore from "@src/stores/NotificationStore";
import { wizardPages } from "@src/constants";
import { DropdownAction } from "@src/components/ui/Dropdowns/ActionDropdown";
import instanceStore from "@src/stores/InstanceStore";
import MetalHubModal from "@src/components/modules/MetalHubModule/MetalHubModal";
import serverImage from "./images/server.svg";

const Wrapper = styled.div<any>``;

type Props = {
  match: { params: { id: string } };
  history: any;
};
type State = {
  showDeleteServerAlert: boolean;
  creatingReplica: boolean;
  creatingMigration: boolean;
  showEditServerModal: boolean;
  updatingServer: boolean;
};
@observer
class MetalHubServerDetailsPage extends React.Component<Props, State> {
  state: State = {
    showDeleteServerAlert: false,
    creatingReplica: false,
    creatingMigration: false,
    showEditServerModal: false,
    updatingServer: false,
  };

  componentDidMount() {
    document.title = "Bare Metal Server Details";

    this.loadData();
  }

  componentWillUnmount() {
    metalHubStore.clearServerDetails();
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case "signout":
        userStore.logout();
        break;
      default:
    }
  }

  async handleDeleteConfirmation() {
    this.setState({ showDeleteServerAlert: false });

    await metalHubStore.deleteServer(metalHubStore.serverDetails!.id);
    this.props.history.push("/bare-metal-servers");
  }

  handleRefresh() {
    metalHubStore.refreshServer(metalHubStore.serverDetails!.id);
  }

  handleDeleteServerClick() {
    this.setState({ showDeleteServerAlert: true });
  }

  async loadData() {
    const serverId = Number(this.props.match.params.id);
    await metalHubStore.getServerDetails(serverId);
    if (!metalHubStore.serverDetails) {
      this.props.history.push("/bare-metal-servers");
    }
  }

  async handleCreate(type: "replica" | "migration") {
    const endpoint = await metalHubStore.getMetalHubEndpoint();

    // Remove the instances for cache so that the wizard has the latest data before it's shown
    instanceSource.removeInstancesFromCache(endpoint.id);
    await instanceStore.loadInstancesInChunks({
      endpoint,
      vmsPerPage: Infinity,
    });
    const instance = instanceStore.backgroundInstances.find(
      i => String(i.id) === String(metalHubStore.serverDetails?.id)
    );
    if (!instance) {
      notificationStore.alert(
        `Could not find instance ID ${metalHubStore.serverDetails?.id} on endpoint '${endpoint.name}'`,
        "error"
      );
      throw new Error("Instance not found");
    }
    const data: WizardData = {
      source: endpoint,
      selectedInstances: [instance],
    };
    this.props.history.push(
      `/wizard/${type}/?d=${window.btoa(
        JSON.stringify({
          data,
          currentPage: wizardPages.find(p => p.id === "target"),
        })
      )}`
    );
  }

  async handleCreateReplicaClick() {
    this.setState({ creatingReplica: true });
    try {
      await this.handleCreate("replica");
    } catch (err) {
      this.setState({ creatingReplica: false });
    }
  }

  async handleCreateMigrationClick() {
    this.setState({ creatingMigration: true });
    try {
      await this.handleCreate("migration");
    } catch (err) {
      this.setState({ creatingMigration: false });
    }
  }

  async handleEditServer(apiEndpoint: string) {
    this.setState({ updatingServer: true });
    await metalHubStore.patchServer(
      metalHubStore.serverDetails!.id,
      apiEndpoint
    );
    await this.loadData();
    this.setState({ showEditServerModal: false, updatingServer: false });
  }

  render() {
    const creating = this.state.creatingReplica || this.state.creatingMigration;
    const dropdownActions: DropdownAction[] = [
      {
        label: "Create Replica",
        action: () => {
          this.handleCreateReplicaClick();
        },
        color: ThemePalette.primary,
        disabled: creating || !metalHubStore.serverDetails?.active,
      },
      {
        label: "Create Migration",
        color: ThemePalette.primary,
        action: () => {
          this.handleCreateMigrationClick();
        },
        disabled: creating || !metalHubStore.serverDetails?.active,
      },
      {
        label: "Edit",
        action: () => {
          this.setState({ showEditServerModal: true });
        },
        disabled: creating || !metalHubStore.serverDetails,
      },
      {
        label: "Refresh",
        action: () => {
          this.handleRefresh();
        },
        disabled: creating || !metalHubStore.serverDetails,
      },
      {
        label: "Remove Server",
        color: ThemePalette.alert,
        action: () => {
          this.handleDeleteServerClick();
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
              itemTitle={metalHubStore.serverDetails?.hostname || "No Hostname"}
              itemType="server"
              backLink="/bare-metal-servers"
              dropdownActions={dropdownActions}
              typeImage={serverImage}
            />
          }
          contentComponent={
            <MetalHubServerDetailsContent
              server={metalHubStore.serverDetails}
              loading={
                metalHubStore.loadingServerDetails ||
                metalHubStore.refreshingServer
              }
              creatingReplica={this.state.creatingReplica}
              creatingMigration={this.state.creatingMigration}
              onCreateReplicaClick={() => {
                this.handleCreateReplicaClick();
              }}
              onCreateMigrationClick={() => {
                this.handleCreateMigrationClick();
              }}
              onDeleteClick={() => this.handleDeleteServerClick()}
            />
          }
        />
        {this.state.showDeleteServerAlert ? (
          <AlertModal
            isOpen
            title="Remove Bare Metal Server?"
            message="Are you sure you want to remove this server?"
            extraMessage="By removing a server from the hub, Coriolis will not be able to migrate it or do any other replica executions of it."
            onConfirmation={() => {
              this.handleDeleteConfirmation();
            }}
            onRequestClose={() => {
              this.setState({ showDeleteServerAlert: false });
            }}
          />
        ) : null}
        {this.state.showEditServerModal ? (
          <MetalHubModal
            loading={this.state.updatingServer}
            server={metalHubStore.serverDetails!}
            onEditClick={e => {
              this.handleEditServer(e);
            }}
            onRequestClose={() => {
              this.setState({ showEditServerModal: false });
            }}
          />
        ) : null}
      </Wrapper>
    );
  }
}

export default MetalHubServerDetailsPage;
